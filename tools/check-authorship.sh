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
# A fourth check covers the commit MESSAGE: session URLs and attribution trailers. It was
# added after a `Claude-Session:` trailer reached a published commit while this script
# reported clean - the trailer name was not in TRAILERS, and a bare URL in a message body
# is not a trailer at all, so neither existing check could see it. It is scoped to
# attribution positions, never to vocabulary: a commit message may discuss an assistant,
# a vendor or this policy itself, which several in this history do.
#
# Usage:
#   tools/check-authorship.sh                 # commits not yet on the upstream branch
#   tools/check-authorship.sh <range>         # an explicit range, e.g. HEAD~20..HEAD
#   tools/check-authorship.sh --all           # every commit on every ref
#   tools/check-authorship.sh --msg <file>    # one message file, for a commit-msg hook
#
# --skip-message-policy suppresses the message check only. It exists for the full-history
# pass in CI: one published commit predates the policy, and a scan that fails on it forever
# would be switched off within a week. New commits are checked by range instead.
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

# --- commit-message policy --------------------------------------------------------
# Three patterns, each deliberately narrow, because the cost of a false positive here is
# that someone disables the guard.
#
# SESSION_RE  a link back to an assistant session. Unambiguous machine output: it can be
#             matched anywhere in a message because no one writes one in prose.
# MSG_TRAILER trailer NAMES that are prohibited whatever their value. A trailer is a
#             structured assertion about how the commit came to exist, so the name alone
#             is the violation; `Co-authored-by:` stays out of this list because a human
#             co-author is legitimate and is already checked by value above.
# ATTRIB_RE   attribution sentences. Anchored to "generated by/with <assistant>" and to a
#             standalone AI-generated claim, so a message may still say that a page must
#             not look AI-generated, or name a vendor when discussing this very check.
SESSION_RE='claude\.ai/code/session|https?://[a-z0-9.-]+/code/session_|/session_[A-Za-z0-9]{16,}'
MSG_TRAILER='^[[:space:]]*(claude-session|[a-z]+-session|generated-by|generated-with|ai-generated|model|assistant)[[:space:]]*:'
#
# bash's =~ is POSIX ERE, where a backslash-b is not a word boundary. An earlier revision of this
# line carried two literal backspace characters where a word boundary was intended, and
# `Co-Authored-By: Claude` passed the hook while the range scan caught it. Boundaries are
# spelled with character classes here for that reason.
ATTRIB_RE='generated (by|with) (claude|chatgpt|copilot|gemini|an?[[:space:]]+ai([[:space:]]|$)|anthropic|openai)|^[[:space:]]*(this (commit|change) (is|was) )?ai-generated[[:space:]]*\.?[[:space:]]*$'

# The trailer rule, defined once. The range scan and the hook both use it, so a message
# rejected before a commit is made is rejected afterwards for the same reason.
TRAILER_RE="^[[:space:]]*(${TRAILERS}):"

