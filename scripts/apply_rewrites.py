#!/usr/bin/env python3
"""Checks rewritten lessons against the lesson standard and writes them into functions/content/lessons.json.

    python3 scripts/apply_rewrites.py            check every file in content/rewrites/ and apply the ones that pass
    python3 scripts/apply_rewrites.py --check    check only, change nothing (use this in the deploy)

Safe for learners and for exams already set:
  * lesson numbers never change, so finished lessons stay finished;
  * a lesson's earlier questions are kept and marked "legacy", so progress on them and exams drawn from them still work;
  * running it twice gives the same result.
The standard is in content/LESSON-STANDARD.md. After applying, re-run scripts/build_examkeys.py and upload the keys so new questions enter the exams."""
import json, os, re, sys, glob

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
LESSONS = os.path.join(ROOT, "functions", "content", "lessons.json")
CHECK = "--check" in sys.argv
MIN_WORDS, MAX_WORDS, MIN_QS, BIAS_LIMIT = 400, 750, 4, 0.35
BANNED = [r"^Which statement best describes", r"^Which statement about .* is correct", r"^Which of these statements is NOT correct"]
TOOLS = {"sip", "goal", "emergency", "emi", "card", "inflation", "lumpsum", "retirement"}   # ids in one/js/tools.js

words = lambda t: len(re.findall(r"[A-Za-z0-9₹%'’-]+", t))

def lesson_words(L):
    parts = [L["story"]["headline"], *L["story"]["paras"], *L["concept"], L["talk"], *L["remember"]]
    e = L.get("example") or {}
    parts += [e.get("title", ""), e.get("intro", ""), e.get("note", "")] + [c for r in e.get("rows", []) for c in r if c != "="]
    return words(" ".join(parts))

def check(name, doc, known):
    errs, longest, total, positions = [], 0, 0, [0, 0, 0, 0]
    for n, L in doc["lessons"].items():
        at = f"{name} lesson {n}: "
        if int(n) not in known: errs.append(at + "no such lesson number in lessons.json"); continue
        for k in ("story", "concept", "example", "client", "talk", "remember", "qs"):
            if not L.get(k): errs.append(at + f"missing '{k}'")
        if errs and errs[-1].startswith(at): continue
        if len(L["story"].get("paras", [])) < 2: errs.append(at + "the story needs at least 2 paragraphs")
        if len(L["concept"]) < 4: errs.append(at + "the idea needs at least 4 paragraphs")
        if len(L["example"].get("rows", [])) < 3: errs.append(at + "the worked example needs at least 3 rows")
        if not 3 <= len(L["remember"]) <= 5: errs.append(at + "'remember' needs 3 to 5 points")
        if L.get("tool") and L["tool"] not in TOOLS: errs.append(at + f"unknown calculator '{L['tool']}'")
        w = lesson_words(L)
        if not MIN_WORDS <= w <= MAX_WORDS: errs.append(at + f"{w} words; the standard is {MIN_WORDS} to {MAX_WORDS}")
        if len(L["qs"]) < MIN_QS: errs.append(at + f"{len(L['qs'])} questions; at least {MIN_QS}")
        for q in L["qs"]:
            qa = at + f"question {q.get('id')}: "
            o = q.get("options", [])
            if not re.match(r"^v2-\d+-\d+$", str(q.get("id"))): errs.append(qa + "id must look like v2-<lesson>-<number>")
            if len(o) != 4: errs.append(qa + "needs exactly 4 options"); continue
            if not isinstance(q.get("answer"), int) or not 0 <= q["answer"] < 4: errs.append(qa + "answer must be 0 to 3"); continue
            if not q.get("why"): errs.append(qa + "needs a 'why'")
            wr = q.get("wrong", [])
            if len(wr) != 4 or wr[q["answer"]] is not None or any(not x for i, x in enumerate(wr) if i != q["answer"]): errs.append(qa + "'wrong' needs a reason for each wrong option and null for the right one")
            if any(re.search(b, q["prompt"]) for b in BANNED): errs.append(qa + "template question; ask about a situation or a calculation instead")
            lens = [len(x) for x in o]; total += 1; positions[q["answer"]] += 1
            if lens[q["answer"]] == max(lens) and lens.count(max(lens)) == 1: longest += 1
    if total:
        if longest / total > BIAS_LIMIT: errs.append(f"{name}: the right answer is the longest option in {longest} of {total} questions; keep it under {BIAS_LIMIT:.0%}")
        if max(positions) == total and total > 3: errs.append(f"{name}: every right answer sits in the same position; mix them")
    return errs, total, longest

def apply(doc, by_n):
    for n, L in doc["lessons"].items():
        T = by_n[int(n)]
        for k in ("story", "concept", "example", "client", "talk", "remember", "tool", "toolAsk"):
            if k in L: T[k] = L[k]
            elif k in ("tool", "toolAsk"): T.pop(k, None)
        T["deep"] = True
        T["by"], T["upd"] = L.get("by") or doc.get("by") or "UpperCrust Academy", L.get("upd") or doc.get("upd")
        if L.get("rev") or doc.get("rev"): T["rev"] = L.get("rev") or doc.get("rev")
        old = [q for q in T.get("qs", []) if not str(q["id"]).startswith("v2-")]
        for q in old: q["legacy"] = True
        T["qs"] = old + [{**q, "n2": 1} if False else q for q in L["qs"]]

lessons = json.load(open(LESSONS, encoding="utf-8"))
by_n = {l["n"]: l for l in lessons}
files = sorted(glob.glob(os.path.join(ROOT, "content", "rewrites", "*.json")))
bad = 0
for f in files:
    name = os.path.basename(f)
    try: doc = json.load(open(f, encoding="utf-8"))
    except Exception as e: print(f"FAIL {name}: not valid JSON ({e})"); bad += 1; continue
    errs, total, longest = check(name, doc, by_n)
    if errs:
        bad += 1; print(f"FAIL {name}"); [print("   -", e) for e in errs]; continue
    ws = [lesson_words(L) for L in doc["lessons"].values()]
    print(f"ok   {name}: {len(ws)} lessons, {min(ws)} to {max(ws)} words, {total} questions, right answer longest in {longest}")
    if not CHECK: apply(doc, by_n)
if bad: sys.exit(f"{bad} file(s) did not meet the standard. Nothing was written.")
if not CHECK and files:
    json.dump(lessons, open(LESSONS, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("written:", os.path.relpath(LESSONS, ROOT))
