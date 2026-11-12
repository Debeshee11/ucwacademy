#!/usr/bin/env python3
"""Adds the courses in c01..c10.py to functions/content (lessons, courses, exams) and writes private answer keys.
Run from the repo root: python3 scripts/newcourses/build.py   (safe to run twice: it replaces its own courses)
Outputs: functions/content/{lessons,courses,exams}.json updated; private-keys-new/ (examkeys + exams.full additions). NEVER upload private-keys-new to GitHub."""
import json, os, sys, hashlib, random, glob, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CT = os.path.join(ROOT, "functions", "content"); OUT = os.path.join(ROOT, "private-keys-new")
sys.path.insert(0, HERE)
load = lambda n: json.load(open(os.path.join(CT, n + ".json"), encoding="utf-8"))
dump = lambda o, p: json.dump(o, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
rng = lambda *k: random.Random(int(hashlib.sha256("|".join(map(str, k)).encode()).hexdigest()[:12], 16))
low = lambda s: s if (s.split(" ")[0].isupper() and len(s.split(" ")[0]) > 1) else s[0].lower() + s[1:]
import re
def mask(t, d):
    """Hide the term inside its own definition so an option never gives the answer away."""
    d = re.sub(r"^(?:An?|The)?\s*" + re.escape(t) + r"(?:,\s*or\s*[^,]+,)?s?(?=\s)", "This", d, count=1, flags=re.I)
    d = re.sub(r"\b" + re.escape(t) + r"\b", "this", d, flags=re.I)
    return d
LEAKS = []
def leak(cid, t, text, where):
    words = [w for w in re.split(r"[^A-Za-z0-9]+", t) if len(w) > 3 or w.isupper()]
    if re.search(re.escape(t), text, re.I): LEAKS.append((cid, t, where))

def q(id, prompt, right, wrong, why, r):
    opts = [right] + [w for w in wrong if w != right][:3]
    r.shuffle(opts)
    return {"id": id, "prompt": prompt, "options": opts, "answer": opts.index(right), "why": why, "wrong": []}

def others(pool, skip, k, r):
    c = [x for x in pool if x != skip]; r.shuffle(c); return c[:k]

def build(c, start):
    cid = c["id"]; allc = [(t, d, e) for l in c["lessons"] for (t, d, e) in l["concepts"]]
    terms = [t for t, _, _ in allc]; lessons = []; n = start; lm = []
    for li, L in enumerate(c["lessons"]):
        cs = L["concepts"]; r = rng(cid, "L", li); qs = []
        t0, d0, _ = cs[0]; t1, _, e1 = cs[1]; t2, d2, _ = cs[2]
        qs.append(q(f"nl{n}q1", f"Which statement best describes “{t0}”?", mask(t0, d0), [mask(t, d) for t, d, _ in cs[1:]], f"{t0}: {d0}", r))
        leak(cid, t1, e1, "lesson-q2")
        qs.append(q(f"nl{n}q2", f"{e1} Which idea does this show?", t1, [t for t, _, _ in cs if t != t1], f"This is {t1}. {cs[1][1]}", r))
        qs.append(q(f"nl{n}q3", f"Which statement best describes “{t2}”?", mask(t2, d2), [mask(t, d) for i, (t, d, _) in enumerate(cs) if i != 2], f"{t2}: {d2}", r))
        qd, qc = L["client"]
        lessons.append({"n": n, "title": L["title"], "tags": [], "deep": False, "story": None,
            "concept": [L["intro"]] + [f"{t}. {d} For example: {low(e)}" for t, d, e in cs],
            "client": {"quote": qd, "context": qc}, "talk": L["talk"], "remember": L["remember"], "qs": qs}); lm.append(n); n += 1
    ex = {"i": [], "h": [], "b": []}; k = 0
    for t, d, e in allc:
        k += 1; r = rng(cid, "i", k); leak(cid, t, mask(t, d), "i-def")
        ex["i"].append(q(f"e-{cid}-i{k:02d}", f"Which term is described here? {mask(t, d)}", t, others(terms, t, 3, r), f"This is {t}. {d}", r))
    # Intermediate: describe the idea without naming it
    for x in ex["i"]:
        pass
    k = 0
    for t, d, e in allc:
        k += 1; r = rng(cid, "h", k); leak(cid, t, e, "h-example")
        ex["h"].append(q(f"e-{cid}-h{k:02d}", f"{e} Which idea does this show?", t, others(terms, t, 3, r), f"This is {t}. {d}", r))
    # scenario questions: the client says X, which reply fits
    talks = [L["talk"] for L in c["lessons"]]
    for li, L in enumerate(c["lessons"]):
        r = rng(cid, "s", li)
        ex["h"].append(q(f"e-{cid}-h{21 + li:02d}", f"A client says: {L['client'][0]} Which reply fits best?", L["talk"], others(talks, L["talk"], 3, r), f"This reply fits. {L['talk']}", r))
    rem = [x for L in c["lessons"] for x in L["remember"]]
    for j, trap in enumerate(c["traps"]):
        r = rng(cid, "t", j)
        ex["i"].append(q(f"e-{cid}-i{21 + j:02d}", "Which of these is a common mistake in this area?", trap, others(rem, "", 3, r), f"This is a common mistake: {trap}", r))
    for j in range(8):
        li, ci = (j, 3) if j < 5 else (j - 5, 2)
        t, d, e = c["lessons"][li]["concepts"][ci]; r = rng(cid, "b", j)
        if j < 5: ex["b"].append(q(f"e-{cid}-b{j + 1:02d}", f"Which statement best describes “{t}”?", mask(t, d), others([mask(x[0], x[1]) for x in allc], mask(t, d), 3, r), f"{t}: {d}", r))
        else: ex["b"].append(q(f"e-{cid}-b{j + 1:02d}", f"{e} Which idea does this show?", t, others(terms, t, 3, r), f"This is {t}. {d}", r))
    course = {"id": cid, "level": c["level"], "title": c["title"], "blurb": c["blurb"], "modules": [{"title": "The essentials", "lessons": lm}], "topic": c["topic"], "tag": c["tag"], "sec": c["sec"], "track": c["track"]}
    return course, lessons, {"hook": c["hook"], "fun": c["fun"], "traps": c["traps"], "qs": ex}

def main():
    mods = [importlib.import_module(os.path.basename(f)[:-3]) for f in sorted(glob.glob(os.path.join(HERE, "c[0-9][0-9].py")))]
    C, L, E = load("courses"), load("lessons"), load("exams")
    ids = {m.COURSE["id"] for m in mods}
    old = {n for co in C["courses"] if co["id"] in ids for mo in co["modules"] for n in mo["lessons"]}
    L = [l for l in L if l["n"] not in old]; C["courses"] = [x for x in C["courses"] if x["id"] not in ids]
    nxt = max(l["n"] for l in L) + 1; full = json.load(open("/dev/null")) if False else {}
    os.makedirs(os.path.join(OUT, "examkeys"), exist_ok=True); fullx = {}
    for m in mods:
        co, ls, ex = build(m.COURSE, nxt); nxt += len(ls)
        C["courses"].append(co); L += ls; fullx[co["id"]] = ex
        lq = [x for l in ls for x in l["qs"]]; key = {}
        for x in lq + [y for t in ex["qs"].values() for y in t]: key[x["id"]] = [x["answer"], x["why"], len(x["options"])]
        pools = {"b": [x["id"] for x in lq] + [x["id"] for x in ex["qs"]["b"]], "i": [x["id"] for x in ex["qs"]["i"]], "h": [x["id"] for x in ex["qs"]["h"]], "r": [x["id"] for x in lq]}
        dump({"id": co["id"], "title": co["title"], "level": co["level"], "pools": pools, "keys": key}, os.path.join(OUT, "examkeys", co["id"] + ".json"))
        pub = json.loads(json.dumps(ex))
        for t in pub["qs"].values():
            for x in t:
                for kk in ("answer", "why", "wrong"): x.pop(kk, None)
        E["courses"][co["id"]] = pub
    # sections and tracks
    S = {s["id"]: s for s in C["sections"]}
    def track(sec, tid, name, blurb, cid):
        T = {t["id"]: t for t in S[sec]["tracks"]}
        if tid not in T: S[sec]["tracks"].append({"id": tid, "name": name, "blurb": blurb, "courses": []}); T[tid] = S[sec]["tracks"][-1]
        T[tid].pop("soon", None); T[tid].setdefault("courses", [])
        if cid not in T[tid]["courses"]: T[tid]["courses"].append(cid)
    for m in mods:
        c = m.COURSE
        names = {"safety": ("Scam and fraud safety", "Spot and stop fraud before it costs you."), "succession": ("Wealth succession", "Wills, nominations and passing wealth on."), "fixed": ("Bonds and fixed income", "Government and corporate bonds, explained."), "global": ("Global investing", "Investing in overseas markets from India.")}
        nm = names.get(c["track"], ("", ""))
        track(c["sec"], c["track"], nm[0], nm[1], c["id"])
    dump(C, os.path.join(CT, "courses.json")); dump(L, os.path.join(CT, "lessons.json")); dump(E, os.path.join(CT, "exams.json"))
    meta = {"levels": [{"id": x["id"], "name": x["name"]} for x in C["levels"]], "courses": [{"id": x["id"], "level": x["level"], "title": x["title"], "optional": bool(x.get("optional"))} for x in C["courses"]]}
    dump(meta, os.path.join(OUT, "examkeys", "_meta.json"))
    print("LEAKS", len(LEAKS)); [print("  ", x) for x in LEAKS]
    print("courses", len(C["courses"]), "lessons", len(L), "new lessons from", nxt - 50, "to", nxt - 1)
main()
