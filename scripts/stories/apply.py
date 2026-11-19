#!/usr/bin/env python3
"""Hand-written stories live in one/data/stories/<lesson n>.json (an array of cards).
This script (1) checks them against the house rules for questions, and (2) copies each story's pick cards into the lesson's question list,
so module quizzes, practice and revision use the same good questions. Earlier questions are kept, marked "legacy", so exams that point at them still work.
Run from the repo root: python3 scripts/stories/apply.py   (safe to run twice)"""
import json, os, glob, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
LP = os.path.join(ROOT, "functions", "content", "lessons.json")
lessons = json.load(open(LP, encoding="utf-8")); by = {l["n"]: l for l in lessons}
S = lambda x: x if isinstance(x, str) else x.get("en", "")
bad = []; done = 0
for f in sorted(glob.glob(os.path.join(ROOT, "one", "data", "stories", "*.json")), key=lambda p: int(re.sub(r"\D", "", os.path.basename(p)))):
    n = int(os.path.basename(f)[:-5]); cards = json.load(open(f, encoding="utf-8")); picks = [c for c in cards if c.get("k") == "pick"]
    if n not in by: bad.append(f"{n}: no such lesson"); continue
    if len(picks) < 3: bad.append(f"{n}: needs at least 3 questions, has {len(picks)}")
    ids = set(); answers = []
    for c in picks:
        o = [S(x) for x in c["opts"]]; w = [S(x) for x in c["why"]]; a = c["ans"]; i = c.get("id", "?")
        if i in ids: bad.append(f"{n}/{i}: duplicate id")
        ids.add(i)
        if len(o) != 4 or len(w) != 4 or not all(w): bad.append(f"{n}/{i}: needs 4 options and a reason for every one")
        if len(set(o)) != len(o): bad.append(f"{n}/{i}: repeated option")
        if max(range(len(o)), key=lambda k: len(o[k])) == a and len(o[a]) > 1.1 * sorted(len(x) for x in o)[-2]: bad.append(f"{n}/{i}: the right option is clearly the longest")
        lw = sorted(len(x) for x in w)
        if lw[-1] > 1.6 * lw[0]: bad.append(f"{n}/{i}: reasons differ too much in length ({lw[0]} to {lw[-1]})")
        answers.append(a)
    if len(picks) >= 4 and len(set(answers)) == 1: bad.append(f"{n}: every answer is in the same place")
    if bad and any(b.startswith(f"{n}") for b in bad): continue
    old = [q for q in by[n].get("qs", []) if not str(q.get("id", "")).startswith("s")]
    for q in old: q["legacy"] = True
    new = [{"id": c["id"], "prompt": S(c["q"]), "options": [S(x) for x in c["opts"]], "answer": c["ans"], "why": S(c["why"][c["ans"]]), "wrong": [None if k == c["ans"] else S(c["why"][k]) for k in range(4)], "follow": None} for c in picks]
    by[n]["qs"] = old + new; done += 1
if bad: print("PROBLEMS:\n" + "\n".join(" - " + b for b in bad)); sys.exit(1)
json.dump(lessons, open(LP, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{done} stories applied")
