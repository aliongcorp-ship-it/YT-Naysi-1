import timeline from "./timeline.json";

export type Scene = (typeof timeline)["scenes"][number];

export const TL = timeline;

export const sceneById = (id: string): Scene => {
  const s = TL.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`unknown scene ${id}`);
  return s;
};
