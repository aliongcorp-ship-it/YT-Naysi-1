"""Trim, EQ and level the narration.

Input  src/vo/sN.mp3   (the generated takes)
Output audio/vo_fx/sN.wav + audio/vo_fx/durations.json

Kept deterministic so a re-take only changes timings, never the mix chain.
"""
import glob
import json
import os
import subprocess
import wave

import numpy as np

SR = 48000
FF = "./node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
os.makedirs("audio/vo_fx", exist_ok=True)

durs = {}
for src in sorted(glob.glob("src/vo/*.mp3"), key=lambda p: int(os.path.basename(p)[1:-4])):
    name = os.path.basename(src)[:-4]
    # decode to exactly 48 kHz mono PCM before any sample work
    subprocess.run([FF, "-y", "-v", "error", "-i", src, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", f"/tmp/{name}.wav"], check=True)
    with wave.open(f"/tmp/{name}.wav") as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        sr = w.getframerate()
    os.remove(f"/tmp/{name}.wav")
    # --- trim lead / tail silence (PCM 16 bit, -42 dBFS) ---
    win = int(0.01 * SR)
    frames = len(x) // win
    rms = np.array([np.sqrt(np.mean(x[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(frames)])
    th = 10 ** (-42 / 20)
    idx = np.where(rms > th)[0]
    a = max(0, (idx[0] - 4) * win) if len(idx) else 0
    b = min(len(x), (idx[-1] + 6) * win) if len(idx) else len(x)
    x = x[a:b]
    # --- gentle fade edges so cuts never click ---
    f = int(0.008 * SR)
    if len(x) > 2 * f:
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
    raw = f"audio/vo_fx/{name}.raw.wav"
    out = f"audio/vo_fx/{name}.wav"
    with wave.open(raw, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    # --- low shelf for chest, de-mud, presence, soft compression, loudness ---
    af = (
        "highpass=f=72:poles=2,"
        "equalizer=f=118:t=q:w=0.8:g=2.4,"
        "equalizer=f=340:t=q:w=1.1:g=-2.6,"
        "equalizer=f=3100:t=q:w=1.0:g=1.8,"
        "equalizer=f=7200:t=q:w=1.4:g=-1.2,"
        "acompressor=threshold=-19dB:ratio=3.2:attack=8:release=180:makeup=2,"
        # Register match: the reference narration measures F0 median 146.8 Hz
        # with a p25/p75 spread of 114/195. The selected take sits at 132.2 Hz
        # (107/176) — the same voice, a shade lower. One and a half semitones
        # up lands it at 141.6 Hz (114/186) without changing duration: asetrate
        # resamples, atempo cancels the resulting tempo change exactly.
        "asetrate=48000*1.0905,aresample=48000,atempo=0.917011,"
        "loudnorm=I=-16:TP=-1.5:LRA=9,"
        "aresample=48000"
    )
    subprocess.run([FF, "-y", "-v", "error", "-i", raw, "-af", af, "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "1", out], check=True)
    os.remove(raw)
    with wave.open(out) as w:
        durs[name] = round(w.getnframes() / w.getframerate(), 4)
    print(f"{name}: {durs[name]:.2f}s")

json.dump(durs, open("audio/vo_fx/durations.json", "w"), indent=1)
print("total speech:", round(sum(durs.values()), 2), "s")
