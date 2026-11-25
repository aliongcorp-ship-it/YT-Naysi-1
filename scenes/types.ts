import type {Act, Shot} from '../src/timeline';

/* What every shot receives. One shape for all of them, so the table in
   `src/Timeline.tsx` holds them without casts, and a new shot knows exactly
   what is available before it is written.

   `local` is seconds since this shot started — the only clock a shot reads.
   `act` carries the words and the measured span; `shot` carries the cut; `t` is
   film time, for the rare thing that has to line up across a cut. */
export type SceneProps = {
  act: Act;
  shot: Shot;
  t: number;
  local: number;
  total: number;
};
