"""Procedural score + sound design for "Dasar yang Gelap".
Everything is synthesised from oscillators and noise: no samples, no licensing.
Reads src/data/cues.json (written by scripts/timeline.mjs) so every hit is on a word.
"""
import json
import os
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(2030)

cues = json.load(open("src/data/cues.json"))
DUR = cues["durationSec"]
N = int(DUR * SR)

L = np.zeros(N)
R = np.zeros(N)


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    if n <= 0:
        return
    lg = np.sqrt((1 - pan) / 2)
    rg = np.sqrt((1 + pan) / 2)
    L[i:i + n] += sig[:n] * gain * lg
    R[i:i + n] += sig[:n] * gain * rg


def env(n, a=0.01, d=0.15, s=0.7, r=0.4, sus=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n, endpoint=False),
    ])
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def sine(f, dur, phase=0.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t + phase)


def saw(f, dur, detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    ph = (t * f * (1 + detune)) % 1.0
    return 2 * ph - 1


def noise(dur):
    return rng.normal(0, 1, max(1, int(dur * SR)))


def lp(x, cutoff, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 / (1 + (f / max(cutoff, 25)) ** order)
    return np.fft.irfft(X * g, len(x))


def hp(x, cutoff, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 - 1 / (1 + (f / max(cutoff, 25)) ** order)
    return np.fft.irfft(X * g, len(x))


def bp(x, lo, hi):
    return hp(lp(x, hi), lo)


def space(x, decay=0.42, taps=(0.031, 0.049, 0.071, 0.097, 0.131, 0.173, 0.229)):
    """cheap lush tail: multi-tap feedback network"""
    wet = x.copy()
    for _ in range(3):
        for k, t in enumerate(taps):
            d = int(t * SR * (1 + k * 0.17))
            if d < len(wet):
                wet[d:] += wet[:-d] * decay * (0.86 ** k)
    return wet


NOTE = {
    "D1": 36.71, "A1": 55.00, "C2": 65.41, "D2": 73.42, "E2": 82.41, "F2": 87.31,
    "G2": 98.00, "A2": 110.0, "Bb2": 116.54, "C3": 130.81, "D3": 146.83, "E3": 164.81,
    "F3": 174.61, "G3": 196.0, "A3": 220.0, "C4": 261.63, "D4": 293.66, "E4": 329.63,
    "F4": 349.23, "G4": 392.0, "A4": 440.0, "C5": 523.25, "D5": 587.33, "E5": 659.25,
    "G5": 783.99, "A5": 880.0,
}

# ── instruments ────────────────────────────────────────────────────────────
def pad(notes, dur, gain=0.22, cutoff=780, attack=1.6, release=2.0):
    n = int(dur * SR)
    out = np.zeros(n)
    for f in notes:
        for det in (-0.006, -0.002, 0.003, 0.007):
            s = saw(f, dur, det)
            out[: len(s)] += s
    out = lp(out, cutoff)
    return out * env(n, a=attack, d=0.6, s=0.82, r=release) * gain / (len(notes) * 4)


def drone(f, dur, gain=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    trem = 1 + 0.13 * np.sin(2 * np.pi * 0.13 * t)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2 * t) + 0.2 * np.sin(2 * np.pi * f * 3 * t)
    return s * trem * env(n, a=2.5, d=1.0, s=0.9, r=2.5) * gain


def subhit(gain=0.5, f0=64, f1=30, dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 7)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 2.6) * gain


def impact(gain=0.55):
    n = int(1.8 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 8) + 32) / SR) * np.exp(-t * 2.4)
    nz = lp(noise(1.8), 900) * np.exp(-t * 7) * 0.4
    return (body + nz) * gain


def ping(f=NOTE["A5"], gain=0.16, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4)
    s += 0.5 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 3.4)
    s += 0.22 * np.sin(2 * np.pi * f * 3.02 * t) * np.exp(-t * 4.6)
    return s * gain


def tick(gain=0.07, f=3200):
    n = int(0.02 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 380) + rng.normal(0, 0.5, n) * np.exp(-t * 600)) * gain


