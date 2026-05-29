export type OpticalMode = "no-lens" | "pinhole" | "lens" | "out-of-focus";

export type SelectedPixel = {
  col: number;
  row: number;
  u: number;
  v: number;
  sensorX: number;
  sensorY: number;
};

export type LessonStep = {
  id: string;
  chapterTitle: string;
  stepTitle: string;
  speaker: string;
  lines: string[];
  mode: OpticalMode;
  takeaway: string;
};
