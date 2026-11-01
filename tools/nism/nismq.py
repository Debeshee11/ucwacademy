import random, zlib, json
from numgen import G
def rs(*k): return random.Random(zlib.crc32("|".join(map(str, k)).encode()))
FORMS = {1: {"t2d": .5, "d2t": .5}, 2: {"d2t": .35, "t2d": .2, "mt": .45}, 3: {"scen": .45, "mt": .35, "d2t": .2}, 4: {"scen": .4, "mt": .3, "mis": .3}, 5: {"scen": .25, "mis": .4, "num": .35}}
LEVELS = {1: "Foundation", 2: "Core", 3: "Applied", 4: "Exam level", 5: "Beyond exam"}
def alloc(units, Q):
    raw = [u["w"] * Q / 100 for u in units]; n = [int(x) for x in raw]
    rem = Q - sum(n); order = sorted(range(len(units)), key=lambda i: raw[i] - n[i], reverse=True)
    for i in order[:rem]: n[i] += 1
    return n
def build_q(form, f, U, units, ex_pool, m, rng):
    F = U["facts"]; same = [x for x in F if x is not f]
    near = same if len(same) >= 3 and m >= 3 else [x for x in ex_pool if x is not f]
    def pick(key, pool, avoid, n=3):
        c = [x[key] for x in pool if x[key] not in avoid]; c = list(dict.fromkeys(c)); rng.shuffle(c); return c[:n]
    T, D, S_, M = f[0], f[1], f[2], f[3]
    if form == "t2d": return (f"Which statement best describes “{T}”?", D, pick(1, near, {D}), f"{T}: {D}")
    if form == "d2t": return (f"Which term is described here? {D}", T, pick(0, near, {T}), f"{T}: {D}")
    if form == "scen": return (f"{S_} Which idea does this illustrate?", T, pick(0, near, {T}), f"This is {T}. {D}")
    if form == "mt":
        w = pick(3, near, {M}, 3)
        return (f"Which statement about “{T}” is correct?", D, [M] + w[:2], f"Correct: {D}")
    if form == "mis":
        return ("Which of these statements is NOT correct?", M, pick(1, near, {D}), f"That statement is a common misunderstanding. The accurate position: {D}")
def build_mocks(ex, num=None, seed="m"):
    units = ex["units"]; Q = ex["qs"]; pool = [f for u in units for f in u["facts"]]
    quota = alloc(units, Q); used = set(); usedfact = {}
    mocks = []
    num = num or {}
    for m in range(1, 6):
        qs = []; forms = FORMS[m]
        for u, nq in zip(units, quota):
            rng = rs(ex["id"], m, u["n"], seed); facts = list(u["facts"]); rng.shuffle(facts)
            facts.sort(key=lambda f: usedfact.get(f[0], 0))
            k = 0; made = 0; fi = 0; guard = 0
            while made < nq and guard < nq * 20:
                guard += 1
                r = rng.random(); acc = 0; form = None
                for fm, p in forms.items():
                    acc += p
                    if r <= acc: form = fm; break
                form = form or list(forms)[-1]
                if form == "num":
                    gens = num.get(u["n"])
                    if not gens: form = rng.choice(["scen", "mis"])
                    else:
                        g = rng.choice(gens); sd = rng.randrange(10 ** 6)
                        p, c, w, why = G[g](random.Random(sd))
                        key = ("num", g, p)
                        if key in used or c in w or len(w) < 3: continue
                        used.add(key); opts = w[:3] + [c]; rr = rs(ex["id"], m, u["n"], made, "o"); rr.shuffle(opts)
                        qs.append(dict(u=u["n"], p=p, o=opts, a=opts.index(c), w=why, f="num")); made += 1; continue
                f = facts[fi % len(facts)]; fi += 1
                if (f[0], form) in used: continue
                if len(units) and form in ("mt", "mis") and not f[3]: continue
                t = build_q(form, f, u, units, pool, m, rng)
                used.add((f[0], form)); usedfact[f[0]] = usedfact.get(f[0], 0) + 1
                p, c, w, why = t; w = [x for x in w if x != c][:3]
                if len(w) < 3: continue
                opts = w + [c]; rr = rs(ex["id"], m, u["n"], made, "o"); rr.shuffle(opts)
                qs.append(dict(u=u["n"], p=p, o=opts, a=opts.index(c), w=why, f=form)); made += 1
            if made < nq:  # fall back: allow reuse of (fact, form)
                for f in facts:
                    if made >= nq: break
                    for form in ("d2t", "t2d", "scen"):
                        if made >= nq: break
                        key = (f[0], form, m)
                        if key in used: continue
                        used.add(key); p, c, w, why = build_q(form, f, u, units, pool, m, rng); w = [x for x in w if x != c][:3]
                        if len(w) < 3: continue
                        opts = w + [c]; rs(ex["id"], m, "fb", u["n"], made).shuffle(opts); qs.append(dict(u=u["n"], p=p, o=opts, a=opts.index(c), w=why, f=form)); made += 1
        rs(ex["id"], m, "all").shuffle(qs)
        for i, q in enumerate(qs, 1): q["id"] = f"{ex['id']}-m{m}-{i:03d}"
        mocks.append(dict(n=m, name=LEVELS[m], qs=qs))
    return mocks