def blip(f, gain=0.1, dur=0.14):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 26) * gain


def whoosh(dur=1.1, gain=0.22, up=True):
    n = int(dur * SR)
    x = noise(dur)
    t = np.arange(n) / n
    bands = np.geomspace(240, 6400, 14) if up else np.geomspace(6400, 240, 14)
    out = np.zeros(n)
    for i, c in enumerate(bands):
        s0, s1 = int(i * n / 14), int((i + 1) * n / 14)
        seg = bp(x, c * 0.55, c * 1.9)
        out[s0:s1] = seg[s0:s1]
    return out * (np.sin(np.pi * t) ** 1.5) * gain


def riser(dur=3.0, gain=0.18):
    n = int(dur * SR)
    x = noise(dur)
    t = np.arange(n) / n
    out = np.zeros(n)
    for i in range(12):
        s0, s1 = int(i * n / 12), int((i + 1) * n / 12)
        seg = hp(x, 500 + i * 620)
        out[s0:s1] = seg[s0:s1]
    return out * (t ** 2.1) * gain


def heartbeat(gain=0.3):
    a = subhit(gain, 70, 40, 0.55)
    return a


def bell(f, gain=0.1, dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    parts = [(1, 1.0), (2.76, 0.42), (5.4, 0.2), (8.9, 0.1)]
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * (1.6 + m * 0.9)) for m, a in parts)
    return s * gain


# ── arrangement ────────────────────────────────────────────────────────────
acts = cues["acts"]
A = {a["id"]: a for a in acts}

CHORDS = {
    "darkside": ["D2", "A2", "F3", "C4"],
    "blindspot": ["D2", "A2", "F3", "E4"],
    "depth": ["Bb2", "F2", "D3", "A3"],
    "detach": ["D2", "F2", "C3", "A3"],
    "life": ["G2", "D3", "Bb2", "F3"],
    "pressure": ["D2", "Bb2", "F2", "D3"],
    "ridge": ["G2", "D3", "A3", "E4"],
    "close": ["D2", "A2", "C3", "F3"],
}

DRONE_GAIN = {
    "darkside": 0.30, "blindspot": 0.24, "depth": 0.30, "detach": 0.34,
    "life": 0.20, "pressure": 0.32, "ridge": 0.26, "close": 0.22,
}

