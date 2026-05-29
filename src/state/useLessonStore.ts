import { create } from "zustand";
import { lessonSteps } from "../data/lessonSteps";
import {
  createSceneConfig,
  defaultSensorXForMode,
  defaultSimulationParams,
  getDominantSourceSample,
  getPixelContributorRays,
  getSourceBundleRays,
  renderSensorImage,
  selectedPixelFromGrid,
  simulationPresets,
  type RayDisplayMode,
  type SceneConfig,
  type SensorDisplayMode,
  type SensorQuality,
  type SensorRenderResult,
  type SimulationPresetId,
  type SimulationParams,
  type TracedRay,
} from "../simulation/opticsModel";
import type { OpticalMode, SelectedPixel } from "../types";

type SimulationParamKey = keyof SimulationParams;

type LessonState = {
  currentStepIndex: number;
  mode: OpticalMode;
  params: SimulationParams;
  sensorDisplayMode: SensorDisplayMode;
  sensorQuality: SensorQuality;
  rayDisplayMode: RayDisplayMode;
  showSensorGrid: boolean;
  sceneConfig: SceneConfig;
  sensorResult: SensorRenderResult;
  selectedPixel: SelectedPixel | null;
  selectedRays: TracedRay[];
  selectedContributorRays: TracedRay[];
  selectedSourceBundleRays: TracedRay[];
  dominantSourceSampleId: string | null;
  showRays: boolean;
  showWavefronts: boolean;
  nextStep: () => void;
  previousStep: () => void;
  setMode: (mode: OpticalMode) => void;
  setSensorDisplayMode: (mode: SensorDisplayMode) => void;
  setSensorQuality: (quality: SensorQuality) => void;
  setRayDisplayMode: (mode: RayDisplayMode) => void;
  toggleSensorGrid: () => void;
  updateSimulationParam: (key: SimulationParamKey, value: number | boolean) => void;
  resetSimulationParams: () => void;
  applySimulationPreset: (presetId: SimulationPresetId) => void;
  selectPixel: (pixel: SelectedPixel) => void;
  selectCenterPixel: () => void;
  clearSelectedPixel: () => void;
  toggleRays: () => void;
  toggleWavefronts: () => void;
  toggleLight: () => void;
};

const initialMode = lessonSteps[0].mode;
const initialSensorDisplayMode: SensorDisplayMode = "learning";
const initialSensorQuality: SensorQuality = "medium";
const initialRayDisplayMode: RayDisplayMode = "representative";
const initialConfig = createSceneConfig(initialMode, defaultSimulationParams, initialSensorQuality, initialSensorDisplayMode);
const initialResult = renderSensorImage(initialConfig);

function derivePixelAnalysis(sensorResult: SensorRenderResult, selectedPixel: SelectedPixel | null) {
  const selectedContributorRays = getPixelContributorRays(sensorResult, selectedPixel);
  const dominantSourceSample = getDominantSourceSample(sensorResult, selectedPixel);
  const selectedSourceBundleRays = getSourceBundleRays(sensorResult.config, dominantSourceSample);

  return {
    selectedRays: selectedContributorRays,
    selectedContributorRays,
    selectedSourceBundleRays,
    dominantSourceSampleId: dominantSourceSample?.id ?? null,
  };
}

function normalizeSelectedPixel(pixel: SelectedPixel | null, result: SensorRenderResult): SelectedPixel | null {
  if (!pixel) {
    return null;
  }

  return selectedPixelFromGrid(
    Math.floor(pixel.u * result.width),
    Math.floor(pixel.v * result.height),
    { columns: result.width, rows: result.height },
  );
}

function makeComputedState(
  mode: OpticalMode,
  params: SimulationParams,
  selectedPixel: SelectedPixel | null,
  sensorQuality: SensorQuality,
  sensorDisplayMode: SensorDisplayMode,
) {
  const sceneConfig = createSceneConfig(mode, params, sensorQuality, sensorDisplayMode);
  const sensorResult = renderSensorImage(sceneConfig);
  const normalizedPixel = normalizeSelectedPixel(selectedPixel, sensorResult);
  const pixelAnalysis = derivePixelAnalysis(sensorResult, normalizedPixel);

  return {
    mode,
    params,
    sensorQuality,
    sensorDisplayMode,
    sceneConfig,
    sensorResult,
    selectedPixel: normalizedPixel,
    ...pixelAnalysis,
  };
}

function sameParamValue(current: number | boolean, next: number | boolean): boolean {
  return typeof current === "number" && typeof next === "number" ? Math.abs(current - next) < 0.0001 : current === next;
}

