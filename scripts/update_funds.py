#!/usr/bin/env python3
"""List and refresh mutual funds automatically from AMFI data (free feed: api.mfapi.in).

Run by .github/workflows/update-funds.yml every week. For every group in scripts/fund_rules.json it finds the matching
open-ended funds (Regular plan, Growth option), downloads each fund's NAV history, works out returns over 3M to 10Y,
ranks each fund inside its group, and writes one file for the Library page:

    python3 scripts/update_funds.py --out DATA_DIR      # writes DATA_DIR/funds-live.json

Funds already in one/data/funds.json keep their factsheet notes; only their NAV and returns are refreshed.
Holdings are NOT in this feed. Fund houses publish them monthly; the admin uploads them on the Fund data page.
Standard library only. When GITHUB_OUTPUT is set, "changed=true|false" is written to it.
"""
import argparse, datetime as dt, json, os, re, sys, time, urllib.request

API = "https://api.mfapi.in"
UA = "UCWAcademyFunds/1.0"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PERIODS = [("3M", 3, False), ("6M", 6, False), ("1Y", 12, False), ("3Y", 36, True), ("5Y", 60, True), ("10Y", 120, True)]
BAD = re.compile(r"\b(idcw|dividend|payout|reinvest\w*|bonus|direct|segregated|institutional|etf|retail)\b", re.I)


