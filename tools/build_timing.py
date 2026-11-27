#!/usr/bin/env python3
"""Turn the mastered narration into scenes/timing.ts (chapters, cards, word cues).

Word times follow the actual audio envelope: silence gaps in the narration are
detected and words are only ever placed inside voiced spans, so captions stay
locked to the voice instead of drifting.
"""
import json
import os
import re
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from vo_master import SR, decode  # noqa: E402

META = [
    ("cahaya-tertunda", "ASTRONOMI · 8 MENIT 20 DETIK", "pelat fotografi surya", "#0B0A08", "#07070A"),
    ("hitung-jarak", "149.600.000 KM ÷ 299.792 KM/DETIK", "meja hitung kuningan", "#0C0B08", "#08090B"),
    ("masa-lalu-bintang", "TAHUN CAHAYA · PROXIMA 4,2 TAHUN", "atlas bintang", "#090B0E", "#05070A"),
    ("bayangan-gravitasi", "GRAVITASI BERGERAK SECEPAT CAHAYA", "kisi orbit", "#080A0C", "#05070A"),
    ("lepas-orbit", "ORBIT LEPAS · 107.000 KM/JAM", "ruang antarbintang", "#07080B", "#04050A"),
    ("minggu-pertama", "MINGGU PERTAMA · DI BAWAH 0°C", "gauge beku", "#0A0D10", "#06080B"),
    ("bulan-padam", "BULAN MEMANTULKAN CAHAYA MATAHARI", "langit tanpa bulan", "#08090D", "#04060A"),
    ("tahun-pertama", "TAHUN PERTAMA · −73°C", "laut membeku", "#080B0F", "#05070A"),
    ("ventilasi-hidrotermal", "HIDUP TANPA CAHAYA · 2.000 M", "dasar laut", "#07090C", "#04060A"),
    ("raksasa-merah", "5 MILIAR TAHUN · RAKSASA MERAH", "bara merah", "#120A07", "#08070A"),
    ("bara-putih", "NEBULA PLANET · BARA PUTIH", "nebula", "#0A0B10", "#06070C"),
    ("pesan-terakhir", "CAHAYA ADALAH MASA LALU", "kamar gelap, lampu emas", "#0C0A07", "#07060A"),
]

MAX_CARD_WORDS = 7


def read_vo() -> list[str]:
    src = open(os.path.join(ROOT, "scenes/vo.ts"), encoding="utf-8").read()
    block = src.split("readonly string[] = [", 1)[1].split("];", 1)[0]
    lines = [ln.strip() for ln in block.splitlines() if ln.strip().startswith("'")]
    return [re.match(r"^'((?:[^'\\]|\\.)*)'", ln).group(1) for ln in lines]


