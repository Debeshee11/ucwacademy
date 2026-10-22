#!/usr/bin/env python3
"""Fetch finance headlines from public RSS feeds and write them to news.json.

Run by .github/workflows/update-headlines.yml every 30 minutes; the Market Desk page reads the result.
Only the headline, a short summary (max 220 characters), the source, the date and the link are kept —
never the full article. Standard library only.

    python3 scripts/fetch_news.py --out news.json [--prev previous-news.json]

If nothing changed since --prev, no file is written (the workflow then skips the publish step).
"""
import argparse, datetime as dt, email.utils, hashlib, html, json, re, sys, time, urllib.request
import xml.etree.ElementTree as ET

# some publishers (Business Standard) refuse unknown agents, so identify as a normal browser plus our own name
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 UCWAcademyHeadlines/1.0"
SUMMARY_MAX = 220          # characters: a short summary, then link out
PER_FEED_MAX = 40          # newest items kept from each feed
TOTAL_MAX = 200
MAX_AGE_DAYS = 10

# SEBI's feed is mostly enforcement paperwork against named individuals (with PAN numbers). Keep policy items only.
SEBI_NOISE = re.compile(
    r"prohibitory order|recovery certificate|\bRC\b|\bPAN\b|notice of demand|release order|attachment|completion of|"
    r"^appeal no|in the matter of|confirmatory order|^order in|adjudication|settlement|show cause|defaulter|"
    r"corrigendum|demand notice|^order against|^orders? passed", re.I)

FEEDS = [
    {"id": "et-markets", "source": "Economic Times", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "topics": ["markets"]},
    {"id": "et-mf", "source": "Economic Times", "url": "https://economictimes.indiatimes.com/mf/rssfeeds/359241701.cms", "topics": ["mf"]},
    {"id": "mint-markets", "source": "Mint", "url": "https://www.livemint.com/rss/markets", "topics": ["markets"]},
    {"id": "mint-money", "source": "Mint", "url": "https://www.livemint.com/rss/money", "topics": []},
    {"id": "bs-markets", "source": "Business Standard", "url": "https://www.business-standard.com/rss/markets-106.rss", "topics": ["markets"]},
    {"id": "sebi", "source": "SEBI", "url": "https://www.sebi.gov.in/sebirss.xml", "topics": ["sebi"], "skip": SEBI_NOISE},
]

# topic tags found in the headline or summary (a feed's own topic is always added)
RULES = [
    ("mf", re.compile(r"\b(mutual funds?|SIPs?|NFOs?|AMFI|fund houses?|AMCs?|ETFs?|flexi[- ]?cap|index funds?|debt funds?|hybrid funds?|ELSS|SWP|STP|fund managers?)\b", re.I)),
    ("ipo", re.compile(r"\b(IPOs?|DRHP|RHP|GMP|anchor investors?|public issue|listing gains?|subscription status|share allotment)\b", re.I)),
    ("sebi", re.compile(r"\bSEBI\b")),
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
            d = d.replace(tzinfo=dt.timezone(dt.timedelta(hours=5, minutes=30)))
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


def parse_feed(feed, raw, now):
    root = ET.fromstring(raw)
    out = []
    for item in root.iter("item"):
        title = clean(child_text(item, "title"))
        link = child_text(item, "link").strip()
        if len(title) < 12 or not link.startswith("http"):
            continue
        if feed.get("skip") and feed["skip"].search(title):
            continue
        date = parse_date(child_text(item, "pubDate")) or now
        if now - date > dt.timedelta(days=MAX_AGE_DAYS):
            continue
        summary = clean(child_text(item, "description"))
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--prev")
    args = ap.parse_args()
    now = dt.datetime.now(dt.timezone.utc)
    prev = {}
    if args.prev:
        try:
            prev = json.load(open(args.prev, encoding="utf-8"))
        except Exception:
            prev = {}
    prev_items = prev.get("items", []) if isinstance(prev, dict) else []

    items, status = [], []
    for feed in FEEDS:
        try:
            got = parse_feed(feed, fetch(feed["url"]), now)
            status.append({"feed": feed["id"], "ok": True, "count": len(got)})
        except Exception as e:
            # keep what we had for a feed that is down, so one failure does not empty the page
            got = [x for x in prev_items if x.get("feed") == feed["id"]
                   and now - dt.datetime.strptime(x["date"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc) <= dt.timedelta(days=MAX_AGE_DAYS)]
            status.append({"feed": feed["id"], "ok": False, "count": len(got), "error": str(e)[:100]})
            print(f"WARNING: {feed['id']} failed ({e}); kept {len(got)} earlier items", file=sys.stderr)
        items.extend(got)

    # drop duplicates (same headline from two feeds), merging their topics
    seen, unique = {}, []
    for it in sorted(items, key=lambda x: x["date"], reverse=True):
        k = norm_title(it["title"])
        if k in seen:
            for tp in it["topics"]:
                if tp not in seen[k]["topics"] and len(seen[k]["topics"]) < 3:
                    seen[k]["topics"].append(tp)
            continue
        seen[k] = it
        unique.append(it)
    unique = unique[:TOTAL_MAX]

    for s in status:
        print(f"{s['feed']:14} ok={s['ok']} items={s['count']}")
    print(f"total after de-duplication: {len(unique)}")
    if not unique:
        print("ERROR: no headlines at all; leaving the previous file untouched", file=sys.stderr)
        return 1
    if prev_items == unique:
        print("Headlines unchanged; nothing to write.")
        return 0
    doc = {"updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": status, "items": unique}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Wrote {args.out} ({len(unique)} items)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
