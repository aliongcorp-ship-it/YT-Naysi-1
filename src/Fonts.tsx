import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const faces = [
  {family: 'Bricolage', file: 'fonts/bricolage-var.woff2', weight: '200 800'},
  {family: 'InterTight', file: 'fonts/inter-tight-var.woff2', weight: '100 900'},
  {family: 'JetBrains', file: 'fonts/jetbrains-var.woff2', weight: '100 800'},
  {family: 'Instrument', file: 'fonts/instrument-italic.woff2', weight: '400'},
];

export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = faces
      .map((f) => `@font-face{font-family:'${f.family}';src:url('${staticFile(f.file)}') format('woff2-variations');font-weight:${f.weight};font-style:${f.family === 'Instrument' ? 'italic' : 'normal'};font-display:block}`)
      .join('\n');
    document.head.appendChild(style);
    const loads = faces.flatMap((f) => [
      document.fonts.load(`${f.family === 'Instrument' ? 'italic 400' : '800'} 100px '${f.family}'`),
      document.fonts.load(`400 100px '${f.family}'`),
    ]);
    Promise.all(loads)
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
  if (!ready) return null;
  return <>{children}</>;
};
