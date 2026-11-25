#!/bin/bash
# usage: finish.sh <short-suffix> <Comp> <durSec> <queue-id>  -> full render, voice mux, sfx mix, loudness, copy to posting/ready
set -e
cd /home/user/claude-faceless-shorts-creator
export REMOTION_BROWSER_EXECUTABLE=${REMOTION_BROWSER_EXECUTABLE:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/ | head -1)chrome-headless-shell}
(cd remotion && node scripts/render-all.mjs $2 --scale=1 >/dev/null 2>&1)
ffmpeg -loglevel error -y -i remotion/out/$2.mp4 -i tales/tale-$1/voice/voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t $3 remotion/out/$2-voiced.mp4
out=$(python3 -c "import json;print(json.load(open('tales/tale-$1/sfx-plan.json'))['render']['out'])")
PYTHONIOENCODING=utf-8 python3 tools/mix_sfx.py tales/tale-$1/sfx-plan.json >/dev/null
lufs=$(ffmpeg -hide_banner -i $out -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep "I:" | awk '{print $2}')
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $out)
cp $out posting/ready/$4.mp4 && echo "$4 $2 lufs=$lufs dur=$dur"
