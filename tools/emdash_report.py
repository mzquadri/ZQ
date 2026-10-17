#!/usr/bin/env python3
"""List every em dash, split by whether a reader can see it.

The replacement for an em dash depends on what it was doing, so they cannot all
be rewritten by one rule. This separates the ones that appear in prose a visitor
reads from the ones inside source comments, because the second group can take a
blunter rewrite than the first.

    python tools/emdash_report.py src content
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_characters import walk  # noqa: E402

EXTS = (".ts", ".tsx", ".md", ".mdx")
DASH = "—"
COMMENT = re.compile(r"^\s*(//|/\*|\*(?!/)|\*/)")


def main(argv: list[str]) -> None:
    targets = [Path(a) for a in argv] or [Path("src")]
    visible: list[str] = []
    comments: list[str] = []
    for target in targets:
        for p in walk(target, EXTS):
            try:
                text = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            in_block = False
            for i, line in enumerate(text.splitlines(), 1):
                stripped = line.strip()
                if stripped.startswith("/*"):
                    in_block = True
                is_comment = in_block or bool(COMMENT.match(line))
                if stripped.endswith("*/"):
                    in_block = False
                if DASH in line:
                    (comments if is_comment else visible).append(f"{p}:{i}: {stripped}")

    out = Path("emdash-report.txt")
    with out.open("w", encoding="utf-8") as f:
        f.write(f"VISIBLE PROSE ({len(visible)})\n")
        for v in visible:
            f.write("  " + v + "\n")
        f.write(f"\nCOMMENTS ({len(comments)})\n")
        for c in comments:
            f.write("  " + c + "\n")
    print(f"wrote {out}: {len(visible)} visible, {len(comments)} in comments")


if __name__ == "__main__":
    main(sys.argv[1:])
