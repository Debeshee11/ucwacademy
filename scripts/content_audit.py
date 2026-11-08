#!/usr/bin/env python3
"""Content uniformity audit. Run from the repo root: python3 scripts/content_audit.py
Lists lessons that are much thinner than the median, lessons missing client or remember notes, and questions with fewer than 4 options."""
import json, statistics as st
ls = json.load(open("one/data/lessons.json"))
C = json.load(open("one/data/courses.json"))["courses"]
w = lambda v: len(json.dumps(v).split())
F = ["story", "concept", "client", "talk", "remember"]
tot = {l["n"]: sum(w(l[f]) for f in F) for l in ls}
med = st.median(tot.values())
where = {n: c["title"] for c in C for m in c["modules"] for n in m.get("lessons", [])}
print(f"{len(ls)} lessons · median {med:.0f} words (concept, client, talk, remember, story)")
print("\nThin lessons (under half the median):")
for n, t in sorted(tot.items()):
    if t < med / 2: print(f"  {n:>4}  {t:>3} words  {where.get(n, '?')}")
print("\nNo client note:", [l["n"] for l in ls if w(l["client"]) < 5])
print("No remember note:", [l["n"] for l in ls if w(l["remember"]) < 5])
print("\nQuestions with fewer than 4 options:")
for l in ls:
    for q in l["qs"]:
        if len(q["options"]) != 4: print(f"  lesson {l['n']} {q['id']}: {len(q['options'])}")
