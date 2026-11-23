import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import { TL } from "./data";
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/archivo/latin-400.css";
import "@fontsource/archivo/latin-600.css";
import "@fontsource/archivo/latin-700.css";
import "@fontsource/archivo/latin-800.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    durationInFrames={TL.frames}
    fps={TL.fps}
    width={TL.width}
    height={TL.height}
  />
);
