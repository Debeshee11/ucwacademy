#!/usr/bin/env python3
"""Turns scripts/voice/texts.json into recorded audio with the Sarvam Bulbul API, then writes one/audio/index.json.
Run from the repo root:   SARVAM_API_KEY=your_key python3 scripts/voice/make_audio.py [--lang en] [--speaker shubh] [--limit 20]
Safe to stop and run again: lines already recorded are skipped. Keep the key out of the repo."""
import os, sys, json, base64, re, time, argparse, urllib.request, urllib.error, io, wave
ap = argparse.ArgumentParser(); ap.add_argument("--lang", default="en"); ap.add_argument("--speaker", default="shubh"); ap.add_argument("--pace", type=float, default=0.95)
ap.add_argument("--limit", type=int, default=0, help="record only this many new lines (try 20 first)"); ap.add_argument("--model", default="bulbul:v3")
a = ap.parse_args()
KEY = os.environ.get("SARVAM_API_KEY"); 
if not KEY: sys.exit("Set SARVAM_API_KEY first.")
CODE = {"en": "en-IN", "hi": "hi-IN", "gu": "gu-IN"}[a.lang]
texts = json.load(open("scripts/voice/texts.json")); idx_path = "one/audio/index.json"
idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
def chunks(t, n=900):
    parts, cur = re.split(r"(?<=[.!?।])\s+", t), ""; out = []
    for s in parts:
        if len(cur) + len(s) + 1 > n and cur: out.append(cur); cur = s
        else: cur = (cur + " " + s).strip()
    if cur: out.append(cur)
    return out
def call(txt):
    body = json.dumps({"text": txt, "target_language_code": CODE, "model": a.model, "speaker": a.speaker, "pace": a.pace, "output_audio_codec": "mp3"}).encode()
    for tr in range(4):
        try:
            r = urllib.request.Request("https://api.sarvam.ai/text-to-speech", body, {"api-subscription-key": KEY, "Content-Type": "application/json"})
            return b"".join(base64.b64decode(x) for x in json.load(urllib.request.urlopen(r, timeout=90))["audios"])
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503): time.sleep(3 * (tr + 1)); continue
            sys.exit(f"API error {e.code}: {msg}")
    sys.exit("API kept failing; try again later.")
todo = [(k, t) for k, t in texts.items() if k.startswith(a.lang + "/") and k not in idx]; done = 0; chars = 0
print(len(todo), "lines to record,", sum(len(t) for _, t in todo), "characters")
for k, t in todo:
    if a.limit and done >= a.limit: break
    pieces = [call(c) for c in chunks(t)]
    if pieces[0][:4] == b"RIFF":
        ext = "wav"; w0 = wave.open(io.BytesIO(pieces[0])); params = w0.getparams(); frames = b"".join(wave.open(io.BytesIO(x)).readframes(10**9) for x in pieces)
        os.makedirs(f"one/audio/{a.lang}", exist_ok=True); w = wave.open(f"one/audio/{k}.wav", "wb"); w.setparams(params); w.writeframes(frames); w.close()
    else:
        ext = "mp3"; os.makedirs(f"one/audio/{a.lang}", exist_ok=True); open(f"one/audio/{k}.mp3", "wb").write(b"".join(pieces))
    idx[k] = ext; done += 1; chars += len(t)
    if done % 10 == 0: json.dump(idx, open(idx_path, "w")); print(done, "recorded")
json.dump(idx, open(idx_path, "w")); print("Done:", done, "lines,", chars, "characters. Commit one/audio/.")