def get_json(path, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(API + path, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            print(f"  retry {path}: {e}", file=sys.stderr)
            time.sleep(2 * (i + 1))
    return None


def parse_date(s):
    return dt.datetime.strptime(s, "%d-%m-%Y").date()


def months_back(d, m):
    y, k = divmod(d.year * 12 + d.month - 1 - m, 12)
    day = min(d.day, [31, 29 if y % 4 == 0 and (y % 100 or y % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][k])
    return dt.date(y, k + 1, day)


def returns(history):
    """history: [{'date': 'DD-MM-YYYY', 'nav': '12.3'}], newest first. Returns (latest_nav, latest_date, first_date, {period: pct})."""
    pts = []
    for x in history:
        try:
            pts.append((parse_date(x["date"]), float(x["nav"])))
        except Exception:
            continue
    if not pts:
        return None
    pts.sort()
    latest_d, latest = pts[-1]
    out = {}
    for label, m, annual in PERIODS:
        target = months_back(latest_d, m)
        if pts[0][0] > target + dt.timedelta(days=5):
            out[label] = None
            continue
        past = next((v for d, v in reversed(pts) if d <= target), None)
        if not past:
            out[label] = None
        elif annual:
            out[label] = round(((latest / past) ** (12 / m) - 1) * 100, 2)
        else:
            out[label] = round((latest / past - 1) * 100, 2)
    return latest, latest_d, pts[0][0], out


def clean_name(n):
    return re.sub(r"\s+", " ", re.split(r"\s+-\s+|\s*\(", n)[0]).strip()


def tokens(name, aliases):
    s = name.lower().replace("&", " and ")
    for a, b in aliases.items():
        s = re.sub(r"(?<![a-z])" + re.escape(a) + r"(?![a-z])", b, s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    return {t for t in s.split() if t not in {"fund", "mutual", "plan", "regular", "growth", "the", "of", "and", "scheme", "option"}}


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:50]


def match_static(name, static, aliases):
    t = tokens(name, aliases)
    best, score = None, 0
    for sid, f in static.items():
        u = tokens(f["name"], aliases)
        if not t or not u:
            continue
        j = len(t & u) / len(t | u)
        if j > score:
            best, score = sid, j
    return best if score >= 0.75 else None


def category_type(cat):
    return (re.split(r"\s+scheme\b", cat, flags=re.I)[0] or "Other").strip().title()


def build(rules, latest_list, fetch=get_json, static=None, workers=4):
    """Phase 1: put every fund in a group. Phase 2: download NAV histories in parallel. Phase 3: returns, ranks, averages."""
    from concurrent.futures import ThreadPoolExecutor
    static = static or {}
    aliases = rules.get("aliases", {})

    def regular_growth(x):
        low = x.get("schemeName", "").lower()
        return "growth" in low and not BAD.search(low) and "open" in (x.get("schemeType") or "open").lower()

    pool = [x for x in latest_list if regular_growth(x)]
    used, groups, members = set(), [], []
    for g in rules["groups"]:
        cat, words = (g.get("category") or "").lower(), [w.lower() for w in g.get("name_has", [])]
        picks = [x for x in pool if x["schemeCode"] not in used and ((cat and cat in (x.get("schemeCategory") or "").lower()) or (words and all(w in x["schemeName"].lower() for w in words)))]
        picks = sorted(picks, key=lambda x: x["schemeName"])[: g.get("max", 40)]
        used.update(x["schemeCode"] for x in picks)
        groups.append({"id": g["id"], "name": g["name"], "type": g.get("type", "Other"), "funds": []}); members.append(picks)
    if rules.get("all_categories"):
        by = {}
        for x in pool:
            if x["schemeCode"] not in used and x.get("schemeCategory"):
                by.setdefault(x["schemeCategory"], []).append(x)
        cap = rules["all_categories"].get("max", 400) if isinstance(rules["all_categories"], dict) else 400
        for cat in sorted(by):
            picks = sorted(by[cat], key=lambda x: x["schemeName"])[:cap]
            groups.append({"id": slug(cat), "name": {"en": re.sub(r"^.*?\s-\s", "", cat).strip() or cat}, "type": category_type(cat), "funds": []}); members.append(picks)
    for g, picks in zip(groups, members):
        print(f"group {g['id']}: {len(picks)} funds")
    jobs = [x for picks in members for x in picks]

    def one(x):
        h = fetch(f"/mf/{x['schemeCode']}")
        return x["schemeCode"], (returns(h["data"]) if h and h.get("data") else None)
    with ThreadPoolExecutor(workers) as ex:
        results = dict(ex.map(one, jobs))

    funds = {}
    for g, picks in zip(groups, members):
        for x in picks:
            r = results.get(x["schemeCode"])
            if not r:
                continue
            nav, nav_d, first_d, ret = r
            name = clean_name(x["schemeName"])
            sid = match_static(name, static, aliases) or slug(name)
            if sid in funds:
                continue
            funds[sid] = {"name": static.get(sid, {}).get("name") or name, "house": x.get("fundHouse") or "", "category": x.get("schemeCategory") or "",
                          "nav": nav, "navDate": nav_d.strftime("%d-%b-%y"), "inception": first_d.strftime("%d-%b-%y"), "code": x["schemeCode"], "r": ret}
            g["funds"].append(sid)
    groups = [g for g in groups if g["funds"]]
    for g in groups:
        for label, _, _ in PERIODS:
            vals = [(funds[i]["r"][label], i) for i in g["funds"] if funds[i]["r"].get(label) is not None]
            avg = round(sum(v for v, _ in vals) / len(vals), 2) if vals else None
            vals.sort(reverse=True)
            for pos, (_, i) in enumerate(vals, 1):
                funds[i].setdefault("rank", {})[label] = f"{pos}/{len(vals)}"
            for i in g["funds"]:
                funds[i].setdefault("cat", {})[label] = avg
    for f in funds.values():
        r, c, k = f.pop("r"), f.pop("cat"), f.pop("rank", {})
        f["ret"] = {"periods": [p[0] for p in PERIODS], "fund": [r[p[0]] for p in PERIODS], "cat": [c.get(p[0]) for p in PERIODS],
                    "rank": [k.get(p[0], "–") for p in PERIODS], "asOf": f["navDate"]}
    return {"updated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "groups": groups, "funds": funds}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    rules = json.load(open(os.path.join(ROOT, "scripts", "fund_rules.json"), encoding="utf-8"))
    static = json.load(open(os.path.join(ROOT, "one", "data", "funds.json"), encoding="utf-8"))["funds"]
    latest = get_json("/mf/latest")
    if not isinstance(latest, list) or not latest:
        print("Could not read the fund list. Nothing changed.", file=sys.stderr)
        return 1
    data = build(rules, latest, static=static)
    if not data["funds"]:
        print("No funds found. Nothing changed.", file=sys.stderr)
        return 1
    os.makedirs(a.out, exist_ok=True)
    path = os.path.join(a.out, "funds-live.json")
    new = json.dumps({**data, "updated": ""}, ensure_ascii=False, sort_keys=True)
    old = ""
    if os.path.exists(path):
        try:
            old = json.dumps({**json.load(open(path, encoding="utf-8")), "updated": ""}, ensure_ascii=False, sort_keys=True)
        except Exception:
            pass
    changed = new != old
    if changed:
        json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(data['funds'])} funds, changed={changed}")
    if os.environ.get("GITHUB_OUTPUT"):
        open(os.environ["GITHUB_OUTPUT"], "a").write(f"changed={'true' if changed else 'false'}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
