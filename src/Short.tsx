import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "./theme";
import { TL } from "./data";
import { CutFX, Grain, Vignette } from "./fx";
import { HUD, Subtitle, SubtitleShade } from "./ui/HUD";
import { S1Hook } from "./scenes/S1Hook";
import { S2Name } from "./scenes/S2Name";
import { S3Distance } from "./scenes/S3Distance";
import { S4ISS } from "./scenes/S4ISS";
import { S5Cemetery } from "./scenes/S5Cemetery";
import { S6Bloop } from "./scenes/S6Bloop";
import { S7Resolve } from "./scenes/S7Resolve";
import { S8Reveal } from "./scenes/S8Reveal";
import { S9End } from "./scenes/S9End";

const SCENES: Record<string, React.FC> = {
  s1: S1Hook,
  s2: S2Name,
  s3: S3Distance,
  s4: S4ISS,
  s5: S5Cemetery,
  s6: S6Bloop,
  s7: S7Resolve,
  s8: S8Reveal,
  s9: S9End,
};

export const Short: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {TL.scenes.map((s) => {
        const Comp = SCENES[s.id];
        return (
          <Sequence
            key={s.id}
            from={s.startFrame}
            durationInFrames={s.durationInFrames}
            name={s.id}
          >
            <Comp />
          </Sequence>
        );
      })}

      <SubtitleShade />
      <CutFX />
      <HUD />
      <Subtitle />
      <Grain opacity={0.05} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
  );
};
