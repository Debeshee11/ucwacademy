#!/usr/bin/env python3
"""Cache-busting for the published site. Usage: stamp.py <site-dir> <version>
Adds ?v=<version> to every script, stylesheet and module import, so a browser never mixes old and new files
after an upload. Run on the copy that is published (the workflow does this); the source files stay clean."""
import re, sys, pathlib

root, ver = pathlib.Path(sys.argv[1]), sys.argv[2][:12]
q = "?v=" + ver

def js(text):
    text = re.sub(r'((?:from|import)\s*["\']\./[A-Za-z0-9_-]+\.js)(\?v=[A-Za-z0-9]+)?(["\'])', lambda m: m.group(1) + q + m.group(3), text)
    return text

n = 0
for f in (root / "one" / "js").glob("*.js"):
    t = f.read_text(encoding="utf8"); u = js(t)
    if u != t: f.write_text(u, encoding="utf8"); n += 1

idx = root / "index.html"
h = idx.read_text(encoding="utf8")

# Speed, done on the published copy only (the source files stay as they are):
# 1. The stylesheets are joined into one file, in the order index.html lists them, so the page asks for one file instead of a dozen.
css = re.findall(r'<link rel="stylesheet" href="(one/css/[A-Za-z0-9_.-]+\.css)(?:\?v=[A-Za-z0-9]+)?">\n?', h)
if len(css) > 1 and all((root / c).exists() for c in css):
    (root / "one" / "css" / "app.css").write_text("\n".join(f"/* {c} */\n" + (root / c).read_text(encoding="utf8") for c in css), encoding="utf8")
    first = True
    def one(m):
        global first
        out = '<link rel="stylesheet" href="one/css/app.css">\n' if first else ""
        first = False
        return out
    h = re.sub(r'<link rel="stylesheet" href="one/css/[A-Za-z0-9_.-]+\.css(?:\?v=[A-Za-z0-9]+)?">\n?', one, h)
# 2. The browser is told about every script module and the course files up front, so they download side by side
#    instead of one after another as each file discovers the next.
hints = []
boot = ["courses", "lessons", "sims", "funds", "fundqs", "indices", "companies", "indexqs", "exams"]   # the list in one/js/data.js
if (root / "one" / "content").is_dir():
    hints += [f'<link rel="preload" as="fetch" crossorigin href="one/content/{n}.json{q}">' for n in boot if (root / "one" / "content" / (n + ".json")).exists()]
if 'src="one/js/app.bundle.js' not in h:   # one bundled file needs no module hints
    hints += [f'<link rel="modulepreload" href="one/js/{f.name}{q}">' for f in sorted((root / "one" / "js").glob("*.js")) if f.name not in ("admin.js", "adminreviews.js", "team.js", "boardadmin.js", "funddata.js", "app.bundle.js")]
if "modulepreload" not in h:
    h = h.replace("</head>", "\n".join(hints) + "\n</head>", 1)

h = re.sub(r'((?:src|href)="one/(?:js|css|vendor)/[A-Za-z0-9_.-]+\.(?:js|css))(\?v=[A-Za-z0-9]+)?"', lambda m: m.group(1) + q + '"', h)
idx.write_text(h, encoding="utf8")

# 3. Course files are published without spaces and line breaks.
import json
for f in (root / "one" / "content").rglob("*.json") if (root / "one" / "content").is_dir() else []:
    try: f.write_text(json.dumps(json.loads(f.read_text(encoding="utf8")), ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    except Exception as e: print("left as is:", f.name, e)

# The service worker carries the release id, so each release keeps its own offline copy and clears the previous one.
sw = root / "sw.js"
if sw.exists():
    t = sw.read_text(encoding="utf8")
    sw.write_text(re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "{ver}";', t, count=1), encoding="utf8")

print(f"stamped {n} modules and index.html with {q}")
