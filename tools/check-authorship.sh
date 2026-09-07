#!/usr/bin/env bash
#
# Reject AI-assistant attribution in commit metadata.
#
# The rule this enforces is narrow and worth stating precisely, because the obvious
# implementation gets it wrong: it inspects **Git metadata only** - author identity,
# committer identity, and the trailer block of the commit message. It never looks at
# file content.
#
# That distinction is the whole design. A NOTICE file naming "Anthropic, PBC" as the
# copyright holder of an MIT-licensed dependency is a legal requirement, not a claim that
# an assistant contributed to this repository. A guard that grepped the working tree would
# fail on exactly the file that licence compliance requires, and the usual response to a
# guard that cries wolf is to delete the guard. So:
#
#   checked      author name/email, committer name/email, and Co-authored-by /
#                Signed-off-by / Assisted-by / Generated-by / Created-by trailer VALUES
#   not checked  source files, documentation, dependency manifests, NOTICE, licences
#
# Human co-authors pass. Upstream attribution passes. Documentation discussing an AI
# vendor passes. What fails is an assistant being recorded as having authored the work.
#
# A third check covers tracked assistant CONFIGURATION - CLAUDE.md, .claude/, .cursorrules
# and friends. It exists because the identity and trailer checks cannot see them: a
# committed CLAUDE.md carries no attribution metadata at all, so it passed this guard for
# the whole time it sat in the repository root. It matches PATHS, never content, which is
# what keeps the NOTICE exemption above intact - a file may discuss any vendor it likes,
# but a tool's own config file is not part of this work and is not published with it.
# These paths are covered by a global core.excludesFile, so a hit here means something
# bypassed the ignore rules, usually `git add -f`.
#
# Usage:
#   tools/check-authorship.sh                 # commits not yet on the upstream branch
#   tools/check-authorship.sh <range>         # an explicit range, e.g. HEAD~20..HEAD
#   tools/check-authorship.sh --all           # every commit on every ref
#
# Install as a pre-push hook - via a wrapper, not a symlink. Git passes the remote name
# as $1, which this script reads as a rev range, so a direct symlink checks "origin" -
# the commits already pushed - and never the ones being pushed. The wrapper drops the
# arguments so the default range applies:
#
#   printf '#!/usr/bin/env bash\nexec "$(git rev-parse --show-toplevel)/tools/check-authorship.sh"\n' \
#     > .git/hooks/pre-push && chmod +x .git/hooks/pre-push
#
set -euo pipefail

# Matching runs through bash's own =~ rather than a piped grep. The obvious spelling,
# `printf '%s' "$field" | grep -qiE "$FORBIDDEN"`, costs two processes per test, which
# came to roughly five thousand of them on an 824-commit history and over two minutes
# on Windows, where process creation is expensive. =~ is in-process. nocasematch is what
# makes it case-insensitive, standing in for grep's -i.
shopt -s nocasematch

# Identities that must never appear as an author, committer or co-author of this work.
# Matched case-insensitively against the identity string, not against file content.
FORBIDDEN='claude|anthropic|copilot|chatgpt|openai|gpt-[0-9]|\bai[ -]assistant\b|\bbot\b'

# Trailers that assert authorship or contribution.
TRAILERS='co-authored-by|signed-off-by|assisted-by|generated-by|created-by|authored-with|contributor'

# Assistant configuration that must never be tracked. Matched against tracked PATHS only,
# anchored so a directory named .claude/ is caught anywhere in the tree while a source file
# that merely mentions a vendor is not. Extend this list, not FORBIDDEN, for new tools -
# FORBIDDEN is vocabulary and would false-positive on licence text.
FORBIDDEN_PATHS='(^|/)(CLAUDE(\.local)?\.md|AGENTS\.md|\.mcp\.json|\.cursorrules|\.windsurfrules|copilot-instructions\.md|\.aider[^/]*)$|(^|/)\.(claude|cursor|continue|aider)/'

range="${1:-}"
if [ "$range" = "--all" ]; then
  revs="--all"
elif [ -n "$range" ]; then
  revs="$range"
else
  # Default: whatever this branch adds on top of its upstream. Falls back to the whole
  # history on a branch with no upstream, which is the right answer for a first push.
  if upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
    revs="${upstream}..HEAD"
  else
    revs="HEAD"
  fi
