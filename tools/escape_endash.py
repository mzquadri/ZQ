#!/usr/bin/env python3
"""Write the en dash in a regex as an escape instead of a literal character.

Two date-range patterns accept either a hyphen or an en dash, so that a period
typed with one anywhere still normalises instead of being reported as
unapproved. The character itself is banned in source by check_characters.py,
and quite rightly: the checker cannot tell a character class from prose.

Spelling it `\\u2013` keeps the pattern doing exactly what it did and leaves no
en dash in the file. Done here rather than by hand because a shell heredoc kept
turning the replacement back into the literal character.

    python tools/escape_endash.py scripts/validate-content.ts tests/portfolio.spec.ts
"""

from __future__ import annotations

import sys
from pathlib import Path

LITERAL = "[-" + chr(0x2013) + "]"
ESCAPED = "[-\\u2013]"


def main(argv: list[str]) -> int:
    for name in argv:
        p = Path(name)
        text = p.read_text(encoding="utf-8")
        n = text.count(LITERAL)
        if n:
            p.write_text(text.replace(LITERAL, ESCAPED), encoding="utf-8")
        print(f"{name}: {n} replaced")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
