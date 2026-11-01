"""Hand-written questions and case studies replace generated ones in the mocks.

Each exam may have auth/<exam id with underscores>.py defining:
  Q     = [(unit, level 1-5, prompt, correct, [wrong, wrong, wrong], why), ...]
  CASES = [dict(u=unit, lvl=1-5, text="...", qs=[(prompt, correct, [w, w, w], why), ...]), ...]
A question or case is used in the mock whose number equals its level. Case questions go at the end, grouped by case.
"""
import importlib, random, zlib
def rs(*k): return random.Random(zlib.crc32("|".join(map(str, k)).encode()))

def load(exam_id):
    try: return importlib.import_module("auth." + exam_id.replace("-", "_"))
    except ModuleNotFoundError: return None

def _opts(exam, m, tag, correct, wrong):
    o = [correct] + list(wrong); rs(exam, m, tag).shuffle(o); return o, o.index(correct)

def apply(E, mocks):
    """Mutates mocks in place. Returns the per-mock list of case texts."""
    mod = load(E["id"]); cases_out = [[] for _ in mocks]
    if not mod: return cases_out
    Qa, CS = getattr(mod, "Q", []), getattr(mod, "CASES", [])
    case_mark = 2 if E.get("m2") else 1
    for mk in mocks:
        m = mk["n"]; qs = mk["qs"]
        # standalone questions: replace a generated question from the same unit (else the largest unit)
        for j, (u, lvl, p, c, w, why) in enumerate([x for x in Qa if x[1] == m]):
            gen = [i for i, q in enumerate(qs) if q["u"] == u and q.get("f") != "auth" and q.get("f") != "num"] or [i for i, q in enumerate(qs) if q.get("f") not in ("auth", "num", "case")]
            if not gen: continue
            i = gen[rs(E["id"], m, "pos", j).randrange(len(gen))]
            o, a = _opts(E["id"], m, ("q", j), c, w)
            qs[i] = dict(u=u, p=p, o=o, a=a, w=why, f="auth", id=qs[i].get("id"))
        # cases: remove as many generated questions as the cases bring, then append the case questions grouped
        mine = [c for c in CS if c["lvl"] == m]
        need = sum(len(c["qs"]) for c in mine)
        if need:
            gen = [i for i, q in enumerate(qs) if q.get("f") not in ("auth", "case")]
            drop = set(gen[-need:]) if len(gen) >= need else set(gen)
            keep = [q for i, q in enumerate(qs) if i not in drop]
            for ci, c in enumerate(mine):
                cases_out[m - 1].append(c["text"])
                for k, (p, cor, w, why) in enumerate(c["qs"]):
                    o, a = _opts(E["id"], m, ("c", ci, k), cor, w)
                    keep.append(dict(u=c["u"], p=p, o=o, a=a, w=why, f="case", c=ci, m=case_mark))
            qs[:] = keep
        for i, q in enumerate(qs, 1): q["id"] = f"{E['id']}-m{m}-{i:03d}"
    return cases_out
