#!/usr/bin/env python3
"""Voice mastering for Naysi shorts.

The narration voice must sound like the channel's approved narrator. The TTS
voice itself is not addressable by id across sessions, so we lock the closest
available narrator and match its acoustics to the approved master:
  * long-term average spectrum (LTAS) EQ match, smoothed, limited to +-7 dB
  * gentle downward compression + presence lift
  * loudness normalisation to a fixed RMS target

Usage:
  python3 tools/vo_master.py in.mp3 out.mp3 --ref public/audio/master.mp3
"""
import argparse
import os
import subprocess
import tempfile

import numpy as np

SR = 44100


def ffmpeg_bin() -> str:
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return os.environ.get("FFMPEG", "ffmpeg")


def decode(path: str, sr: int = SR) -> np.ndarray:
    out = subprocess.run(
        [ffmpeg_bin(), "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)


def encode(x: np.ndarray, sr: int, path: str, bitrate: str = "192k") -> None:
    x = np.clip(x, -1.0, 1.0).astype(np.float32)
    cmd = [
        ffmpeg_bin(), "-v", "quiet", "-y",
        "-f", "f32le", "-ac", "1", "-ar", str(sr), "-i", "-",
        "-c:a", "libmp3lame", "-b:a", bitrate, path,
    ]
    subprocess.run(cmd, input=x.tobytes(), check=True)


def stft(x: np.ndarray, n: int = 2048, hop: int = 512):
    win = np.hanning(n)
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    frames = 1 + (len(pad) - n) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(frames)[:, None]
    return np.fft.rfft(pad[idx] * win, axis=1), win, pad.shape[0]


def istft(spec: np.ndarray, win: np.ndarray, hop: int, total: int) -> np.ndarray:
    frames = np.fft.irfft(spec, axis=1) * win
    n = len(win)
    out = np.zeros(hop * (len(frames) - 1) + n)
    norm = np.zeros_like(out)
    for i, f in enumerate(frames):
        out[i * hop : i * hop + n] += f
        norm[i * hop : i * hop + n] += win ** 2
    out /= np.maximum(norm, 1e-6)
    return out[n : n + total]


def ltas(x: np.ndarray, sr: int = SR, nbands: int = 40):
    """Smoothed long-term average spectrum in dB over log-spaced bands."""
    spec, win, total = stft(x)
    mag = np.abs(spec)
    energy = mag.sum(axis=1)
    keep = energy > np.percentile(energy, 55)  # voiced-ish frames only
    avg = mag[keep].mean(axis=0)
    freqs = np.fft.rfftfreq(len(win), 1 / sr)
    lo, hi = 80.0, 12000.0
    edges = np.geomspace(lo, hi, nbands + 1)
    centres, vals = [], []
    for a, b in zip(edges[:-1], edges[1:]):
        m = (freqs >= a) & (freqs < b)
        if not m.any():
            continue
        centres.append(float(np.sqrt(a * b)))
        vals.append(float(avg[m].mean()))
    centres = np.array(centres)
    db = 20 * np.log10(np.array(vals) + 1e-12)
    # smooth in log-frequency
    k = np.array([0.25, 0.5, 0.25])
    db = np.convolve(np.pad(db, 1, mode="edge"), k, mode="valid")
    return centres, db


def build_gain_curve(src_db, ref_db, limit_db=7.0):
    g = np.clip(ref_db - ref_db.mean() - (src_db - src_db.mean()), -limit_db, limit_db)
    k = np.array([0.2, 0.6, 0.2])
    return np.convolve(np.pad(g, 1, mode="edge"), k, mode="valid")


def apply_curve(x: np.ndarray, sr: int, centres, gain_db) -> np.ndarray:
    spec, win, total = stft(x)
    freqs = np.fft.rfftfreq(len(win), 1 / sr)
    g = np.interp(freqs, centres, gain_db, left=gain_db[0], right=0.0)
    out = istft(spec * (10 ** (g / 20.0))[None, :], win, 512, total)
    return out


def presence(x: np.ndarray, sr: int, db: float = 1.6) -> np.ndarray:
    """Air/presence lift so the narrator sits forward like the reference."""
    spec, win, total = stft(x)
    freqs = np.fft.rfftfreq(len(win), 1 / sr)
    lift = 1 + (10 ** (db / 20) - 1) * np.clip((freqs - 3200) / 6000, 0, 1)
    return istft(spec * lift[None, :], win, 512, total)


def compress(x: np.ndarray, sr: int, thr_db: float = -22.0, ratio: float = 2.4,
             attack_ms: float = 8.0, release_ms: float = 160.0) -> np.ndarray:
    env = np.abs(x)
    a = np.exp(-1 / (sr * attack_ms / 1000))
    r = np.exp(-1 / (sr * release_ms / 1000))
    smooth = np.empty_like(env)
    acc = 0.0
    for i, v in enumerate(env):
        acc = v if v > acc else acc * r + v * (1 - r)
        smooth[i] = acc
    db = 20 * np.log10(smooth + 1e-9)
    over = np.maximum(db - thr_db, 0)
    gain_db = -(over - over / ratio)
    g = 10 ** (gain_db / 20)
    return x * g


def level(x: np.ndarray, target_db: float = -19.0, peak: float = 0.92) -> np.ndarray:
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    x = x * (10 ** (target_db / 20) / rms)
    m = np.abs(x).max()
    if m > peak:
        x = x * (peak / m)
    return x


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--ref", default="public/audio/master.mp3")
    ap.add_argument("--no-eq", action="store_true")
    ap.add_argument("--tempo", type=float, default=1.0)
    args = ap.parse_args()

    src = args.src
    if abs(args.tempo - 1.0) > 1e-3:
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
        subprocess.run(
            [ffmpeg_bin(), "-v", "quiet", "-y", "-i", args.src,
             "-filter:a", f"atempo={args.tempo:.4f}", "-ar", str(SR), "-ac", "1", tmp],
            check=True,
        )
        src = tmp
    x = decode(src)
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    x = presence(x, SR)
    x = compress(x, SR)
    if not args.no_eq and os.path.exists(args.ref):
        r = decode(args.ref)
        cs, sdb = ltas(x, SR)
        cr, rdb = ltas(r, SR)
        g = build_gain_curve(sdb, rdb, limit_db=7.0)
        # match reference band centres onto our grid
        g = np.interp(cs, cr, g)
        x = apply_curve(x, SR, cs, g)
        x = compress(x, SR, thr_db=-20.0, ratio=1.8)
    x = level(x)
    # 30 ms fade in / 120 ms fade out so cuts never click
    n_in, n_out = int(0.03 * SR), int(0.12 * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    encode(x, SR, args.dst)
    print(f"{args.dst}: {len(x) / SR:.2f}s")


if __name__ == "__main__":
    main()
