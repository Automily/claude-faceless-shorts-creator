#!/usr/bin/env python3
"""Re-time a beats.json from the REAL raw clip durations (run after one gen_voice pass).
Lays lines back-to-back: start0, then prev_start + raw_dur + gap (bigger gap at beat changes),
so no line needs tempo squeeze. Sets format.durationSec = last end + tail. Re-run gen_voice
afterwards (clips are cached by text, so it costs nothing).
usage: python tools/retime_vo.py <beats.json> [--start 0.4] [--gap 0.15] [--beat-gap 0.35] [--tail 1.3]
Optional per-line "pad_before" (sec) adds extra space before a line (e.g. a held reveal)."""
import argparse, glob, json, os, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("beats"); ap.add_argument("--start", type=float, default=0.4)
ap.add_argument("--gap", type=float, default=0.15); ap.add_argument("--beat-gap", type=float, default=0.35)
ap.add_argument("--tail", type=float, default=1.3)
ap.add_argument("--tempo", type=float, default=1.0, help="allow gen_voice to speed lines up by this much (<=1.15 sounds natural)")
a = ap.parse_args()
b = json.load(open(a.beats, encoding="utf-8")); vdir = os.path.join(os.path.dirname(a.beats), "voice")
t = a.start
for i, line in enumerate(b["vo"]):
    clips = [c for c in glob.glob(os.path.join(vdir, f"line-{i:02d}-*.mp3"))]
    clip = max(clips, key=os.path.getmtime)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clip]))
    if i:
        t += a.beat_gap if line["beat"] != b["vo"][i - 1]["beat"] else a.gap
        t += line.get("pad_before", 0)
    line["start"] = round(t, 2); t += d / a.tempo + 0.05
    print(f"{i:2d} {line['start']:6.2f} {d:5.2f} {line['text'][:60]}")
b["format"]["durationSec"] = round(t + a.tail, 1)
print("durationSec", b["format"]["durationSec"])
json.dump(b, open(a.beats, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