function paramsForMode(mode: OpticalMode, params: SimulationParams): SimulationParams {
  return {
    ...params,
    sensorX: defaultSensorXForMode(mode),
  };
}

export const useLessonStore = create<LessonState>((set) => ({
  currentStepIndex: 0,
  mode: initialMode,
  params: defaultSimulationParams,
  sensorDisplayMode: initialSensorDisplayMode,
  sensorQuality: initialSensorQuality,
  rayDisplayMode: initialRayDisplayMode,
  showSensorGrid: false,
  sceneConfig: initialConfig,
  sensorResult: initialResult,
  selectedPixel: null,
  selectedRays: [],
  selectedContributorRays: [],
  selectedSourceBundleRays: [],
  dominantSourceSampleId: null,
  showRays: true,
  showWavefronts: true,
  nextStep: () =>
    set((state) => {
      const nextIndex = Math.min(state.currentStepIndex + 1, lessonSteps.length - 1);
      const mode = lessonSteps[nextIndex].mode;
      const computed = makeComputedState(mode, paramsForMode(mode, state.params), null, state.sensorQuality, state.sensorDisplayMode);
      return {
        currentStepIndex: nextIndex,
        ...computed,
      };
    }),
  previousStep: () =>
    set((state) => {
      const nextIndex = Math.max(state.currentStepIndex - 1, 0);
      const mode = lessonSteps[nextIndex].mode;
      const computed = makeComputedState(mode, paramsForMode(mode, state.params), null, state.sensorQuality, state.sensorDisplayMode);
      return {
        currentStepIndex: nextIndex,
        ...computed,
      };
    }),
  setMode: (mode) =>
    set((state) => makeComputedState(mode, paramsForMode(mode, state.params), null, state.sensorQuality, state.sensorDisplayMode)),
  setSensorDisplayMode: (sensorDisplayMode) =>
    set((state) => makeComputedState(state.mode, state.params, state.selectedPixel, state.sensorQuality, sensorDisplayMode)),
  setSensorQuality: (sensorQuality) =>
    set((state) => makeComputedState(state.mode, state.params, state.selectedPixel, sensorQuality, state.sensorDisplayMode)),
  setRayDisplayMode: (rayDisplayMode) => set({ rayDisplayMode }),
  toggleSensorGrid: () => set((state) => ({ showSensorGrid: !state.showSensorGrid })),
  updateSimulationParam: (key, value) =>
    set((state) => {
      if (sameParamValue(state.params[key], value)) {
        return {};
      }

      const params = {
        ...state.params,
        [key]: value,
      };
      return makeComputedState(state.mode, params, state.selectedPixel, state.sensorQuality, state.sensorDisplayMode);
    }),
  resetSimulationParams: () =>
    set((state) => makeComputedState("lens", defaultSimulationParams, state.selectedPixel, state.sensorQuality, state.sensorDisplayMode)),
  applySimulationPreset: (presetId) =>
    set((state) => {
      const preset = simulationPresets[presetId];
      const params = {
        ...defaultSimulationParams,
        ...preset.params,
      };
      return makeComputedState(preset.mode, params, state.selectedPixel, state.sensorQuality, state.sensorDisplayMode);
    }),
  selectPixel: (pixel) =>
    set((state) => {
      const pixelAnalysis = derivePixelAnalysis(state.sensorResult, pixel);
      return {
        selectedPixel: pixel,
        ...pixelAnalysis,
        rayDisplayMode: state.mode === "no-lens" ? "contributors" : "source-bundle",
        showRays: true,
      };
    }),
  selectCenterPixel: () =>
    set((state) => {
      const pixel = selectedPixelFromGrid(
        Math.floor(state.sensorResult.width / 2),
        Math.floor(state.sensorResult.height / 2),
        { columns: state.sensorResult.width, rows: state.sensorResult.height },
      );
      const pixelAnalysis = derivePixelAnalysis(state.sensorResult, pixel);
      return {
        selectedPixel: pixel,
        ...pixelAnalysis,
        rayDisplayMode: state.mode === "no-lens" ? "contributors" : "source-bundle",
        showRays: true,
      };
    }),
  clearSelectedPixel: () =>
    set({ selectedPixel: null, selectedRays: [], selectedContributorRays: [], selectedSourceBundleRays: [], dominantSourceSampleId: null }),
  toggleRays: () => set((state) => ({ showRays: !state.showRays })),
  toggleWavefronts: () => set((state) => ({ showWavefronts: !state.showWavefronts })),
  toggleLight: () =>
    set((state) => {
      const params = {
        ...state.params,
        lightEnabled: !state.params.lightEnabled,
      };
      return makeComputedState(state.mode, params, state.selectedPixel, state.sensorQuality, state.sensorDisplayMode);
    }),
}));
