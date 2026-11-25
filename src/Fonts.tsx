import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// The face list is passed in by the episode, not baked in here: the type
// pairing is part of the visual identity, so `scenes/<topic>.mjs` owns it and
// a new episode ships its own .woff2 files under public/fonts.
export type Face = {family: string; file: string; weight: string; style: string};

export const FontGate: React.FC<{faces: Face[]; children: React.ReactNode}> = ({faces, children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = faces
      .map(
        (f) =>
          `@font-face{font-family:'${f.family}';src:url('${staticFile(f.file)}') format('woff2');font-weight:${f.weight};font-style:${f.style};font-display:block}`
      )
      .join('\n');
    document.head.appendChild(style);
    Promise.all(faces.map((f) => document.fonts.load(`${f.style === 'italic' ? 'italic ' : ''}600 100px '${f.family}'`)))
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [faces, handle]);

  if (!ready) return null;
  return <>{children}</>;
};
