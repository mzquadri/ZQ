#!/usr/bin/env python3
"""Fail the build if machine-written punctuation reaches published text.

One rule, one implementation, used by the CV, the GitHub profile, the website
and the LinkedIn copy, so that the four cannot drift apart. The CV enforces it
on the *extracted text of the PDF*; everything else enforces it on source
files, because that is where the characters are typed.

What is banned and why: an em or en dash, an arrow, a multiplication or
comparison sign, a bullet glyph, a middle dot, an ellipsis character, a
superscript digit, a Greek letter, and curly quotation marks. These are the
marks that read as generated rather than written. A date range takes a plain
hyphen; "times" and "to" and "at least" are words.

What is NOT banned: letters with diacritics. Guennemann is spelled Gunnemann
with an umlaut because that is the man's name, and a name is not punctuation.

    python check_characters.py README.md src/**/*.ts
    python check_characters.py --ext .md,.mdx,.ts,.tsx src content

Exit code 1 if anything is found, so it drops straight into a build script or
a pre-commit hook.
"""

from __future__ import annotations

import sys
from pathlib import Path

BANNED = {
    "—": "em dash",
    "–": "en dash",
    "→": "arrow",
    "←": "left arrow",
    "×": "multiplication sign",
    "≥": "greater-or-equal",
    "≤": "less-or-equal",
    "≈": "approximately",
    "±": "plus-minus",
    "“": "left double quote",
    "”": "right double quote",
    "‘": "left single quote",
    "’": "right single quote",
    "•": "bullet glyph",
    "·": "middle dot",
    "…": "ellipsis",
    "²": "superscript two",
    "³": "superscript three",
    "‐": "non-ASCII hyphen",
    "‑": "non-breaking hyphen",
    "−": "minus sign",
}
BANNED.update({c: "Greek letter" for c in "αβγδεζη"
                                          "θλμνπρσ"
                                          "τφχψωΣΩΔ"})

DEFAULT_EXTS = (".md", ".mdx", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".yml", ".yaml", ".html")
SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", "__pycache__", ".venv", "venv"}
# Fetched data, not authored copy. A paper title belongs to its author, and
# rewriting a Greek letter out of one would misquote them.
SKIP_FILES = {"research-feed.json"}


def walk(target: Path, exts: tuple[str, ...]):
    if target.is_file():
        yield target
        return
    for p in target.rglob("*"):
        if (p.is_file() and p.suffix in exts and not SKIP_DIRS & set(p.parts)
                and p.name not in SKIP_FILES):
            yield p


def main(argv: list[str]) -> int:
    exts = DEFAULT_EXTS
    args = []
    for a in argv:
        if a.startswith("--ext="):
            exts = tuple(e if e.startswith(".") else "." + e for e in a.split("=", 1)[1].split(","))
        else:
            args.append(a)
    targets = [Path(a) for a in args] or [Path(".")]

    findings: list[str] = []
    checked = 0
    for target in targets:
        for path in walk(target, exts):
            checked += 1
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            for lineno, line in enumerate(text.splitlines(), 1):
                # An escape hatch for the rare line where the character is part
                # of a regular expression rather than prose. It has to be typed
                # deliberately, on the line itself, so it cannot be inherited.
                if "check-characters: allow" in line:
                    continue
                for ch in set(line) & BANNED.keys():
                    # The name, not the character. Printing the offending
                    # character itself crashed the run on a Windows console in
                    # cp1252, which is exactly the terminal this has to work in.
                    findings.append(f"{path}:{lineno}: {BANNED[ch]} U+{ord(ch):04X}")

    if findings:
        print(f"{len(findings)} banned character(s) in {checked} files:")
        for f in findings[:80]:
            print("  " + f)
        if len(findings) > 80:
            print(f"  ... and {len(findings) - 80} more")
        return 1
    print(f"no banned characters in {checked} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
