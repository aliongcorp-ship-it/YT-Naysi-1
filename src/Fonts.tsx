import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const faces = [
  {family: 'SpaceGrotesk', file: 'fonts/space-grotesk.woff2', weight: '300 700', style: 'normal'},
  {family: 'PlexMono', file: 'fonts/plex-400.woff2', weight: '400', style: 'normal'},
  {family: 'PlexMono', file: 'fonts/plex-600.woff2', weight: '600', style: 'normal'},
  {family: 'PlexMono', file: 'fonts/plex-700.woff2', weight: '700', style: 'normal'},
  {family: 'Fraunces', file: 'fonts/fraunces.woff2', weight: '300 700', style: 'normal'},
  {family: 'Fraunces', file: 'fonts/fraunces-italic.woff2', weight: '300 700', style: 'italic'},
];

export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
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
    Promise.all(
      faces.map((f) => document.fonts.load(`${f.style === 'italic' ? 'italic ' : ''}600 100px '${f.family}'`))
    )
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
