import type { OpticalMode, SelectedPixel } from "../types";
import type { RayDisplayMode, SensorDisplayMode, SimulationParams } from "../simulation/opticsModel";

export type StepType = "narration" | "cinematic" | "choice" | "task" | "quiz" | "summary";

export type CameraShot =
  | "overview"
  | "sideAligned"
  | "sensorCloseup"
  | "lensCloseup"
  | "objectPointCloseup"
  | "objectAndLight"
  | "pinholeCloseup"
  | "eyeModel";

export type HighlightTarget =
  | "sceneView"
  | "sensorPanel"
  | "lightSource"
  | "object"
  | "lens"
  | "pinhole"
  | "screen"
  | "parameterPanel";

export type ScenePreset = Partial<SimulationParams> & {
  mode?: OpticalMode;
  lightEnabled?: boolean;
  lensVisible?: boolean;
  pinholeVisible?: boolean;
  screenVisible?: boolean;
  showRays?: boolean;
  showWavefronts?: boolean;
  rayDisplayMode?: RayDisplayMode | "selected-pixel";
  sensorDisplayMode?: SensorDisplayMode;
  cameraShot?: CameraShot;
  selectedPixel?: Pick<SelectedPixel, "col" | "row"> | null;
  highlightedObject?: HighlightTarget;
};

export type SceneAction =
  | { type: "moveCamera"; cameraShot: CameraShot }
  | { type: "applyPreset"; preset: ScenePreset }
  | { type: "setLight"; enabled: boolean }
  | { type: "fadeLight"; enabled: boolean; durationMs?: number }
  | { type: "setMode"; mode: OpticalMode }
  | { type: "setLensVisible"; visible: boolean }
  | { type: "setPinholeVisible"; visible: boolean }
  | { type: "setRaysVisible"; visible: boolean }
  | { type: "setWavefrontsVisible"; visible: boolean }
  | { type: "setRayDisplayMode"; rayDisplayMode: RayDisplayMode | "selected-pixel" }
  | { type: "selectPixel"; pixel?: Pick<SelectedPixel, "col" | "row"> }
  | { type: "clearSelectedPixel" }
  | { type: "highlightUI"; target: HighlightTarget | null }
  | { type: "highlightObject"; target: HighlightTarget | null }
  | { type: "showLabel"; target: HighlightTarget; label: string }
  | { type: "hideLabel"; target: HighlightTarget }
  | { type: "wait"; durationMs: number }
  | { type: "setDialogueEmphasis"; terms: string[] }
  | { type: "animateObjectPosition"; objectX: number; durationMs?: number }
  | { type: "animateLensPosition"; lensX: number; durationMs?: number }
  | { type: "animateSensorPosition"; sensorX: number; durationMs?: number }
  | { type: "animateFocalLength"; focalLength: number; durationMs?: number }
  | { type: "animateAperture"; apertureRadius: number; durationMs?: number };

export type RequiredAction =
  | { type: "selectPixel" }
  | { type: "toggleLightOff" }
  | { type: "toggleLightOn" }
  | { type: "switchMode"; mode: OpticalMode }
  | { type: "focusAdjust"; tolerance: number }
  | { type: "changeAperture"; min?: number; max?: number }
  | { type: "changeFocalLength"; min?: number; max?: number }
  | { type: "clickObjectPoint"; pointId: string };

export type Choice = {
  id: string;
  label: string;
  text?: string;
  isCorrect?: boolean;
  feedback?: string;
  nextStepId?: string;
  scenePreset?: ScenePreset;
  actions?: SceneAction[];
};

export type LessonStepBase = {
  id: string;
  type: StepType;
  title: string;
  speaker?: string;
  text: string[];
  scenePreset?: ScenePreset;
  actions?: SceneAction[];
  choices?: Choice[];
  requiredAction?: RequiredAction;
  successText?: string;
  nextStepId?: string;
  previousStepId?: string;
  glossaryTerms?: string[];
  focusMessage?: string;
};

export type NarrationStep = LessonStepBase & { type: "narration" };
export type CinematicStep = LessonStepBase & { type: "cinematic" };
export type ChoiceStep = LessonStepBase & { type: "choice"; choices: Choice[] };
export type TaskStep = LessonStepBase & { type: "task"; requiredAction: RequiredAction };
export type QuizStep = LessonStepBase & { type: "quiz"; choices: Choice[] };
export type SummaryStep = LessonStepBase & { type: "summary"; summaryItems?: string[]; nextChapterPreview?: string };

export type LessonStep = NarrationStep | CinematicStep | ChoiceStep | TaskStep | QuizStep | SummaryStep;

export type Chapter = {
  id: string;
  order: number;
  title: string;
  description: string;
  sourceNote?: string;
  steps: LessonStep[];
};
