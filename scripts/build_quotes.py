#!/usr/bin/env python3
"""Builds one/data/quotes.json from content/quotes.tsv.
TSV columns: text <TAB> author <TAB> tags (comma letters) <TAB> source (optional).
Tags: i investing, s saving, p patience, r risk, w wealth, m mindset, l learning, e spending, g giving.
Checks: no duplicates, 20 to 220 characters, known tags, an author on every line. Ids are stable (a hash of the text), so shared links keep working when the list grows.
Usage: python3 scripts/build_quotes.py"""
import csv, json, sys, zlib, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
TAGS = set("ispr wmleg".replace(" ", ""))
out, seen, bad = [], set(), 0
for n, row in enumerate(csv.reader((root / "content" / "quotes.tsv").read_text(encoding="utf8").splitlines(), delimiter="\t"), 1):
    if not row or row[0].startswith("#"): continue
    row += [""] * (4 - len(row)); text, author, tags, src = [c.strip() for c in row[:4]]
    key = text.lower().rstrip(".")
    errs = []
    if not 20 <= len(text) <= 220: errs.append("length")
    if not author: errs.append("author")
    if key in seen: errs.append("duplicate")
    if not set(tags.split(",")) <= TAGS or not tags: errs.append("tags")
    if errs: print(f"line {n}: {errs}: {text[:60]}"); bad += 1; continue
    seen.add(key)
    qid = format(zlib.crc32(text.encode()) & 0xFFFFFF, "x").zfill(6)
    out.append([qid, text, author, tags.replace(",", ""), "" if src in ("", "Attributed", "Original") else src])
(root / "one" / "data").mkdir(exist_ok=True)
(root / "one" / "data" / "quotes.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
print(f"{len(out)} quotes written, {bad} rejected, {len({q[2] for q in out})} authors")
sys.exit(1 if bad else 0)