# A shared matcher so the hook and the history scan cannot drift apart. Prints each
# violating line; returns 1 if the message violates the policy.
check_message() {
  local sha="$1" body="$2" bad=0 line
  while IFS= read -r line; do
    line="${line%$'
'}"
    if [[ $line =~ $SESSION_RE ]]; then
      echo "FAIL ${sha} assistant session link in commit message: ${line}"; bad=1
    elif [[ $line =~ $MSG_TRAILER ]]; then
      echo "FAIL ${sha} prohibited attribution trailer: ${line}"; bad=1
    elif [[ $line =~ $ATTRIB_RE ]]; then
      echo "FAIL ${sha} AI attribution statement: ${line}"; bad=1
    elif [[ $line =~ $TRAILER_RE ]] && [[ ${line#*:} =~ $FORBIDDEN ]]; then
      echo "FAIL ${sha} AI attribution trailer: ${line}"; bad=1
    fi
  done <<< "$body"
  return $bad
}

skip_messages=0
args=()
for arg in "$@"; do
  case "$arg" in
    --skip-message-policy) skip_messages=1 ;;
    *) args+=("$arg") ;;
  esac
done
set -- ${args+"${args[@]}"}

# --- single message file, for the commit-msg hook ---------------------------------
# The hook runs before the commit object exists, so there is no range to scan. Comment
# lines are dropped first: git's own template explains the trailer policy in them and
# they never reach the stored message.
if [ "${1:-}" = "--msg" ]; then
  [ -n "${2:-}" ] || { echo "FAIL --msg needs a message file" >&2; exit 2; }
  [ -f "$2" ] || { echo "FAIL no such message file: $2" >&2; exit 2; }
  body=$(grep -v '^#' "$2" || true)
  if check_message "message" "$body"; then
    exit 0
  fi
  cat <<'MSG' >&2

The commit message asserts AI authorship or links an assistant session.

Remove the trailer or link and commit again. Describe what changed and why; how the
change was produced is not part of the record this repository publishes.

This checks the message only. Prose that discusses an assistant, a vendor, or this
policy is unaffected.
MSG
  exit 1
fi

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
fail_msg=0

# --- identities -------------------------------------------------------------------
# One record per commit so a match can be reported against the commit that carries it.
#
# Records are NUL-terminated by -z and fields split on US (0x1f), rather than both on a
# printable character. The previous format was %H|%an|%ae|%cn|%ce, and a pipe in a name
# shifted every field after it: "Jane | Doe" was read as an="Jane ", ae=" Doe",
# cn="jane@example.com". Detection survived that only by accident - read assigns the
# unsplit remainder to the last variable, so the displaced text was still tested as part
# of $ce - but every diagnostic named the wrong field, which is what a reader acts on.
# Neither delimiter can appear in an ident: git rejects NUL outright and strips control
# characters below 0x20 when building one.
while IFS=$'\x1f' read -r -d '' sha an ae cn ce; do
  [ -z "${sha:-}" ] && continue
  for field in "$an" "$ae" "$cn" "$ce"; do
    if [[ $field =~ $FORBIDDEN ]]; then
      echo "FAIL ${sha:0:9} AI identity in commit metadata: '${field}'"
      echo "     author=${an} <${ae}>  committer=${cn} <${ce}>"
      fail=1; fail_meta=1
    fi
  done
done < <(git log -z --format="%H%x1f%an%x1f%ae%x1f%cn%x1f%ce" $revs 2>/dev/null)

# --- trailers ---------------------------------------------------------------------
# Only the value side of a trailer is tested. "Co-authored-by: Jane <jane@example.com>"
# is fine; the same trailer naming an assistant is not.
#
# One `git log` for the whole range, not one per commit. The nested form this replaces
# ran `git log -1` plus a grep for every commit, so the cost grew with history length
# and an --all scan of 824 commits took over two minutes. Commits are delimited by a
# leading SOH, which cannot occur in a commit message body.
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

# --- commit messages --------------------------------------------------------------
# Range-scoped, like the trailer check above and for the same reason: it is a statement
# about the commits being added, not about the tree. One published commit predates this
# policy, so CI runs the full-history pass with --skip-message-policy and checks new
# commits by range. See the header.
if [ "$skip_messages" -eq 0 ]; then
  sha=""
  body=""
  flush() {
    [ -z "$sha" ] && return 0
    check_message "${sha:0:9}" "$body" || { fail=1; fail_msg=1; }
  }
  while IFS= read -r line; do
    line="${line%$'
'}"
    if [ "${line:0:1}" = $'' ]; then
      flush
      sha="${line:1}"
      body=""
      continue
    fi
    body+="${line}"$'
'
  done < <(git log --format="%x01%H%n%B" $revs 2>/dev/null)
  flush
fi

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

if [ "$fail_msg" -ne 0 ]; then
  cat <<'MSG'

A commit message asserts AI authorship or links an assistant session.

Rewrite the message rather than the identity:
  git commit --amend                           # for the most recent commit
  git rebase -i <base>                         # reword an older one, if it is unpushed

Only the message is read. Prose that discusses an assistant, a vendor, or this policy
is unaffected -- what fails is a trailer or a session link.
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
