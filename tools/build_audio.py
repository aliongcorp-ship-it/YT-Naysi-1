#!/usr/bin/env python3
"""Master the 8 narration chunks with the locked voice and stitch master.mp3.

Reads public/audio/raw_XX.mp3, applies the Naysi mastering chain (EQ match to
the approved narrator, compression, loudness) at a pace close to the channel
narrator, writes public/audio/vo_XX.mp3 + master.mp3 and a timing map.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from vo_master import SR, decode, encode  # noqa: E402

TARGET_WPM = 180.0
HEAD = 0.35
GAP = 0.36
TAIL = 1.45


def read_vo() -> list[str]:
    src = open(os.path.join(ROOT, "scenes/vo.ts"), encoding="utf-8").read()
    block = src.split("readonly string[] = [", 1)[1].split("];", 1)[0]
    lines = [ln.strip() for ln in block.splitlines() if ln.strip().startswith("'")]
    return [re.match(r"^'((?:[^'\\]|\\.)*)'", ln).group(1) for ln in lines]


def wpm(text: str, dur: float) -> float:
    return len(text.split()) / (dur / 60.0)


def main() -> None:
    texts = read_vo()
    assert len(texts) == 12, len(texts)
    starts, durs, rows = [], [], []
    pos = HEAD
    for i, text in enumerate(texts, start=1):
        raw = os.path.join(ROOT, f"public/audio/raw_{i:02d}.mp3")
        dur_raw = len(decode(raw)) / SR
        tempo = min(1.28, max(1.0, TARGET_WPM / wpm(text, dur_raw)))
        tempo = round(tempo, 3)
        out = os.path.join(ROOT, f"public/audio/vo_{i:02d}.mp3")
        subprocess.run(
            [sys.executable, os.path.join(HERE, "vo_master.py"), raw, out,
             "--ref", os.path.join(ROOT, "public/audio/ref_narrator.mp3"),
             "--tempo", f"{tempo:.3f}"],
            check=True,
        )
        d = len(decode(out)) / SR
        starts.append(pos)
        durs.append(d)
        rows.append({"index": i - 1, "start": round(pos, 3), "dur": round(d, 3),
                     "text": text, "tempo": tempo, "wpm_raw": round(wpm(text, dur_raw), 1)})
        print(f"ch{i}: raw {dur_raw:5.2f}s  x{tempo:.2f} -> {d:5.2f}s  start {pos:6.2f}s")
        pos += d + GAP

    total = pos - GAP + TAIL
    track = np.zeros(int(total * SR))
    for row, d in zip(rows, durs):
        x = decode(os.path.join(ROOT, f"public/audio/vo_{row['index']+1:02d}.mp3"))
        s = int(row["start"] * SR)
        track[s:s + len(x)] += x
    lead = int(0.02 * SR)
    track[:lead] = 0.0
    track[-int(0.05 * SR):] = 0.0
    encode(track, SR, os.path.join(ROOT, "public/audio/master.mp3"))
    json.dump({"total": round(total, 3), "chapters": rows},
              open("/tmp/timing.json", "w"), indent=1)
    print(f"master: {total:.3f}s")


if __name__ == "__main__":
    main()
