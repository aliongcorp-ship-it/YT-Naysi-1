"""Procedural score + sound design, locked to src/data/cues.json.
Everything is synthesised from sine/saw/noise: no samples, no licensing."""
import json, wave, os
import numpy as np

SR = 48000
cues = json.load(open('src/data/cues.json'))
tl = json.load(open('src/data/timeline.json'))
DUR = cues['durationSec']
N = int(DUR * SR) + SR
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0:
        sig = sig[-i:]
        i = 0
    if i >= N: return
    n = min(len(sig), N - i)
    if n <= 0: return
    l = np.sqrt((1 - pan) / 2); r = np.sqrt((1 + pan) / 2)
    L[i:i+n] += sig[:n] * gain * l; R[i:i+n] += sig[:n] * gain * r

def env(n, a=0.01, d=0.2, s=0.6, r=0.3, sus=0.5):
    a_n, d_n, r_n = int(a*SR), int(d*SR), int(r*SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([np.linspace(0, 1, a_n, False), np.linspace(1, s, d_n, False),
                        np.full(s_n, s), np.linspace(s, 0, r_n)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

def sine(f, dur, phase=0.0):
    t = np.arange(int(dur*SR)) / SR
    return np.sin(2*np.pi*f*t + phase)

def saw(f, dur, detune=0.0):
    t = np.arange(int(dur*SR)) / SR
    v = 2*((t*(f*(1+detune))) % 1) - 1
    return v

def noise(dur):
    return rng.normal(0, 1, int(dur*SR))

def onepole_lp(x, cutoff):
    a = np.exp(-2*np.pi*cutoff/SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1-a)*x[i] + a*acc
        y[i] = acc
    return y

def fast_lp(x, cutoff):
    # FFT brickwall-ish soft low pass (cheap, no python loop)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1/SR)
    g = 1/(1 + (f/max(cutoff, 20))**2)
    return np.fft.irfft(X*g, len(x))

def fast_hp(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1/SR)
    g = 1 - 1/(1 + (f/max(cutoff, 20))**2)
    return np.fft.irfft(X*g, len(x))

NOTE = {'D1':36.71,'D2':73.42,'A2':110.0,'F2':87.31,'G2':98.0,'D3':146.83,'A3':220.0,'F3':174.61,'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'A4':440.0}

BPM = 96.0
BEAT = 60.0 / BPM
acts = cues['acts']

# ---------- drums / bass ----------
def kick(gain=0.9):
    d = 0.34
    t = np.arange(int(d*SR))/SR
    f = 92*np.exp(-t*22) + 42
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*7.5)
    click = noise(0.02) * np.exp(-np.arange(int(0.02*SR))/SR*260) * 0.25
    out = body.copy(); out[:len(click)] += click
    return out * gain

def hat(gainify=0.16, d=0.045):
    x = noise(d) * np.exp(-np.arange(int(d*SR))/SR*90)
    return fast_hp(x, 7000) * gainify

def snare(g=0.3):
    d = 0.18
    t = np.arange(int(d*SR))/SR
    body = np.sin(2*np.pi*180*t) * np.exp(-t*26) * 0.4
    nz = noise(d) * np.exp(-t*28)
    return (fast_hp(nz, 1400)*0.8 + body) * g

# ---------- harmony ----------
def pad(notes, dur, gain=0.2, cutoff=900, attack=1.2, release=1.4):
    n = int(dur*SR)
    out = np.zeros(n)
    for f in notes:
        for det in (-0.004, 0.0, 0.005):
            s = saw(f, dur, det)
            out += s
    out = fast_lp(out, cutoff)
    return out * env(n, a=attack, d=0.4, s=0.85, r=release) * gain / (len(notes)*3)

def drone(f, dur, gain=0.28):
    n = int(dur*SR)
    t = np.arange(n)/SR
    trem = 1 + 0.12*np.sin(2*np.pi*0.17*t)
    s = np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*2*t) + 0.22*np.sin(2*np.pi*f*3*t)
    return s * trem * env(n, a=2.0, d=1.0, s=0.9, r=2.0) * gain

def bassnote(f, dur, gain=0.3):
    n = int(dur*SR)
    s = fast_lp(saw(f, dur, 0.006) + saw(f, dur, -0.006)*0.6, 260)
    return s * env(n, a=0.006, d=0.09, s=0.55, r=0.09) * gain

# ---------- tonal fx ----------
def whoosh(dur=0.75, g=0.28, up=True):
    n = int(dur*SR); x = noise(dur)
    t = np.arange(n)/n
    bands = np.linspace(300, 5200, 12) if up else np.linspace(5200, 300, 12)
    out = np.zeros(n)
    for i, c in enumerate(bands):
        seg = slice(int(i*n/12), int((i+1)*n/12))
        out[seg] = fast_hp(fast_lp(x, c*1.6), c*0.6)[seg]
    return out * np.sin(np.pi*t)**1.6 * g

def impact(g=0.55):
    d = 1.1; t = np.arange(int(d*SR))/SR
    f = 120*np.exp(-t*9) + 34
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*3.4)
    nz = fast_lp(noise(d), 1400) * np.exp(-t*11) * 0.35
    return (body + nz) * g

def tick(g=0.1, f=2600):
    d = 0.03; t = np.arange(int(d*SR))/SR
    return (np.sin(2*np.pi*f*t) * np.exp(-t*300) + rng.normal(0, 0.4, int(d*SR))*np.exp(-t*500)) * g

def ding(g=0.22, f=NOTE['A4']):
    d = 1.4; t = np.arange(int(d*SR))/SR
    s = (np.sin(2*np.pi*f*t)*0.6 + np.sin(2*np.pi*f*2.01*t)*0.25 + np.sin(2*np.pi*f*3.02*t)*0.12)
    return s * np.exp(-t*3.2) * g

def riser(dur=2.2, g=0.22):
    n = int(dur*SR); x = noise(dur); t = np.arange(n)/n
    y = fast_hp(x, 800 + 3000*t.max())
    out = np.zeros(n)
    for i in range(10):
        seg = slice(int(i*n/10), int((i+1)*n/10))
        out[seg] = fast_hp(x, 600 + i*700)[seg]
    return out * (t**2.2) * g

# ---------- arrangement ----------
D2, A2, F2, G2 = NOTE['D2'], NOTE['A2'], NOTE['F2'], NOTE['G2']
CH = {'Dm': [NOTE['D3'], NOTE['F3'], NOTE['A3']], 'Gm': [NOTE['G2']*2, NOTE['A3']*1.0, NOTE['D4']],
      'Dmaj': [NOTE['D3'], NOTE['F3']*1.06, NOTE['A3']]}

add(drone(D2, DUR, 0.22), 0)
add(drone(A2, DUR, 0.07), 0)
# air
air = fast_hp(fast_lp(noise(DUR), 2200), 240) * 0.02
add(air, 0)

sections = [
    (0, 'drone'), (1, 'pulse'), (2, 'groove'), (3, 'clock'), (4, 'sparse'), (5, 'groove'), (6, 'lift'),
]
for a in acts:
    i = a['index'] - 1
    add(pad(CH['Dm'], min(6.0, a['end']-a['start']), 0.14, cutoff=700+150*i), a['start'] - 0.1)
    add(whoosh(0.8, 0.22 if i else 0.3), a['start'] - 0.12)
    if i >= 1:
        add(impact(0.5 if i in (2, 4, 6) else 0.34), a['start'])

# pulse / groove per act
for a in acts:
    i = a['index'] - 1
    s, e = a['start'], a['end']
    beat = s
    k = 0
    while beat < e - 0.35:
        bar_beat = k % 4
        if i == 0:
            if bar_beat == 0 and k >= 8: add(kick(0.32), beat)
        elif i in (1, 2, 3, 5):
            if bar_beat in (0, 2): add(kick(0.62 if bar_beat == 0 else 0.5), beat)
            if bar_beat in (1, 3) and i != 1: add(snare(0.16), beat)
            add(hat(0.1 if bar_beat % 2 == 0 else 0.14), beat + BEAT/2)
        elif i == 4:
            if bar_beat == 0 and k % 8 == 0: add(kick(0.5), beat)
        elif i == 6:
            if bar_beat == 0: add(kick(0.4), beat)
        beat += BEAT; k += 1

# bass ostinato in groove acts
PAT = [D2, D2, F2, G2, D2, D2, A2, G2]
for a in acts:
    i = a['index'] - 1
    if i not in (1, 2, 5, 6): continue
    t0, e = a['start'] + 0.1, a['end'] - 0.3
    step = BEAT / 2
    j = 0
    while t0 < e:
        add(bassnote(PAT[j % len(PAT)], step*0.9, 0.2 if i != 5 else 0.26), t0)
        t0 += step; j += 1

# clock ticks act 3
if len(acts) > 2:
    a = acts[2]; t0 = a['start'] + 0.2
    while t0 < a['end'] - 0.4:
        add(tick(0.05, 3200), t0); t0 += 0.5

# phrase-level sonic punctuation (very low level)
for a in acts:
    for p in a['phrases'][1:]:
        add(tick(0.028, 1900), p - 0.02, pan=0.15)

# highlights
add(ding(0.2, NOTE['A4']), acts[1]['start'] + 3.5)
add(riser(1.9, 0.16), acts[3]['start'] + 3.4)
add(ding(0.24, NOTE['D4']*2), acts[3]['start'] + 5.6)
add(impact(0.42), acts[4]['start'] + 6.7)
add(impact(0.5), acts[5]['start'] + 6.9)
add(riser(2.0, 0.14), acts[5]['start'] + 8.4)
add(pad(CH['Dmaj'], 9.0, 0.16, cutoff=1400, attack=1.6, release=3.0), acts[6]['start'] - 0.2)
add(ding(0.26, NOTE['D4']), acts[6]['start'] + 8.9)

# ---------- VO ----------
vo = np.zeros(N)
for i, a in enumerate(acts):
    with wave.open(f"audio/vo_fx/s{i+1}.wav") as w:
        raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768.0
        ch = w.getnchannels()
        if ch > 1: raw = raw.reshape(-1, ch).mean(1)
    add(vo, 0, 0)  # keep shape
    j = int(a['voStart']*SR); m = min(len(raw), N - j)
    vo[j:j+m] += raw[:m]

def db(x): return 20*np.log10(max(1e-9, np.sqrt(np.mean(x**2))))

def moving_average(x, n):
    left = n // 2
    padded = np.pad(x, (left, n - left - 1), mode='edge')
    integral = np.concatenate(([0.0], np.cumsum(padded, dtype=np.float64)))
    return (integral[n:] - integral[:-n]) / n

# duck music under the voice
envv = np.abs(vo)
win = int(0.05*SR)
envv = moving_average(envv, win)
envv = np.clip(envv / (envv.max()*0.25 + 1e-6), 0, 1)
att = int(0.02*SR)
duck = 1 - 0.55*np.clip(moving_average(envv, att), 0, 1)

print('MUSIC pre-duck RMS dB', round(db((L+R)/2),1))
print('DUCK depth avg dB', round(db(duck),1))
L *= 0.256; R *= 0.256
L *= duck; R *= duck
print('MUSIC post-duck RMS dB', round(db((L+R)/2),1))
print('VO RMS dB', round(db(vo),1))
L += vo*0.92; R += vo*0.92

# master: gentle glue + soft clip
def master(x):
    x = np.tanh(x*1.1)/1.1
    return x
L, R = master(L), master(R)
peak = max(np.abs(L).max(), np.abs(R).max())
L /= peak; R /= peak
L *= 0.92; R *= 0.92

out = np.stack([L, R], 1)
out = (np.clip(out, -1, 1) * 32767).astype(np.int16)
os.makedirs('audio/mix', exist_ok=True)
with wave.open('audio/mix/raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(out[:int(DUR*SR)].tobytes())
print('raw mix written', DUR)
