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
h = re.sub(r'((?:src|href)="one/(?:js|css|vendor)/[A-Za-z0-9_.-]+\.(?:js|css))(\?v=[A-Za-z0-9]+)?"', lambda m: m.group(1) + q + '"', h)
idx.write_text(h, encoding="utf8")
print(f"stamped {n} modules and index.html with {q}")
