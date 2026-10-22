#!/usr/bin/env python3
"""Fetch finance headlines from public RSS feeds and keep them in a 90-day archive.

Run by .github/workflows/update-headlines.yml every 30 minutes; the Market Desk page reads the result.
Only the headline, a short summary (max 220 characters), the source, the date and the link are kept —
never the full article. Standard library only.

    python3 scripts/fetch_news.py --dir DATA_DIR

DATA_DIR is a copy of the "news-data" branch (it may be empty on the first run). The script adds new headlines to it:

    news.json                the newest headlines (last 7 days, at most 200) — what the Market Desk shows first
    archive/YYYY-MM-DD.json  every headline published on that day (India time), kept for 90 days
    archive/index.json       the list of archived days with their headline counts

Headlines already archived are never dropped or changed, so old headlines stay when new ones come in. Archive files older than
90 days are deleted. If nothing changed, no file is written. When GITHUB_OUTPUT is set, "changed=true|false" is written to it.
"""
import argparse, datetime as dt, email.utils, hashlib, html, json, os, re, sys, time, urllib.request
import xml.etree.ElementTree as ET

# some publishers (Business Standard) refuse unknown agents, so identify as a normal browser plus our own name
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 UCWAcademyHeadlines/1.0"
SUMMARY_MAX = 220          # characters: a short summary, then link out
PER_FEED_MAX = 40          # newest items taken from each feed per run
MAX_AGE_DAYS = 10          # ignore feed items older than this when fetching
RECENT_DAYS = 7            # news.json covers this many days
RECENT_MAX = 200
RETAIN_DAYS = 90           # archive files older than this are deleted
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))

# SEBI's feed is mostly enforcement paperwork against named individuals (with PAN numbers). Keep policy items only.
SEBI_NOISE = re.compile(
    r"prohibitory order|recovery certificate|\bRC\b|\bPAN\b|notice of demand|release order|attachment|completion of|"
    r"^appeal no|in the matter of|confirmatory order|^order in|adjudication|settlement|show cause|defaulter|"
    r"corrigendum|demand notice|^order against|^orders? passed", re.I)

# The RBI's press-release feed is mostly routine paperwork (government securities auctions, repo operations, T-bills, money market data)
# and penalties on small co-operative banks. Keep policy: MPC minutes, directions and regulation, speeches.
RBI_PRESS_NOISE = re.compile(
    r"auction|underwriting|money market operations|variable rate (repo|reverse repo)|\bVRR\b|\bVRRR\b|treasury bills?|t-bill|cut-off|"
    r"reserve money|weekly statistical|ways and means|liquidity adjustment|standing deposit|result of|monetary penalty|"
    r"directions under section 35 ?a|licen[cs]e|co-?operative (urban )?bank|state development loans?|sovereign green bonds?|"
    r"issue of .*(bonds?|securities)|conversion|switch", re.I)
RBI_NOTIF_NOISE = re.compile(r"UAPA|section 51A|sanctions list|\bUNSC\b|ISIL|al-?qaida|taliban", re.I)

FEEDS = [
    {"id": "et-markets", "source": "Economic Times", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "topics": ["markets"]},
    {"id": "et-mf", "source": "Economic Times", "url": "https://economictimes.indiatimes.com/mf/rssfeeds/359241701.cms", "topics": ["mf"]},
    {"id": "mint-markets", "source": "Mint", "url": "https://www.livemint.com/rss/markets", "topics": ["markets"]},
    {"id": "mint-money", "source": "Mint", "url": "https://www.livemint.com/rss/money", "topics": []},
    {"id": "bs-markets", "source": "Business Standard", "url": "https://www.business-standard.com/rss/markets-106.rss", "topics": ["markets"]},
    {"id": "sebi", "source": "SEBI", "url": "https://www.sebi.gov.in/sebirss.xml", "topics": ["sebi"], "skip": SEBI_NOISE},
    # RBI feed descriptions are whole circulars, so only the headline is kept (no summary)
    {"id": "rbi-press", "source": "RBI", "url": "https://www.rbi.org.in/pressreleases_rss.xml", "topics": ["rbi"], "skip": RBI_PRESS_NOISE, "no_summary": True},
    {"id": "rbi-notifications", "source": "RBI", "url": "https://rbi.org.in/notifications_rss.xml", "topics": ["rbi"], "skip": RBI_NOTIF_NOISE, "no_summary": True},
    {"id": "rbi-speeches", "source": "RBI", "url": "https://www.rbi.org.in/speeches_rss.xml", "topics": ["rbi"], "no_summary": True},
]

