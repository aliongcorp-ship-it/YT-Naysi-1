import type {Act, Shot} from '../src/timeline';

/* What every shot receives. One shape for all of them, so the table in
   `src/Timeline.tsx` can hold them without casts, and so a new shot knows what
   is available before it is written.

   `local` is seconds since this shot started — the only clock a shot should
   read. `t` is film time and exists for the rare thing that has to line up
   across a cut (the closing fade, a date that runs over two shots). */
export type SceneProps = {
  act: Act;
  shot: Shot;
  t: number;
  local: number;
  total: number;
};
