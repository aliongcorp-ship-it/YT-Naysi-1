# scenes/

One episode, one folder. An episode is **three layers**, and each layer has
exactly one job:

```
scenes/script.mjs      what is said, and where it cuts        (data only)
scenes/<topic>.mjs     how this episode looks                 (identity + library)
scenes/y1.mjs … yN.mjs how each shot is drawn                 (one composition each)
```

`<topic>` is the subject of the video: `gps.mjs`, `bulan.mjs`, `otak.mjs`.
The user's layout, followed literally.

## 1. `script.mjs` — the script

```js
export const CHANNEL = {name: 'NAYSI'};
export const EPISODE = {slug: 'bulan', identity: 'regolith', topic: '…'};
export const acts = [
  {id: 'hook', em: ['Bulan', '3,8'], text: 'Bulan sedang menjauh …',
   shots: [{file: 'y1', label: 'cakrawala', from: 0.0, to: 0.54},
           {file: 'y2', label: '3,8 cm', from: 0.54, to: 'end'}]},
  …
];
```

* `text` is recorded **one file per act** into `src/vo/sN.mp3`, in array order.
  Edit a line, re-record it; the caption timings are measured from the take.
* `em` is the list of words the captions may colour. It is per act, so the
  highlight always matches the beat being spoken.
* `shots[].from` / `to` are fractions of the act's **measured** span. Re-takes
  move a cut, they never break it. `to: 'end'` means "to the end of the act".
* One act can carry several shots (the opening uses two). Any number of acts is
  allowed; the build reads however many there are.

## 2. `<topic>.mjs` — the identity and the library

This is the big file, and it is deliberately the big file: **every episode gets
its own look**, so this is where a video decides what it is.

```js
export const ID = {
  id: 'regolith',
  palette: {void, abyss, deep, mid, shallow, ink, muted, faint,
            accent, accentDim, hot, warm, alt},
  type: {display, mono, editorial},
  motion: {cut: 'cut' | 'bloom' | 'paper' | 'iris', punch, grain, ease},
  chrome: {watermark: true, marks: false, rail: false},
};
export const fonts = [ {family, file, weight, style}, … ];
export const Shots = {y1, y2, …};         // picture order
```

It also holds the primitives **this episode draws with** — the Moon, dust, the
finder frame, the measure. Those are not shared: a topic about seismographs
would draw a seismograph here instead.

Keep it under ~2 500 lines. If it grows past that, split the drawing primitives
into `scenes/lib/<topic>.mjs` and re-export from the topic file, so `Shots`
stays the single import the timeline needs.

## 3. `y1.mjs … yN.mjs` — the shots

```js
export const Compo = ({act, shot, t, local}) => <AbsoluteFill>…</AbsoluteFill>;
export default Compo;
```

* `local` is seconds since this shot started; `t` is film time; `act` carries
  the words and the measured span; `shot` carries the cut.
* Use **`local` everywhere**. A shot must look right at `local = 0` and at
  `local = last`, and must hold if the narration gets re-taken.
* No chrome: no slate, no act index, no chapter rule, no series tag. The only
  fixed overlay is the channel watermark, drawn once in `src/Timeline.tsx`.
* Add a composition, add its `file` to `script.mjs`, and it is in the film.
  `scripts/timeline.mjs` fails the build if a named file does not exist.

## The one rule

`scenes/*.mjs` are plain ES modules that contain JSX. `remotion.config.ts`
patches webpack so `.mjs` goes through esbuild as `tsx` and stays in automatic
module mode; `tsconfig.json` includes `scenes/`, so `tsc --noEmit` covers them
(no type annotations — they are `.mjs`, not `.ts`).

## Rebuilding after an edit

```sh
node scripts/timeline.mjs     # acts + shots + word timings from script.mjs
python3 scripts/score.py      # score, keyed to the words
python3 scripts/vo.py         # only after new narration takes
node scripts/build.mjs        # everything, then render
```
