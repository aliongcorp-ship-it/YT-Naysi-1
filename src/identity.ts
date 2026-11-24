import raw from './data/identity.json';

// Typed access to the episode identity. Every visual decision that must change
// between episodes (colour, type, cut grammar, chrome) is read from here.
export type Palette = {
  void: string; abyss: string; deep: string; mid: string; shallow: string;
  ink: string; muted: string; faint: string;
  accent: string; accentDim: string; hot: string; warm: string; alt: string;
};
export type Identity = {
  schema: string;
  id: string;
  name: string;
  palette: Palette;
  type: {display: string; mono: string; editorial: string};
  motion: {cut: 'bloom' | 'paper' | 'cut' | 'iris'; punch: number; grain: number; ease: string};
  ui: {chrome: string; rail: boolean; marks: boolean};
};

export const ID = raw as unknown as Identity;
