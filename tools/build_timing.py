#!/usr/bin/env python3
"""Turn the mastered narration into scenes/timing.ts (chapters, cards, word cues).

Word times are estimated from the mastered chapter duration, weighted by word
length and the punctuation that follows it, so a caption never lags the voice.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

META = [
    ("cahaya-tertunda", "ASTRONOMI · 8 MENIT 20 DETIK", "pelat fotografi surya", "#0B0A08", "#07070A"),
    ("hitung-jarak", "149 JUTA KM ÷ 300.000 KM/DETIK", "meja hitung brass", "#0C0B08", "#08090B"),
    ("bayangan-gravitasi", "GRAVITASI BERGERAK SECEPAT CAHAYA", "kisi orbit", "#080A0C", "#05070A"),
    ("lepas-orbit", "ORBIT LEPAS · 107.000 KM/JAM", "ruang antarbintang", "#07080B", "#04050A"),
    ("minggu-pertama", "MINGGU PERTAMA · DI BAWAH 0°C", "beku biru", "#0A0D10", "#06080B"),
    ("tahun-pertama", "TAHUN PERTAMA · −73°C", "laut membeku", "#080B0F", "#05070A"),
    ("raksasa-merah", "5 MILIAR TAHUN · RAKSASA MERAH", "bara putih", "#120A07", "#08070A"),
    ("masa-lalu", "CAHAYA ADALAH MASA LALU", "kamar gelap, lampu emas", "#0C0A07", "#07060A"),
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
    # prefer breaking after a comma near the middle
    cards, cur = [], []
    for w in words:
        cur.append(w)
        comma = w.endswith(",")
        if len(cur) >= 4 and (comma and len(cur) >= MAX_CARD_WORDS - 2 or len(cur) >= MAX_CARD_WORDS):
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
        base += 2.4
    if w.endswith((".", "?", "!")):
        base += 4.2
    if w.endswith(":"):
        base += 3.0
    return base


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
        total = sum(weights)
        span = vo_end - vo_start
        t = vo_start
        times = []
        for w, wt in zip(tokens, weights):
            d = span * wt / total
            times.append((t, t + d))
            t += d
        cards, k = [], 0
        for c in cards_text:
            n = len(c.split())
            base = k
            ws = times[k:k + n]
            k += n
            # emphasis: the most load-bearing word that is not the first one
            emph = None
            if n >= 4:
                body = list(range(1, n))
                emph = max(body, key=lambda i: weights[base + i])
            words = [[tokens_of(c)[i], round(ws[i][0], 3), round(ws[i][1], 3), 1 if emph == i else 0]
                     for i in range(n)]
            cards.append({
                "text": c,
                "start": round(max(vo_start, ws[0][0] - 0.05), 3),
                "end": round(min(vo_end + 0.35, ws[-1][1] + 0.14), 3),
                "words": words,
            })
        slug, eyebrow, mood, gt, gb = meta
        chapters.append({
            "index": row["index"], "slug": slug, "eyebrow": eyebrow,
            "groundTop": gt, "groundBottom": gb,
            "start": round(start, 3), "end": round(start + dur + 0.42, 3),
            "voStart": round(vo_start, 3), "voEnd": round(vo_end, 3),
            "mood": mood, "cards": cards,
        })
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
        out.append(f"      start: {ch['start']}, end: {ch['end']}, voStart: {ch['voStart']}, voEnd: {ch['voEnd']},")
        out.append(f"      mood: {ch['mood']!r},")
        out.append("      cards: [")
        for c in ch["cards"]:
            words = ", ".join(f"['{w[0].replace(chr(39), chr(92)+chr(39))}', {w[1]}, {w[2]}, {w[3]}]" for w in c["words"])
            text = c["text"].replace("'", "\\'")
            out.append(f"        {{ text: '{text}', start: {c['start']}, end: {c['end']}, words: [{words}] }},")
        out.append("      ],")
        out.append("    },")
    out.append("  ],")
    out.append("} as const;")
    return "\n".join(out) + "\n"


def tokens_of(card: str) -> list[str]:
    return card.split()


if __name__ == "__main__":
    src = build()
    open(os.path.join(ROOT, "scenes/timing.ts"), "w", encoding="utf-8").write(src)
    print("scenes/timing.ts written:", len(src.splitlines()), "lines")
