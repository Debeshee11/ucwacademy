"""Builds the private exam answer keys and strips answers from the public exam file.

Run from the repository root:  python3 scripts/build_examkeys.py

Reads   functions/content/lessons.json, functions/content/courses.json and the FULL exam file (private-keys/exams.full.json if present, else functions/content/exams.json)
Writes  private-keys/exams.full.json      full copy of the exam questions (never commit; the folder is git-ignored)
        private-keys/examkeys/<id>.json    one answer-key file per course, plus _meta.json (upload these from Admin > Growth and exams)
        functions/content/exams.json               public file with answer, why and wrong removed from exam-only questions
        functions/content/lessons.json, exams.json duplicate answer options removed (idempotent)
Lesson questions keep their answers in the public file because the lesson quizzes mark instantly in the browser.
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "one", "data")
PRIV = os.path.join(ROOT, "private-keys")
KEYDIR = os.path.join(PRIV, "examkeys")
FULL = os.path.join(PRIV, "exams.full.json")
load = lambda p: json.load(open(p, encoding="utf-8"))
dump = lambda o, p: json.dump(o, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

def dedupe(q):
    """Drop repeated option text, keep the answer pointing at the same option. Returns True if changed."""
    o, a = q["options"], q.get("answer")
    seen, keep, na = {}, [], None
    for i, t in enumerate(o):
        if t in seen:
            if i == a: na = seen[t]
            continue
        seen[t] = len(keep); keep.append(t)
        if i == a: na = len(keep) - 1
    if len(keep) == len(o): return False
    w = q.get("wrong")
    if isinstance(w, list) and len(w) == len(o):
        q["wrong"] = [w[i] for i, t in enumerate(o) if seen[t] == [k for k in range(len(keep))][seen[t]] and o.index(t) == i]
    q["options"], q["answer"] = keep, na
    return True

def main():
    os.makedirs(KEYDIR, exist_ok=True)
    lessons = load(os.path.join(DATA, "lessons.json"))
    courses = load(os.path.join(DATA, "courses.json"))
    src = FULL if os.path.exists(FULL) else os.path.join(DATA, "exams.json")
    exams = load(src)

    fixed = 0
    for l in lessons:
        for q in l.get("qs", []): fixed += dedupe(q)
    for cx in exams["courses"].values():
        for qs in (cx.get("qs") or {}).values():
            for q in qs:
                if "answer" in q: fixed += dedupe(q)
    print("duplicate-option questions fixed:", fixed)
    dump(lessons, os.path.join(DATA, "lessons.json"))
    dump(exams, FULL)

    lm = {l["n"]: l for l in lessons}
    meta = {"levels": [{"id": x["id"], "name": x["name"]} for x in courses["levels"]],
            "courses": [{"id": c["id"], "level": c["level"], "title": c["title"], "optional": bool(c.get("optional"))} for c in courses["courses"]]}
    dump(meta, os.path.join(KEYDIR, "_meta.json"))

    pub = json.loads(json.dumps(exams))
    for c in courses["courses"]:
        lesson_ids = [n for m in c["modules"] for n in m["lessons"]]
        lq = [q for n in lesson_ids for q in lm[n].get("qs", [])]
        cx = exams["courses"].get(c["id"], {})
        ex = cx.get("qs") or {}
        key = {}
        def put(q):
            if "answer" not in q: sys.exit("missing answer for " + q["id"])
            key[q["id"]] = [q["answer"], q.get("why", ""), len(q["options"])]
        for q in lq: put(q)
        for t in ex.values():
            for q in t: put(q)
        pools = {"b": [q["id"] for q in lq] + [q["id"] for q in ex.get("b", [])],
                 "i": [q["id"] for q in ex.get("i", [])], "h": [q["id"] for q in ex.get("h", [])],
                 "r": [q["id"] for q in lq]}
        dump({"id": c["id"], "title": c["title"], "level": c["level"], "pools": pools, "keys": key}, os.path.join(KEYDIR, c["id"] + ".json"))
        for t in (pub["courses"].get(c["id"], {}).get("qs") or {}).values():
            for q in t:
                for k in ("answer", "why", "wrong"): q.pop(k, None)
    dump(pub, os.path.join(DATA, "exams.json"))
    print("key files:", len(os.listdir(KEYDIR)), " public exams.json stripped")

main()