fi

# A range that does not resolve must not read as "nothing to check". Both loops below
# redirect stderr and yield no commits on a bad range, and the summary counted with a
# `|| echo 0` fallback, so an unresolvable range printed "authorship clean: 0 commit(s)"
# and exited 0. Silent success is the one result a guard may not produce, so resolve the
# range once, up front, and fail loudly if it does not.
if ! count=$(git rev-list --count $revs 2>/dev/null); then
  echo "FAIL cannot resolve revision range: ${revs}" >&2
  echo "     Nothing was checked. Pass a range that exists, or --all." >&2
  exit 2
fi

fail=0
fail_meta=0
fail_paths=0

# --- identities -------------------------------------------------------------------
# One record per commit so a match can be reported against the commit that carries it.
while IFS='|' read -r sha an ae cn ce; do
  [ -z "${sha:-}" ] && continue
  for field in "$an" "$ae" "$cn" "$ce"; do
    if [[ $field =~ $FORBIDDEN ]]; then
      echo "FAIL ${sha:0:9} AI identity in commit metadata: '${field}'"
      echo "     author=${an} <${ae}>  committer=${cn} <${ce}>"
      fail=1; fail_meta=1
    fi
  done
done < <(git log --format='%H|%an|%ae|%cn|%ce' $revs 2>/dev/null)

# --- trailers ---------------------------------------------------------------------
# Only the value side of a trailer is tested. "Co-authored-by: Jane <jane@example.com>"
# is fine; the same trailer naming an assistant is not.
#
# One `git log` for the whole range, not one per commit. The nested form this replaces
# ran `git log -1` plus a grep for every commit, so the cost grew with history length
# and an --all scan of 824 commits took over two minutes. Commits are delimited by a
# leading SOH, which cannot occur in a commit message body.
TRAILER_RE="^[[:space:]]*(${TRAILERS}):"
sha=""
while IFS= read -r line; do
  line="${line%$'\r'}"
  if [ "${line:0:1}" = $'\x01' ]; then
    sha="${line:1}"
    continue
  fi
  [[ $line =~ $TRAILER_RE ]] || continue
  value="${line#*:}"
  if [[ $value =~ $FORBIDDEN ]]; then
    echo "FAIL ${sha:0:9} AI attribution trailer: ${line}"
    fail=1; fail_meta=1
  fi
done < <(git log --format="%x01%H%n%B" $revs 2>/dev/null)

# --- tooling artifacts ------------------------------------------------------------
# Tested against the tracked tree rather than the commit range, deliberately. A config
# file committed once stays tracked forever while every later range comes back clean, so
# a range-scoped test reports "clean" on a repository that is still publishing the file.
artifacts=$(git ls-files | grep -iE "$FORBIDDEN_PATHS" || true)
if [ -n "$artifacts" ]; then
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    echo "FAIL tracked assistant configuration: ${path}"
  done <<< "$artifacts"
  fail=1; fail_paths=1
fi

if [ "$fail_meta" -ne 0 ]; then
  cat <<'MSG'

Commit metadata records an AI assistant as an author, committer or co-author.

Fix the identity rather than the wording:
  git commit --amend --reset-author            # for the most recent commit
  git rebase -i <base> --exec 'git commit --amend --reset-author --no-edit'

This check reads Git metadata only. It does not read file content, so upstream
copyright notices and documentation that discusses an AI vendor are unaffected.
MSG
fi

if [ "$fail_paths" -ne 0 ]; then
  cat <<'MSG'

Assistant configuration is tracked in this repository. These files are the tool's,
not the work's, and are covered by a global core.excludesFile - so being tracked
means the ignore rules were bypassed, usually by `git add -f` or by a commit made
before the rule existed.

Untrack them, keeping your local copies:
  git rm --cached -r <path>

Verify the ignore rule is actually in effect:
  git check-ignore -v <path>

Paths are matched, never file content, so a source file or NOTICE that names an AI
vendor is unaffected.
MSG
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

tracked=$(git ls-files | wc -l | tr -d ' ')
echo "authorship clean: ${count} commit(s) checked in ${revs}; ${tracked} tracked path(s) checked"
