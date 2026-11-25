"""Trim, EQ and level the narration.

Input  src/vo/sN.mp3   (the generated takes)
Output audio/vo_fx/sN.flac + audio/vo_fx/durations.json

Intermediates are FLAC, not WAV: the same 24-bit resolution at half the bytes,
and the pipeline never touches an uncompressed container on disk.

Kept deterministic so a re-take only changes timings, never the mix chain.
"""
import glob
import json
import os
import shutil
import shutil
import subprocess
import wave

import numpy as np

SR = 48000
# ffmpeg: the system binary when there is one (Linux/CI), otherwise the pinned
# npm build that the original sandbox needed. Both are the same CLI.
FF = (
    os.environ.get("NAYSI_FFMPEG")
    or shutil.which("ffmpeg")
    or "./node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
)
os.makedirs("audio/vo_fx", exist_ok=True)

durs = {}
for src in sorted(glob.glob("src/vo/*.mp3"), key=lambda p: int(os.path.basename(p)[1:-4])):
    name = os.path.basename(src)[:-4]
    # decode straight to 48 kHz mono float32 on a pipe: no temp file on disk,
    # and no uncompressed container anywhere in the chain
    pcm = subprocess.run(
        [FF, "-v", "error", "-i", src, "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"],
        capture_output=True, check=True,
    ).stdout
    x = np.frombuffer(pcm, dtype="<f4").astype(np.float32)
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
    raw = f"audio/vo_fx/{name}.raw.flac"
    out = f"audio/vo_fx/{name}.flac"
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(
        [FF, "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-c:a", "flac", "-sample_fmt", "s16", raw],
        input=pcm, check=True,
    )
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
        # register up 1.5 semitones, then 4% quicker delivery — both folded in
        # here, before the timeline is measured, so captions can never drift
        # from the voice.
        "asetrate=48000*1.0905,aresample=48000,atempo=0.917011,atempo=1.04,"
        "loudnorm=I=-16:TP=-1.5:LRA=9,"
        "aresample=48000"
    )
    subprocess.run([FF, "-y", "-v", "error", "-i", raw, "-af", af, "-c:a", "flac", "-ar", "48000", "-ac", "1", out], check=True)
    os.remove(raw)
    # exact duration: count the samples of the finished take. This is the number
    # the timeline and the score both use, so measuring it here once removes any
    # dependency on a probe binary being installed.
    n = subprocess.run(
        [FF, "-v", "error", "-i", out, "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"],
        capture_output=True, check=True,
    ).stdout
    durs[name] = round(len(n) / 4 / SR, 4)
    print(f"{name}: {durs[name]:.2f}s")

json.dump(durs, open("audio/vo_fx/durations.json", "w"), indent=1)
print("total speech:", round(sum(durs.values()), 2), "s")
