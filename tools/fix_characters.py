#!/usr/bin/env python3
"""Rewrite the banned characters into plain English and plain ASCII.

Not a blind find-and-replace: an em dash joining two independent clauses needs a
semicolon or a full stop, and one introducing an appositive needs a comma, so
the clause after the dash is inspected before a replacement is chosen. The
others are fixed substitutions, listed here with the reading they assume:

    R2, m3/s        superscript digits, in units and metric names
    rho, sigma      Greek letters, spelled as the words a reader says aloud
    x               the multiplication sign in tensor shapes, "32 x 32"
    to              arrows and en-dash ranges, "0.167 to 0.556"
    plus or minus   the plus-minus sign
    about           the approximately sign
    ...             the ellipsis character
    -               the minus sign and the non-ASCII hyphens
    '               curly quotes
    , or |          the middle dot, as a separator or inside a formula

A line carrying the marker `check-characters: allow` is left alone, for the one
place the character is part of a regular expression rather than prose.

    python tools/fix_characters.py src content
    python tools/fix_characters.py --dry-run src content
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_characters import walk  # noqa: E402

EXTS = (".ts", ".tsx", ".md", ".mdx")
ALLOW = "check-characters: allow"

# A clause that can stand on its own needs a semicolon, not a comma. The test is
# a pronoun or dummy subject followed by a finite verb, which covers the shapes
# that actually occur here ("it is how much", "nothing crashes", "they only see").
INDEPENDENT = re.compile(
    r"^(it|they|we|you|i|this|that|there|nothing|none|he|she|its|their)\s+"
    r"(is|was|are|were|does|do|did|has|have|had|will|would|can|could|cannot|"
    r"only|just|never|still|always|changes|crashes|reads|looks|means|depends|"
    r"moves|removes|sits|needs|happens|turns|describes|requires|works|comes|"
    r"goes|covers|holds|gets|makes|takes|stays|runs|fails|breaks)\b",
    re.IGNORECASE,
)

SIMPLE: list[tuple[str, str]] = [
    # Units and names first, so the bare-character rules do not reach them.
    ("m³/s", "m3/s"),
    ("R²", "R2"),
    ("²", "2"),
    ("³", "3"),
    ("ρ", "rho"),
    ("σ", "sigma"),
    ("≈", "about "),
    ("…", "..."),
    ("−", "-"),
    ("‐", "-"),
    ("‑", "-"),
    ("’", "'"),
    ("‘", "'"),
    ("“", '"'),
    ("”", '"'),
    ("±", "plus or minus "),
    (" × ", " x "),
    ("×", "x"),
    (" → ", " to "),
    ("→", " to "),
    ("← ", ""),
    ("←", ""),
]


def fix_em_dash(text: str) -> str:
    """Replace em dashes by what the clause after them needs."""
    # A lone dash used as "no value" in a table cell.
    text = text.replace('"—"', '"-"')
    text = text.replace("—{\" \"}", ",{\" \"}")

    # One dash at a time, left to right, because the decision needs the whole
    # clause that follows it and a line can carry a parenthetical pair. An
    # earlier version used a single non-greedy regex; it matched exactly one
    # character after the dash, so the clause test never saw more than "i" and
    # every dash became a comma, including the ones joining two independent
    # clauses. "The symptom is not an error, it is a consumer that looks
    # healthy" is a comma splice.
    while "—" in text:
        head, _, tail = text.partition("—")
        after = tail.lstrip()
        joiner = "; " if INDEPENDENT.match(after) else ", "
        text = head.rstrip() + joiner + after
    return text


def fix_middle_dot(text: str) -> str:
    """A separator becomes a comma; inside a formula it becomes a star."""
    text = re.sub(r"\s·\s", ", ", text)
    return text.replace("·", "*")


def fix_en_dash(text: str) -> str:
    """A numeric range reads "to"; a compound term takes a plain hyphen."""
    text = re.sub(r"(?<=\d)\s*–\s*(?=\d)", " to ", text)
    return text.replace("–", "-")


def fix(text: str) -> str:
    out = []
    for line in text.split("\n"):
        if ALLOW in line:
            out.append(line)
            continue
        line = fix_em_dash(line)
        line = fix_en_dash(line)
        line = fix_middle_dot(line)
        for a, b in SIMPLE:
            line = line.replace(a, b)
        # "about " and "plus or minus " carry their own space; collapse a double.
        line = re.sub(r"(about|plus or minus) {2,}", r"\1 ", line)
        out.append(line.rstrip())
    return "\n".join(out)


def main(argv: list[str]) -> int:
    dry = "--dry-run" in argv
    # --ext mirrors check_characters.py. Without it this script silently
    # processed only its four default extensions while the checker scanned the
    # set it had been given, so the two disagreed about which files were clean.
    exts = EXTS
    for a in argv:
        if a.startswith("--ext="):
            exts = tuple(e if e.startswith(".") else "." + e
                         for e in a.split("=", 1)[1].split(","))
    targets = [Path(a) for a in argv if not a.startswith("--")] or [Path("src")]
    changed = 0
    for target in targets:
        for p in walk(target, exts):
            try:
                before = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            after = fix(before)
            if after != before:
                changed += 1
                if not dry:
                    p.write_text(after, encoding="utf-8")
    print(f"{'would change' if dry else 'changed'} {changed} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