# topic tags found in the headline or summary (a feed's own topic is always added)
RULES = [
    ("mf", re.compile(r"\b(mutual funds?|SIPs?|NFOs?|AMFI|fund houses?|AMCs?|ETFs?|flexi[- ]?cap|index funds?|debt funds?|hybrid funds?|ELSS|SWP|STP|fund managers?)\b", re.I)),
    ("ipo", re.compile(r"\b(IPOs?|DRHP|RHP|GMP|anchor investors?|public issue|listing gains?|subscription status|share allotment)\b", re.I)),
    ("sebi", re.compile(r"\bSEBI\b")),
    ("rbi", re.compile(r"\b(RBI|Reserve Bank|repo rate|policy rate|monetary policy|MPC|rate (cut|hike)s?|CRR|SLR|fiscal deficit|Union Budget|GST Council|Finance Ministry)\b", re.I)),
    ("markets", re.compile(r"\b(Sensex|Nifty|stocks?|shares?|FIIs?|FPIs?|rupee|bond yields?|crude oil|gold prices?|Dalal Street)\b", re.I)),
]
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def fetch(url):
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml, */*"})
            with urllib.request.urlopen(req, timeout=25) as r:
                return r.read()
        except Exception as e:  # network error, 403, timeout ...
            last = e
            time.sleep(2 * (attempt + 1))
    raise last


def parse_date(text):
    s = (text or "").strip()
    if not s:
        return None
    try:
        d = email.utils.parsedate_to_datetime(s)
        if d.tzinfo is None:
            d = d.replace(tzinfo=IST)
        return d.astimezone(dt.timezone.utc)
    except Exception:
        pass
    # SEBI also sends "21 Oct, 2026 +0530" (date only)
    m = re.match(r"(\d{1,2})\s+([A-Za-z]{3})[a-z]*,?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*([+-]\d{4})?", s)
    if m and m.group(2).lower() in MONTHS:
        day, mon, year = int(m.group(1)), MONTHS[m.group(2).lower()], int(m.group(3))
        hh, mm, ss = int(m.group(4) or 0), int(m.group(5) or 0), int(m.group(6) or 0)
        off = m.group(7) or "+0530"
        tz = dt.timezone(dt.timedelta(hours=int(off[:3]), minutes=int(off[0] + off[3:5])))
        return dt.datetime(year, mon, day, hh, mm, ss, tzinfo=tz).astimezone(dt.timezone.utc)
    return None


def clean(text):
    t = re.sub(r"<[^>]+>", " ", text or "")
    t = html.unescape(html.unescape(t))          # some feeds double-encode (&amp;nbsp;)
    return re.sub(r"\s+", " ", t.replace("\xa0", " ")).strip()


def shorten(text, limit):
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:- ")
    return cut + "…"


def norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()


def child_text(item, name):
    for el in item:
        if el.tag.split("}")[-1] == name:
            return el.text or ""
    return ""


def ist_day(iso):
    d = dt.datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc)
    return d.astimezone(IST).strftime("%Y-%m-%d")


def parse_feed(feed, raw, now):
    root = ET.fromstring(raw)
    out = []
    for item in root.iter("item"):
        title = clean(child_text(item, "title")).rstrip(" -–—")
        link = child_text(item, "link").strip()
        if len(title) < 12 or not link.startswith("http"):
            continue
        if feed.get("skip") and feed["skip"].search(title):
            continue
        date = parse_date(child_text(item, "pubDate")) or now
        if now - date > dt.timedelta(days=MAX_AGE_DAYS):
            continue
        summary = "" if feed.get("no_summary") else clean(child_text(item, "description"))
        if norm_title(summary) == norm_title(title) or summary.lower().startswith(title.lower()[:60]):
            summary = ""
        summary = shorten(summary, SUMMARY_MAX)
        topics = list(feed["topics"])
        blob = title + " " + summary
        for name, rx in RULES:
            if name not in topics and rx.search(blob):
                topics.append(name)
        link = re.sub(r"[?&]utm_[^&]+", "", link)
        out.append({
            "id": hashlib.sha1(link.encode()).hexdigest()[:12],
            "title": title, "link": link, "source": feed["source"], "feed": feed["id"],
            "date": date.strftime("%Y-%m-%dT%H:%M:%SZ"), "summary": summary, "topics": topics[:3],
        })
    out.sort(key=lambda x: x["date"], reverse=True)
    return out[:PER_FEED_MAX]


# ---- files -----------------------------------------------------------------------------------------------------------
def dumps(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def read_text(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None


def read_json(path):
    text = read_text(path)
    try:
        return json.loads(text) if text else None
    except ValueError:
        return None


def set_output(changed):
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if changed else 'false'}\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True, help="working copy of the news-data branch")
    args = ap.parse_args()
    root = args.dir
    arch = os.path.join(root, "archive")
    os.makedirs(arch, exist_ok=True)
    now = dt.datetime.now(dt.timezone.utc)

    # 1. what is already archived: day -> [items]
    days = {}
    for name in os.listdir(arch):
        m = re.fullmatch(r"(\d{4}-\d{2}-\d{2})\.json", name)
        if m:
            doc = read_json(os.path.join(arch, name))
            days[m.group(1)] = list(doc.get("items", [])) if isinstance(doc, dict) else []
    touched = set()

    # 2. fetch every feed; a feed that is down only means fewer new items, nothing already archived is lost
    status, fresh = [], []
    for feed in FEEDS:
        try:
            got = parse_feed(feed, fetch(feed["url"]), now)
            status.append({"feed": feed["id"], "ok": True, "count": len(got)})
            fresh.extend(got)
        except Exception as e:
            status.append({"feed": feed["id"], "ok": False, "count": 0, "error": str(e)[:100]})
            print(f"WARNING: {feed['id']} failed ({e})", file=sys.stderr)
    for s in status:
        print(f"{s['feed']:14} ok={s['ok']} items in feed={s['count']}")
    if not any(s["ok"] for s in status):
        print("ERROR: every feed failed; leaving the archive untouched", file=sys.stderr)
        set_output(False)
        return 1

    # 3. add new headlines to their day, skipping ones already there (same link, or same headline from another feed)
    added = 0
    for it in sorted(fresh, key=lambda x: x["date"]):
        day = ist_day(it["date"])
        items = days.setdefault(day, [])
        same = next((x for x in items if x["id"] == it["id"] or norm_title(x["title"]) == norm_title(it["title"])), None)
        if same:
            if same["id"] != it["id"]:                      # same headline from another feed: merge its topics
                for tp in it["topics"]:
                    if tp not in same["topics"] and len(same["topics"]) < 3:
                        same["topics"].append(tp); touched.add(day)
            continue
        items.append(it); touched.add(day); added += 1

    # 4. write the changed day files; delete days past the retention window
    changed = False
    cutoff = (now.astimezone(IST) - dt.timedelta(days=RETAIN_DAYS)).strftime("%Y-%m-%d")
    for day in sorted(days):
        path = os.path.join(arch, day + ".json")
        if day < cutoff:
            if os.path.exists(path):
                os.remove(path); changed = True
            del days[day]
            continue
        if day in touched:
            days[day].sort(key=lambda x: x["date"], reverse=True)
            text = dumps({"date": day, "items": days[day]})
            if read_text(path) != text:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(text)
                changed = True

    # 5. the index of archived days, newest first
    index_text = dumps({"days": [{"date": d, "count": len(days[d])} for d in sorted(days, reverse=True)]})
    index_path = os.path.join(arch, "index.json")
    if read_text(index_path) != index_text:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(index_text)
        changed = True

    # 6. news.json: the newest headlines from the last few days
    recent_from = (now.astimezone(IST) - dt.timedelta(days=RECENT_DAYS - 1)).strftime("%Y-%m-%d")
    recent = sorted((x for d, items in days.items() if d >= recent_from for x in items), key=lambda x: x["date"], reverse=True)[:RECENT_MAX]
    news_path = os.path.join(root, "news.json")
    old = read_json(news_path)
    if not isinstance(old, dict) or old.get("items") != recent:
        with open(news_path, "w", encoding="utf-8") as f:
            f.write(dumps({"updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": status, "items": recent}))
        changed = True

    print(f"added {added} new headlines; the archive holds {sum(len(v) for v in days.values())} headlines over {len(days)} days; news.json has {len(recent)}")
    print("changed" if changed else "nothing changed; nothing to publish")
    set_output(changed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
