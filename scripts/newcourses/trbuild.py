#!/usr/bin/env python3
"""Hindi and Gujarati for the courses in c*.py. Reads tr/<lang>/cNN.py (a dict T shaped like COURSE, translated),
and writes functions/content/lt-<lang>.json (lesson text by lesson number) and merges question text into tx-<lang>.json,
rebuilding every question with the SAME seeds as build.py so option order and answers match the English ones.
Also merges course title/blurb/hook/fun/traps into one/data/cat-<lang>.json.   Run from repo root after build.py."""
import json, os, sys, importlib, glob, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import build as B
CT = os.path.join(ROOT, "functions", "content")
TPL = {
 "hi": dict(it="यह", q1="“{t}” का सबसे सही वर्णन कौन-सा कथन करता है?", q2="{e} यह उदाहरण किस अवधारणा को दर्शाता है?", w2="यह {t} है। {d}", ex="उदाहरण: ",
            i="यहाँ किस शब्द का वर्णन किया गया है? {m}", sc="क्लाइंट कहता है: {q} कौन-सा उत्तर सबसे उपयुक्त है?", ws="यह उत्तर उपयुक्त है। {t}", tr="इस क्षेत्र में आम गलती इनमें से कौन-सी है?", wt="यह एक आम गलती है: {t}", sep="। "),
 "gu": dict(it="આ", q1="“{t}” નું સૌથી સાચું વર્ણન કયું વિધાન કરે છે?", q2="{e} આ ઉદાહરણ કઈ વિભાવના દર્શાવે છે?", w2="આ {t} છે. {d}", ex="ઉદાહરણ: ",
            i="અહીં કયા શબ્દનું વર્ણન કરવામાં આવ્યું છે? {m}", sc="ગ્રાહક કહે છે: {q} કયો જવાબ સૌથી યોગ્ય છે?", ws="આ જવાબ યોગ્ય છે. {t}", tr="આ ક્ષેત્રમાં સામાન્ય ભૂલ આમાંથી કઈ છે?", wt="આ એક સામાન્ય ભૂલ છે: {t}", sep=". "),
}
TXA = {}; LQA = {}
def run(lang):
    P = TPL[lang]; mask = lambda t, d: d.replace(t, P["it"], 1) if t in d else d
    lt, tx = {}, {}; cat = {}
    for f in sorted(glob.glob(os.path.join(HERE, "c[0-9][0-9].py"))):
        name = os.path.basename(f)[:-3]; tf = os.path.join(HERE, "tr", lang, name + ".py")
        if not os.path.exists(tf): continue
        E = importlib.import_module(name).COURSE; spec = {}; exec(open(tf, encoding="utf-8").read(), spec); T = spec["T"]
        cid = E["id"]; ec = B.build(E, 0)
        # lesson numbers come from the built catalogue
        cn = json.load(open(os.path.join(CT, "courses.json"), encoding="utf-8"))["courses"]; nums = [c for c in cn if c["id"] == cid][0]["modules"][0]["lessons"]
        allc = [x for l in T["lessons"] for x in l["concepts"]]; terms = [t for t, _, _ in allc]
        assert len(T["lessons"]) == len(E["lessons"]) and len(allc) == 20, cid
        cat[E["title"]] = T["title"]; cat[E["blurb"]] = T["blurb"]; cat[E["hook"]] = T["hook"]
        for a, b in zip(E["fun"], T["fun"]): cat[a] = b
        for a, b in zip(E["traps"], T["traps"]): cat[a] = b
        def Q(id, p, right, wrong, why, r):
            return B.q(id, p, right, wrong, why, r)
        for li, L in enumerate(T["lessons"]):
            n = nums[li]; cs = L["concepts"]; r = B.rng(cid, "L", li)
            lt[str(n)] = {"title": L["title"], "concept": [L["intro"]] + [f"{t}{P['sep']}{d} {P['ex']}{e}" for t, d, e in cs],
                          "client": {"quote": L["client"][0], "context": L["client"][1]}, "talk": L["talk"], "remember": L["remember"]}
            t0, d0, _ = cs[0]; t1, _, e1 = cs[1]; t2, d2, _ = cs[2]
            qs = [Q(f"nl{n}q1", P["q1"].format(t=t0), mask(t0, d0), [mask(t, d) for t, d, _ in cs[1:]], f"{t0}: {d0}", r),
                  Q(f"nl{n}q2", P["q2"].format(e=e1), t1, [t for t, _, _ in cs if t != t1], P["w2"].format(t=t1, d=cs[1][1]), r),
                  Q(f"nl{n}q3", P["q1"].format(t=t2), mask(t2, d2), [mask(t, d) for i, (t, d, _) in enumerate(cs) if i != 2], f"{t2}: {d2}", r)]
            for q in qs: tx[q["id"]] = [q["prompt"], q["options"], q["why"]]; LQA[q["id"]] = q["answer"]
        ex = []; k = 0
        for t, d, e in allc:
            k += 1; r = B.rng(cid, "i", k); q = Q(f"e-{cid}-i{k:02d}", P["i"].format(m=mask(t, d)), t, B.others(terms, t, 3, r), P["w2"].format(t=t, d=d), r); ex.append(q)
        k = 0
        for t, d, e in allc:
            k += 1; r = B.rng(cid, "h", k); ex.append(Q(f"e-{cid}-h{k:02d}", P["q2"].format(e=e), t, B.others(terms, t, 3, r), P["w2"].format(t=t, d=d), r))
        talks = [L["talk"] for L in T["lessons"]]
        for li, L in enumerate(T["lessons"]):
            r = B.rng(cid, "s", li); ex.append(Q(f"e-{cid}-h{21 + li:02d}", P["sc"].format(q=L["client"][0]), L["talk"], B.others(talks, L["talk"], 3, r), P["ws"].format(t=L["talk"]), r))
        rem = [x for L in T["lessons"] for x in L["remember"]]
        for j, trap in enumerate(T["traps"]):
            r = B.rng(cid, "t", j); ex.append(Q(f"e-{cid}-i{21 + j:02d}", P["tr"], trap, B.others(rem, "", 3, r), P["wt"].format(t=trap), r))
        for j in range(8):
            li, ci = (j, 3) if j < 5 else (j - 5, 2); t, d, e = T["lessons"][li]["concepts"][ci]; r = B.rng(cid, "b", j)
            if j < 5: ex.append(Q(f"e-{cid}-b{j + 1:02d}", P["q1"].format(t=t), mask(t, d), B.others([mask(x[0], x[1]) for x in allc], mask(t, d), 3, r), f"{t}: {d}", r))
            else: ex.append(Q(f"e-{cid}-b{j + 1:02d}", P["q2"].format(e=e), t, B.others(terms, t, 3, r), P["w2"].format(t=t, d=d), r))
        for q in ex: tx[q["id"]] = [q["prompt"], q["options"], q["why"]]
        # prove the answers line up with the English questions (same ids, same correct option position)
        ecourse, elessons, eextra = B.build(E, nums[0]); en = {z["id"]: z["answer"] for L2 in elessons for z in L2["qs"]}
        for grp in eextra["qs"].values():
            for z in grp: en[z["id"]] = z["answer"]
        mine = {q["id"]: q["answer"] for q in ex}
        for L in T["lessons"]: pass
        for k2 in tx:
            pass
        for qid, v in en.items():
            assert qid in tx, ("missing", qid)
            if qid in LQA: assert LQA[qid] == v, ("lesson answer mismatch", qid)
        TXA.update({**{q["id"]: q["answer"] for q in ex}, **{}})
        for q in ex: assert en[q["id"]] == q["answer"], ("answer mismatch", q["id"])
    return lt, tx, cat
if __name__ == "__main__":
    for lang in ("hi", "gu"):
        lt, tx, cat = run(lang)
        if not lt: continue
        old = {}; p = os.path.join(CT, f"lt-{lang}.json")
        if os.path.exists(p): old = json.load(open(p, encoding="utf-8"))
        old.update(lt); json.dump(old, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        p = os.path.join(CT, f"tx-{lang}.json"); t0 = json.load(open(p, encoding="utf-8")); t0.update(tx); json.dump(t0, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        p = os.path.join(ROOT, "one", "data", f"cat-{lang}.json"); c0 = json.load(open(p, encoding="utf-8")); c0.update(cat); json.dump(c0, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(lang, len(lt), "lessons", len(tx), "questions")
