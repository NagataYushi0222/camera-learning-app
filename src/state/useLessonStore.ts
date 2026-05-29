import { create } from "zustand";
import { lessonSteps } from "../data/lessonSteps";
import {
  createSceneConfig,
  defaultSensorXForMode,
  defaultSimulationParams,
  getRaysForPixel,
  renderSensorImage,
  selectedPixelFromGrid,
  sensorGrid,
  type SceneConfig,
  type SensorRenderResult,
  type SimulationParams,
  type TracedRay,
} from "../simulation/opticsModel";
import type { OpticalMode, SelectedPixel } from "../types";

type SimulationParamKey = keyof SimulationParams;

type LessonState = {
  currentStepIndex: number;
  mode: OpticalMode;
  params: SimulationParams;
  sceneConfig: SceneConfig;
  sensorResult: SensorRenderResult;
  selectedPixel: SelectedPixel | null;
  selectedRays: TracedRay[];
  showRays: boolean;
  showWavefronts: boolean;
  nextStep: () => void;
  previousStep: () => void;
  setMode: (mode: OpticalMode) => void;
  updateSimulationParam: (key: SimulationParamKey, value: number | boolean) => void;
  selectPixel: (pixel: SelectedPixel) => void;
  selectCenterPixel: () => void;
  clearSelectedPixel: () => void;
  toggleRays: () => void;
  toggleWavefronts: () => void;
  toggleLight: () => void;
};

const initialMode = lessonSteps[0].mode;
const initialConfig = createSceneConfig(initialMode, defaultSimulationParams);
const initialResult = renderSensorImage(initialConfig);

function makeComputedState(mode: OpticalMode, params: SimulationParams, selectedPixel: SelectedPixel | null) {
  const sceneConfig = createSceneConfig(mode, params);
  const sensorResult = renderSensorImage(sceneConfig);
  const selectedRays = getRaysForPixel(sensorResult, selectedPixel);

  return {
    mode,
    params,
    sceneConfig,
    sensorResult,
    selectedPixel,
    selectedRays,
  };
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
  sceneConfig: initialConfig,
  sensorResult: initialResult,
  selectedPixel: null,
  selectedRays: [],
  showRays: true,
  showWavefronts: true,
  nextStep: () =>
    set((state) => {
      const nextIndex = Math.min(state.currentStepIndex + 1, lessonSteps.length - 1);
      const mode = lessonSteps[nextIndex].mode;
      const computed = makeComputedState(mode, paramsForMode(mode, state.params), null);
      return {
        currentStepIndex: nextIndex,
        ...computed,
      };
    }),
  previousStep: () =>
    set((state) => {
      const nextIndex = Math.max(state.currentStepIndex - 1, 0);
      const mode = lessonSteps[nextIndex].mode;
      const computed = makeComputedState(mode, paramsForMode(mode, state.params), null);
      return {
        currentStepIndex: nextIndex,
        ...computed,
      };
    }),
  setMode: (mode) =>
    set((state) => makeComputedState(mode, paramsForMode(mode, state.params), null)),
  updateSimulationParam: (key, value) =>
    set((state) => {
      const params = {
        ...state.params,
        [key]: value,
      };
      return makeComputedState(state.mode, params, state.selectedPixel);
    }),
  selectPixel: (pixel) =>
    set((state) => ({
      selectedPixel: pixel,
      selectedRays: getRaysForPixel(state.sensorResult, pixel),
    })),
  selectCenterPixel: () =>
    set((state) => {
      const pixel = selectedPixelFromGrid(
        Math.floor(sensorGrid.columns / 2),
        Math.floor(sensorGrid.rows / 2),
      );
      return {
        selectedPixel: pixel,
        selectedRays: getRaysForPixel(state.sensorResult, pixel),
      };
    }),
  clearSelectedPixel: () => set({ selectedPixel: null, selectedRays: [] }),
  toggleRays: () => set((state) => ({ showRays: !state.showRays })),
  toggleWavefronts: () => set((state) => ({ showWavefronts: !state.showWavefronts })),
  toggleLight: () =>
    set((state) => {
      const params = {
        ...state.params,
        lightEnabled: !state.params.lightEnabled,
      };
      return makeComputedState(state.mode, params, state.selectedPixel);
    }),
}));
