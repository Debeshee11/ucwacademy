import json, os, subprocess, sys, importlib
sys.path.insert(0, os.path.dirname(__file__))
import pdfgen, nismq, authored
REPO = os.environ.get("UCW_REPO", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..") + "/")
KEYS = os.environ.get("UCW_KEYS", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "private-keys") + "/")
os.makedirs(KEYS, exist_ok=True)
os.makedirs(REPO + "functions/content/nism", exist_ok=True); os.makedirs(REPO + "assets/nism", exist_ok=True)
NEG = {"None": 0, "25% of marks": .25, "10% of marks": .1}
def pages(p):
    o = subprocess.run(["pdfinfo", p], capture_output=True, text=True).stdout
    return int([l for l in o.splitlines() if l.startswith("Pages")][0].split()[1])
def build(mod, num):
    E = importlib.import_module(mod).EX
    E["negf"] = NEG[E["neg"]] if E["neg"] in NEG else (.25 if "25" in E["neg"] else .1 if "10" in E["neg"] else 0)
    E["marks"] = E.get("marks", E["qs"]); E["passMarks"] = round(E["pass"] * E["marks"] / 100, 2)
    mocks = nismq.build_mocks(E, num)
    for m in mocks:
        assert len(m["qs"]) == E["qs"], (E["id"], m["n"], len(m["qs"]))
    cases = authored.apply(E, mocks)
    n2 = E.get("m2", 0)
    if n2:
        for m in mocks:
            have = sum(1 for q in m["qs"] if q.get("m") == 2)
            idx = [i for i, q in enumerate(m["qs"]) if q.get("f") in ("scen", "num") and q.get("m") != 2]
            rest = [i for i in range(len(m["qs"])) if i not in idx]
            for i in (idx + [r for r in rest if m["qs"][r].get("m") != 2])[:max(0, n2 - have)]: m["qs"][i]["m"] = 2
            assert sum(q.get("m", 1) for q in m["qs"]) == E["marks"], (E["id"], sum(q.get("m", 1) for q in m["qs"]))
    out = {k: E[k] for k in ["id", "series", "code", "title", "blurb", "qs", "mins", "pass", "neg", "negf", "passMarks", "marks", "units", "sheet"] if k in E}
    out["units"] = [dict(n=u["n"], title=u["title"], w=u["w"], overview=u["overview"], focus=u.get("focus", []), visuals=u.get("visuals", []), facts=[list(f) for f in u["facts"]]) for u in E["units"]]
    # Answer keys and explanations never go in the public repo. They are uploaded to the server from the admin page.
    keys = dict(id=E["id"], negf=E["negf"], marks=E["marks"], passMarks=E["passMarks"], mocks=[dict(a=[q["a"] for q in m["qs"]], w=[q["w"] for q in m["qs"]], u=[q["u"] for q in m["qs"]], m=[q.get("m", 1) for q in m["qs"]]) for m in mocks])
    json.dump(keys, open(KEYS + f"{E['id']}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    out["mocks"] = [[{k: v for k, v in q.items() if k in ("u", "p", "o", "m", "c")} for q in m["qs"]] for m in mocks]
    if any(cases): out["cases"] = cases
    json.dump(out, open(REPO + f"functions/content/nism/{E['id']}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    pdf = REPO + f"assets/nism/{E['id']}-study-guide.pdf"; pdfgen.build_pdf(pdf, E)
    return dict(id=E["id"], series=E["series"], code=E["code"], title=E["title"], short=E.get("short", E["title"]), tag=E["tag"], blurb=E["blurb"], qs=E["qs"], marks=E["marks"], mins=E["mins"], pass_=0, **{"pass": E["pass"]}, neg=E["neg"], units=len(E["units"]), facts=sum(len(u["facts"]) for u in E["units"]), pages=pages(pdf), track=E["track"])
if __name__ == "__main__":
    from specs import SPECS, TRACKS
    mods = sys.argv[1:] or [s[0] for s in SPECS]
    ex = []
    for mod, num in SPECS:
        if mod in mods: ex.append(build(mod, num)); print(mod, ex[-1]["pages"], "pages", ex[-1]["facts"], "facts")
    idx_p = REPO + "functions/content/nism.json"
    old = json.load(open(idx_p)) if os.path.exists(idx_p) else {"exams": []}
    byid = {e["id"]: e for e in old["exams"]}; byid.update({e["id"]: e for e in ex})
    ORD = ["nism-v-a","nism-xii","nism-viii","nism-x-a","nism-xv","nism-xxi-a","nism-xix-a","nism-xi","nism-i","nism-xb","nism-v-d","nism-vi","nism-xxi-b"]
    order = sorted(byid, key=lambda k: ORD.index(k) if k in ORD else 99)
    exams = [byid[i] for i in order]
    tracks = [dict(t, exams=[e["id"] for e in exams if e["track"] == t["id"]]) for t in TRACKS]
    json.dump(dict(tracks=[t for t in tracks if t["exams"]], exams=exams), open(idx_p, "w"), ensure_ascii=False, indent=1)
