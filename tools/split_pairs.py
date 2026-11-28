#!/usr/bin/env python3
"""Split two-paragraph TTS takes into the two chapter clips they contain.

The voice reads a paragraph break as a longer pause, so the split point is the
silent gap closest to where the word counts say the paragraph ends.
"""
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from vo_master import SR, decode, encode  # noqa: E402

PAIRS = [("test_pair", 1, 2), ("pair_34", 3, 4), ("pair_56", 5, 6),
         ("pair_78", 7, 8), ("pair_910", 9, 10), ("pair_1112", 11, 12)]


def read_vo() -> list[str]:
    src = open(os.path.join(ROOT, "scenes/vo.ts"), encoding="utf-8").read()
    block = src.split("readonly string[] = [", 1)[1].split("];", 1)[0]
    lines = [ln.strip() for ln in block.splitlines() if ln.strip().startswith("'")]
    return [re.match(r"^'((?:[^'\\]|\\.)*)'", ln).group(1) for ln in lines]


def envelope(x: np.ndarray, hop_s: float = 0.01) -> np.ndarray:
    hop = int(hop_s * SR)
    n = len(x) // hop
    return np.array([float(np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2))) for i in range(n)]), hop


def main() -> None:
    texts = read_vo()
    for name, a, b in PAIRS:
        path = os.path.join(ROOT, f"public/audio/{name}.mp3")
        x = decode(path)
        env, hop = envelope(x)
        thr = max(env.max() * 0.02, 1e-4)
        # silent runs
        runs = []
        i = 0
        n = len(env)
        while i < n:
            if env[i] <= thr:
                j = i
                while j < n and env[j] <= thr:
                    j += 1
                runs.append((i * hop / SR, j * hop / SR))
                i = j
            else:
                i += 1
        wa, wb = len(texts[a - 1].split()), len(texts[b - 1].split())
        expect = len(x) / SR * wa / (wa + wb)
        cands = [r for r in runs if 0.15 <= (r[1] - r[0]) and 1.0 < (r[0] + r[1]) / 2 < len(x) / SR - 1.0]
        cut = min(cands, key=lambda r: abs((r[0] + r[1]) / 2 - expect)) if cands else (expect, expect)
        mid = (cut[0] + cut[1]) / 2
        for idx, seg in ((a, x[: int(cut[0] * SR)]), (b, x[int(cut[1] * SR):])):
            # trim head/tail silence
            e, hp = envelope(seg)
            voiced = np.where(e > thr)[0]
            if len(voiced):
                s0 = max(0, voiced[0] * hp - int(0.05 * SR))
                s1 = min(len(seg), voiced[-1] * hp + int(0.12 * SR))
                seg = seg[s0:s1]
            out = os.path.join(ROOT, f"public/audio/raw_{idx:02d}.mp3")
            encode(seg, SR, out)
            print(f"ch{idx:02d}: {len(seg)/SR:6.2f}s  (from {name}, cut {mid:6.2f}s)")


if __name__ == "__main__":
    main()
