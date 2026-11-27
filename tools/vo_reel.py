#!/usr/bin/env python3
"""Build a beep-coded narration reel (kandidat A/B/C) with identical mastering.

Each candidate is time-fitted to the channel narrator's pace, mastered to the
approved reference master, then stitched with 1/2/3 beeps so the listener can
tell them apart without any spoken label.
"""
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vo_master import SR, decode, encode  # noqa: E402

CANDIDATES = [
    ("A", "public/audio/_candA_raw.mp3"),
    ("B", "public/audio/_candB_raw.mp3"),
    ("C", "public/audio/_candC_raw.mp3"),
]
TARGET_SEC = 14.1  # 44 words at the reference narrator's ~187 wpm


def beeps(n: int) -> np.ndarray:
    tone = 0.09
    gap = 0.10
    t = np.arange(int(0.09 * SR)) / SR
    b = 0.28 * np.sin(2 * np.pi * 1050 * t) * np.hanning(len(t))
    out = np.zeros(int(0.5 * SR))
    for _ in range(n):
        out = np.concatenate([out, b, np.zeros(int(gap * SR))])
    return out


def silence(sec: float) -> np.ndarray:
    return np.zeros(int(sec * SR))


def main() -> None:
    reel = [silence(0.3)]
    for i, (label, path) in enumerate(CANDIDATES, start=1):
        raw = decode(path)
        tempo = max(1.0, min(1.18, (len(raw) / SR) / TARGET_SEC))
        out = f"/tmp/cand_{label}.mp3"
        subprocess.run(
            [sys.executable, "tools/vo_master.py", path, out,
             "--ref", "public/audio/master.mp3", "--tempo", f"{tempo:.3f}"],
            check=True,
        )
        x = decode(out)
        print(f"{label}: raw {len(raw)/SR:.2f}s, tempo x{tempo:.2f}, mastered {len(x)/SR:.2f}s")
        reel += [beeps(i), silence(0.35), x, silence(1.1)]
    y = np.concatenate(reel)
    encode(y / (np.abs(y).max() + 1e-9) * 0.95, SR, "public/audio/_vo_reel.mp3")
    print("reel:", f"{len(y)/SR:.2f}s")


if __name__ == "__main__":
    main()