for a in acts:
    aid = a["id"]
    st, en = a["start"], a["end"]
    dur = en - st + 0.6
    chord = [NOTE[k] for k in CHORDS[aid]]
    # bed
    place(pad(chord, dur, gain=0.26, cutoff=620 + 260 * (aid in ("ridge", "pressure"))), st, 0.9)
    place(drone(NOTE["D1"], dur, gain=DRONE_GAIN[aid]), st, 1.0)
    # act-entry whoosh + impact on the first word
    if a["index"] > 1:
        place(whoosh(1.0, 0.2, up=True), st - 0.62, 1.0, -0.2)
        place(impact(0.34), st - 0.05, 1.0)
    # sonar pings on the opening chapter
    if aid == "darkside":
        for k, at in enumerate([0.7, 3.1, 6.4, 10.2, 14.0, 17.0]):
            place(space(ping(NOTE["A5"], 0.13, 2.4)), at, 0.9, 0.35 if k % 2 else -0.35)
    # data ticks follow the narration in the numbers chapter
    if aid in ("blindspot", "depth", "pressure"):
        for i, w in enumerate(a["words"]):
            if i % 2 == 0:
                place(tick(0.05 + 0.03 * (aid == "pressure"), 2600 + (i % 5) * 380), w, 1.0, 0.3)
    # 16th pulse in the driving chapters
    if aid in ("pressure", "ridge"):
        bpm = 92 if aid != "ridge" else 100
        step = 60 / bpm / 4
        k = 0
        tt = st
        while tt < en:
            if k % 4 == 0:
                place(space(heartbeat(0.18), 0.3), tt, 0.85)
            place(blip(NOTE["D4"] * (1 if k % 8 < 4 else 1.5), 0.045, 0.1), tt, 1.0, -0.25 if k % 2 else 0.25)
            tt += step
            k += 1
    # glassy arpeggio for the bioluminescence + spectrum chapters
    if aid in ("life",):
        arp = [NOTE[k] for k in ("D4", "F4", "A4", "C5", "E5")]
        step = 0.52
        k = 0
        tt = st + 0.4
        while tt < en - 0.4:
            if k % 2 == 0:
                place(space(bell(arp[(k // 2) % len(arp)], 0.075, 2.6), 0.34), tt, 1.0, np.sin(k) * 0.4)
            tt += step
            k += 1
    # reverse riser into the biggest reveals
    if aid in ("detach", "depth", "close", "blindspot"):
        place(riser(min(3.4, dur * 0.35), 0.16), en - 3.4, 1.0)

# ── moment-specific sound design ───────────────────────────────────────────
def word_at(aid, idx):
    a = A[aid]
    return a["words"][min(idx, len(a["words"]) - 1)]


place(space(ping(NOTE["D5"], 0.2, 3.2), 0.5), 0.55, 1.0)
place(impact(0.5), word_at("detach", 24) - 0.05)          # "terkelupas"
place(subhit(0.55, 58, 26, 2.2), word_at("depth", 6) - 0.05)
place(impact(0.42), word_at("blindspot", 0) - 0.02)
place(impact(0.36), word_at("pressure", 12) - 0.05)
place(impact(0.4), A["close"]["words"][0] - 0.05)
place(space(ping(NOTE["A5"], 0.18, 3.4), 0.6), A["close"]["voStart"] + 1.4, 0.8)
place(riser(3.0, 0.2), A["close"]["start"] - 2.8)

# low tide wash under the last line
nt = int(3.2 * SR)
tt = np.arange(nt) / SR
wash = lp(noise(3.2), 480) * np.sin(np.pi * np.arange(nt) / nt) ** 2 * 0.1
place(wash, A["close"]["end"] - 3.4, 1.0)

# ── room tone: filtered noise bed, so silence reads as depth, not as a dropout ─
rt = lp(noise(DUR), 220) * 0.012
rt += lp(noise(DUR), 900) * 0.004
tt = np.linspace(0, 1, len(rt))
rt *= np.sin(np.pi * np.clip(tt * 1.02, 0, 1)) ** 0.35
place(rt, 0.0, 1.0)

# ── VO-reactive ducking ────────────────────────────────────────────────────
vo = np.zeros(N)
for a in acts:
    p = f"audio/vo_fx/s{a['index']}.wav"
    if not os.path.exists(p):
        continue
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    place(x, a["voStart"], 1.0)
    vo[int(a["voStart"] * SR): int(a["voStart"] * SR) + len(x)] += x

# envelope follower (10 ms blocks, smoothed) -> gentle music duck
win = int(0.02 * SR)
envw = int(np.ceil(N / win))
seg = np.zeros(envw)
for i in range(envw):
    s = vo[i * win:(i + 1) * win]
    seg[i] = np.sqrt(np.mean(s ** 2)) if len(s) else 0.0
kernel = np.ones(9) / 9
seg = np.convolve(seg, kernel, mode="same")
duck = np.clip(seg / 0.06, 0, 1)
duck = np.repeat(duck, win)[:N]
duck = np.pad(duck, (0, max(0, N - len(duck))))
music_gain = 1.0 - 0.42 * duck

mix_l = L * music_gain + vo * 1.0
mix_r = R * music_gain + vo * 1.0

# master bus: gentle glue + soft clip
def limiter(x, ceil=0.94):
    x = np.tanh(x * 1.12) / np.tanh(1.12)
    m = np.max(np.abs(x))
    if m > ceil:
        x = x * (ceil / m)
    return x


mix_l = limiter(mix_l)
mix_r = limiter(mix_r)

os.makedirs("audio/mix", exist_ok=True)
stereo = np.stack([mix_l, mix_r], axis=1)
with wave.open("audio/mix/raw.wav", "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())

print(f"score written: {N / SR:.1f}s  peak {max(np.max(np.abs(mix_l)), np.max(np.abs(mix_r))):.3f}")
