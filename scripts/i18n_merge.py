#!/usr/bin/env python3
"""Rebuilds one/data/ui-<lang>.json and cat-<lang>.json from the checked batches.
usage: i18n_merge.py <work dir with keys.json, in/, out/> <data dir>"""
import json, sys, glob, os
w, d = sys.argv[1], sys.argv[2]
keys = json.load(open(f"{w}/keys.json"))
if os.path.exists(f"{w}/keys2.json"): keys += [["ui", k] for k in json.load(open(f"{w}/keys2.json"))]
res = {}
off = 0
for f in sorted(glob.glob(f"{w}/in/*.txt")):
    n = int(os.path.basename(f)[:2])
    src = [l.split("\t", 1) for l in open(f, encoding="utf8").read().rstrip("\n").split("\n")]
    out = {int(l.split("\t")[0]): l.split("\t") for l in open(f"{w}/out/{n:02d}.tsv", encoding="utf8").read().rstrip("\n").split("\n")}
    for j, (idx, en) in enumerate(src):
        k = off + j
        assert keys[k][1] == en, (n, j, keys[k][1], en)
        o = out[int(idx)]
        res[k] = (o[1].strip(), o[2].strip())
    off += len(src)
assert len(res) == len(keys), (len(res), len(keys))
for li, lang in ((0, "hi"), (1, "gu")):
    for srcname in ("ui", "cat"):
        m = {keys[k][1]: res[k][li] for k in range(len(keys)) if keys[k][0] == srcname}
        json.dump(m, open(f"{d}/{srcname}-{lang}.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
        print(srcname, lang, len(m))
