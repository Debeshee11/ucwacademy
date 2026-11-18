#!/usr/bin/env python3
"""Checks a translated batch: same count, placeholders {0} {1} kept, right script, nothing left blank.
Usage: i18n_check.py <in.txt> <out.tsv>  (out lines: index TAB hindi TAB gujarati)"""
import json, re, sys
src = [l.split("\t", 1)[1] for l in open(sys.argv[1], encoding="utf8").read().split("\n") if l]
rows = [l.split("\t") for l in open(sys.argv[2], encoding="utf8").read().split("\n") if l.strip()]
if any(len(r) != 3 for r in rows) or [int(r[0]) for r in rows] != list(range(len(rows))): print("INDEX or columns wrong"); sys.exit(1)
out = [[r[1], r[2]] for r in rows]
bad = 0
if len(src) != len(out): print(f"COUNT {len(src)} vs {len(out)}"); sys.exit(1)
DEV, GUJ = re.compile(r"[ऀ-ॿ]"), re.compile(r"[઀-૿]")
for i, (e, (hi, gu)) in enumerate(zip(src, out)):
    ph = sorted(re.findall(r"\{\d\}", e))
    drop = set(re.findall(r"[A-Za-z](\{\d\})", e))  # plural suffix like question{1}: English-only, may be dropped
    for lab, t, rx in (("hi", hi, DEV), ("gu", gu, GUJ)):
        probs = []
        if sorted(x for x in re.findall(r"\{\d\}", t)) != sorted(x for x in ph if x not in drop) and sorted(re.findall(r"\{\d\}", t)) != ph: probs.append("placeholders")
        if not t.strip(): probs.append("blank")
        elif re.search(r"[A-Za-z]{4,}", e) and not rx.search(t) and e.strip() != t.strip(): probs.append("script")
        wrong = (GUJ if lab == "hi" else DEV).search(t)
        if wrong: probs.append("other-script")
        if probs: print(i, lab, probs, "|", e[:50], "|", t[:50]); bad += 1
print("checked", len(src), "problems", bad); sys.exit(1 if bad else 0)
