"""Checks answer quality: how often the correct option is the longest, and questions without four options.
Run from the repository root:  python3 scripts/answer_bias.py
Exits 1 if the longest-option rate is above LIMIT, so it can sit in CI once the questions are rewritten."""
import json, os, sys
LIMIT = 0.35
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
load = lambda p: json.load(open(os.path.join(ROOT, p), encoding="utf-8"))

qs = [(l["n"], q) for l in load("functions/content/lessons.json") for q in l.get("qs", [])]
n = longest = 0; odd = []; pos = [0, 0, 0, 0]
for lid, q in qs:
    o = q["options"]
    if len(o) != 4: odd.append((q["id"], len(o)))
    if len(o) < 2: continue
    n += 1; pos[min(q["answer"], 3)] += 1
    L = [len(x) for x in o]
    if L[q["answer"]] == max(L) and L.count(max(L)) == 1: longest += 1
rate = longest / n
print(f"lesson questions: {n}")
print(f"correct option is the longest: {longest} ({rate:.0%}); chance is about 25%; limit {LIMIT:.0%}")
print("answer position A/B/C/D:", pos)
print("not four options:", odd or "none")
sys.exit(1 if rate > LIMIT else 0)