def sentence_split(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def card_split(sentence: str) -> list[str]:
    words = sentence.split()
    if len(words) <= MAX_CARD_WORDS:
        return [sentence]
    cards, cur = [], []
    for w in words:
        cur.append(w)
        comma = w.endswith(",")
        if len(cur) >= 4 and ((comma and len(cur) >= MAX_CARD_WORDS - 2) or len(cur) >= MAX_CARD_WORDS):
            cards.append(" ".join(cur))
            cur = []
    if cur:
        if cards and len(cur) < 3:
            cards[-1] += " " + " ".join(cur)
        else:
            cards.append(" ".join(cur))
    return cards


def clean(w: str) -> str:
    return re.sub(r"[^\w\-éÉ]", "", w)


def word_weight(w: str) -> float:
    base = max(3, len(clean(w))) * 0.62 + 1.0
    if w.endswith(","):
        base += 2.2
    if w.endswith((".", "?", "!")):
        base += 4.0
    if w.endswith(":"):
        base += 3.0
    return base


def voiced_spans(path: str, t0: float) -> list[tuple[float, float]]:
    """Absolute-time voiced intervals detected from the mastered chapter audio."""
    x = decode(path)
    hop = int(0.02 * SR)
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop : (i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    thr = max(0.006, 0.10 * float(np.percentile(rms, 92)))
    on = rms > thr
    spans, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        elif not v and start is not None:
            spans.append((start, i))
            start = None
    if start is not None:
        spans.append((start, n))
    # merge micro gaps (< 0.16 s) so a plosive does not split a word
    merged: list[list[int]] = []
    for a, b in spans:
        if merged and (a - merged[-1][1]) * 0.02 < 0.16:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return [(t0 + a * 0.02, t0 + b * 0.02) for a, b in merged if (b - a) * 0.02 > 0.05]


def build() -> str:
    data = json.load(open("/tmp/timing.json"))
    texts = read_vo()
    chapters = []
    for row, text, meta in zip(data["chapters"], texts, META):
        start, dur = row["start"], row["dur"]
        vo_start = start + 0.10
        vo_end = start + dur - 0.08
        cards_text = []
        for sent in sentence_split(text):
            cards_text += card_split(sent)
        tokens = [w for c in cards_text for w in c.split()]
        weights = [word_weight(w) for w in tokens]

        spans = voiced_spans(os.path.join(ROOT, f"public/audio/vo_{row['index']+1:02d}.mp3"), start)
        spans = [(max(a, vo_start), min(b, vo_end)) for a, b in spans]
        spans = [(a, b) for a, b in spans if b - a > 0.04] or [(vo_start, vo_end)]
        voiced_total = sum(b - a for a, b in spans)

        def at(v: float) -> float:
            """map voiced-time offset -> absolute time"""
            acc = 0.0
            for a, b in spans:
                if v <= acc + (b - a):
                    return a + (v - acc)
                acc += b - a
            return spans[-1][1]

        total = sum(weights)
        times, acc = [], 0.0
        for w in weights:
            d = voiced_total * w / total
            times.append((at(acc + 0.001), at(acc + d)))
            acc += d

        cards, k = [], 0
        for c in cards_text:
            n = len(c.split())
            base = k
            ws = times[k : k + n]
            k += n
            emph = None
            if n >= 4:
                emph = max(range(1, n), key=lambda i: weights[base + i])
            words = [
                [tokens[base + i], round(ws[i][0], 3), round(ws[i][1], 3), 1 if emph == i else 0]
                for i in range(n)
            ]
            cards.append(
                {
                    "text": c,
                    "start": round(max(vo_start, ws[0][0] - 0.04), 3),
                    "end": round(min(vo_end + 0.4, ws[-1][1] + 0.12), 3),
                    "words": words,
                }
            )
        slug, eyebrow, mood, gt, gb = meta
        chapters.append(
            {
                "index": row["index"],
                "slug": slug,
                "eyebrow": eyebrow,
                "groundTop": gt,
                "groundBottom": gb,
                "start": round(start, 3),
                "end": round(start + dur + 0.38, 3),
                "voStart": round(vo_start, 3),
                "voEnd": round(vo_end, 3),
                "mood": mood,
                "cards": cards,
            }
        )

    total_frames = int(round(data["total"] * 90))
    out = [
        "// GENERATED FILE — do not edit by hand. Rebuild with tools/build_timing.py",
        "export const TIMELINE = {",
        f"  totalFrames: {total_frames},",
        f"  totalDuration: {data['total']},",
        "  chapters: [",
    ]
    for ch in chapters:
        out.append("    {")
        out.append(f"      index: {ch['index']}, slug: {ch['slug']!r}, eyebrow: {ch['eyebrow']!r},")
        out.append(f"      groundTop: {ch['groundTop']!r}, groundBottom: {ch['groundBottom']!r},")
        out.append(
            f"      start: {ch['start']}, end: {ch['end']}, voStart: {ch['voStart']}, voEnd: {ch['voEnd']},"
        )
        out.append(f"      mood: {ch['mood']!r},")
        out.append("      cards: [")
        for c in ch["cards"]:
            words = ", ".join(
                f"['{w[0].replace(chr(39), chr(92) + chr(39))}', {w[1]}, {w[2]}, {w[3]}]" for w in c["words"]
            )
            text = c["text"].replace("'", "\\'")
            out.append(f"        {{ text: '{text}', start: {c['start']}, end: {c['end']}, words: [{words}] }},")
        out.append("      ],")
        out.append("    },")
    out.append("  ],")
    out.append("} as const;")
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    src = build()
    open(os.path.join(ROOT, "scenes/timing.ts"), "w", encoding="utf-8").write(src)
    print("scenes/timing.ts written:", len(src.splitlines()), "lines")
