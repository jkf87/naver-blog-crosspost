#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys


def split_tags(raw: str) -> list[str]:
    raw = raw.strip()
    if not raw:
        return []
    if "#" in raw:
        return [part.strip() for part in raw.split("#") if part.strip()]
    return [part.strip() for part in re.split(r"[,;\n\t]+|\s{2,}", raw) if part.strip()]


def normalize_tag(tag: str, *, keep_hyphens: bool, lower_acronyms: bool) -> str:
    tag = tag.strip().lstrip("#").strip()
    tag = re.sub(r"\s+", "", tag)
    if not keep_hyphens:
        tag = tag.replace("-", "").replace("–", "").replace("—", "")
    tag = re.sub(r"[^\w가-힣-]", "", tag, flags=re.UNICODE)
    if lower_acronyms and tag.isupper() and len(tag) <= 4:
        tag = tag.lower()
    return tag


def normalize_tags(raw: str, *, keep_hyphens: bool, lower_acronyms: bool) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for part in split_tags(raw):
        tag = normalize_tag(part, keep_hyphens=keep_hyphens, lower_acronyms=lower_acronyms)
        key = tag.casefold()
        if tag and key not in seen:
            seen.add(key)
            result.append(tag)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize source tags for Naver Blog.")
    parser.add_argument("tags", nargs="*", help="Raw tag text. Reads stdin when omitted.")
    parser.add_argument(
        "--delimiter",
        choices=("space", "newline", "comma"),
        default="space",
        help="Output delimiter.",
    )
    parser.add_argument("--keep-hyphens", action="store_true", help="Keep hyphens in tags.")
    parser.add_argument(
        "--lower-acronyms",
        action="store_true",
        help="Lowercase all-uppercase tags of 4 characters or fewer.",
    )
    args = parser.parse_args()

    raw = " ".join(args.tags) if args.tags else sys.stdin.read()
    tags = normalize_tags(raw, keep_hyphens=args.keep_hyphens, lower_acronyms=args.lower_acronyms)

    delimiter = {"space": " ", "newline": "\n", "comma": ", "}[args.delimiter]
    print(delimiter.join(tags))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
