#!/usr/bin/env python3
"""Show each banned character in context, for deciding its replacement.

Output is written as a file rather than printed, because a Windows console in
cp1252 cannot encode the characters this script exists to display.

    python tools/sample_banned.py src content
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_characters import BANNED, walk  # noqa: E402

EXTS = (".ts", ".tsx", ".md", ".mdx")
PER_CHAR = 6


def main(argv: list[str]) -> None:
    targets = [Path(a) for a in argv] or [Path("src")]
    seen: dict[str, list[str]] = {}
    for target in targets:
        for p in walk(target, EXTS):
            try:
                text = p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            for i, line in enumerate(text.splitlines(), 1):
                for ch in set(line) & BANNED.keys():
                    hits = seen.setdefault(ch, [])
                    if len(hits) < PER_CHAR:
                        hits.append(f"{p}:{i}: {line.strip()[:150]}")

    out = Path("banned-sample.txt")
    with out.open("w", encoding="utf-8") as f:
        for ch, hits in sorted(seen.items(), key=lambda kv: BANNED[kv[0]]):
            f.write(f"\n=== {BANNED[ch]}  U+{ord(ch):04X}  {ch}\n")
            for h in hits:
                f.write("    " + h + "\n")
    print(f"wrote {out} with {sum(len(v) for v in seen.values())} samples "
          f"across {len(seen)} characters")


if __name__ == "__main__":
    main(sys.argv[1:])
