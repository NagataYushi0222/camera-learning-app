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
  renderSensorPreview,
  selectedPixelFromGrid,
  simulationPresets,
  type RayDisplayMode,
  type SceneConfig,
  type SensorDisplayMode,
  type SensorDisplayResult,
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
  liveParams: SimulationParams;
  committedParams: SimulationParams;
  sensorDisplayMode: SensorDisplayMode;
  sensorQuality: SensorQuality;
  rayDisplayMode: RayDisplayMode;
  showSensorGrid: boolean;
  sceneConfig: SceneConfig;
  sensorResult: SensorRenderResult;
  displaySensorResult: SensorDisplayResult;
  isPreviewing: boolean;
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
  setRaysVisible: (visible: boolean) => void;
  setWavefrontsVisible: (visible: boolean) => void;
  toggleSensorGrid: () => void;
  updateSimulationParam: (key: SimulationParamKey, value: number | boolean) => void;
  updateSimulationParams: (params: Partial<SimulationParams>) => void;
  commitLiveSimulation: () => void;
  setLightEnabled: (enabled: boolean) => void;
  resetSimulationParams: () => void;
  applySimulationPreset: (presetId: SimulationPresetId) => void;
  selectPixel: (pixel: SelectedPixel) => void;
  selectCenterPixel: () => void;
  clearSelectedPixel: () => void;
  toggleRays: () => void;
  toggleWavefronts: () => void;
  toggleLight: () => void;
};

type QualityContext = {
  mode: OpticalMode;
  params: SimulationParams;
  sensorQuality: SensorQuality;
  sensorDisplayMode: SensorDisplayMode;
};

type SensorWorkerResponse = {
  id: number;
  result: SensorRenderResult;
};

const initialMode = lessonSteps[0].mode;
const initialSensorDisplayMode: SensorDisplayMode = "learning";
const initialSensorQuality: SensorQuality = "medium";
const initialRayDisplayMode: RayDisplayMode = "representative";
const initialConfig = createSceneConfig(initialMode, defaultSimulationParams, initialSensorQuality, initialSensorDisplayMode);
const initialResult = renderSensorImage(initialConfig);
const previewDebounceMs = 170;

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

function sameParamValue(current: number | boolean, next: number | boolean): boolean {
  return typeof current === "number" && typeof next === "number" ? Math.abs(current - next) < 0.0001 : current === next;
}

function paramsForMode(mode: OpticalMode, params: SimulationParams): SimulationParams {
  return {
    ...params,
    sensorX: defaultSensorXForMode(mode),
  };
}

function makeCommittedState(
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
    liveParams: params,
    committedParams: params,
    sensorQuality,
    sensorDisplayMode,
    sceneConfig,
    sensorResult,
    displaySensorResult: sensorResult,
    isPreviewing: false,
    selectedPixel: normalizedPixel,
    ...pixelAnalysis,
  };
}

function requestFrame(callback: FrameRequestCallback): number {
  if (typeof window === "undefined") {
    return Number(setTimeout(() => callback(performance.now()), 16));
  }

  return window.requestAnimationFrame(callback);
}

function cancelFrame(frameId: number) {
  if (typeof window === "undefined") {
    clearTimeout(frameId);
    return;
  }

  window.cancelAnimationFrame(frameId);
}

export const useLessonStore = create<LessonState>((set, get) => {
  let previewFrameId: number | null = null;
  let pendingPreviewConfig: SceneConfig | null = null;
  let qualityTimerId: number | null = null;
  let latestQualityRequestId = 0;
  let sensorWorker: Worker | null = null;
  let workerFailed = false;
  const qualityContexts = new Map<number, QualityContext>();

  const clearPreviewFrame = () => {
    if (previewFrameId !== null) {
      cancelFrame(previewFrameId);
      previewFrameId = null;
    }
    pendingPreviewConfig = null;
  };

  const clearQualityTimer = () => {
    if (qualityTimerId !== null) {
      window.clearTimeout(qualityTimerId);
      qualityTimerId = null;
    }
  };

  const applyQualityResult = (requestId: number, context: QualityContext, sensorResult: SensorRenderResult) => {
    if (requestId !== latestQualityRequestId) {
      return;
    }

    const selectedPixel = normalizeSelectedPixel(get().selectedPixel, sensorResult);
    const pixelAnalysis = derivePixelAnalysis(sensorResult, selectedPixel);

    set({
      mode: context.mode,
      params: context.params,
      liveParams: context.params,
      committedParams: context.params,
      sensorQuality: context.sensorQuality,
      sensorDisplayMode: context.sensorDisplayMode,
      sceneConfig: sensorResult.config,
      sensorResult,
      displaySensorResult: sensorResult,
      isPreviewing: false,
      selectedPixel,
      ...pixelAnalysis,
    });
  };

  const getSensorWorker = () => {
    if (workerFailed || typeof Worker === "undefined") {
      return null;
    }

    if (!sensorWorker) {
      try {
        sensorWorker = new Worker(new URL("../simulation/sensorWorker.ts", import.meta.url), { type: "module" });
        sensorWorker.onmessage = (event: MessageEvent<SensorWorkerResponse>) => {
          const { id, result } = event.data;
          const context = qualityContexts.get(id);
          qualityContexts.delete(id);
          if (context) {
            applyQualityResult(id, context, result);
          }
        };
        sensorWorker.onerror = () => {
          workerFailed = true;
          sensorWorker?.terminate();
          sensorWorker = null;
          qualityContexts.clear();
          const state = get();
          const context: QualityContext = {
            mode: state.mode,
            params: state.liveParams,
            sensorQuality: state.sensorQuality,
            sensorDisplayMode: state.sensorDisplayMode,
          };
          const config = createSceneConfig(context.mode, context.params, context.sensorQuality, context.sensorDisplayMode);
          applyQualityResult(latestQualityRequestId, context, renderSensorImage(config));
        };
      } catch {
        workerFailed = true;
        sensorWorker = null;
      }
    }

    return sensorWorker;
  };

  const startQualityRender = () => {
    clearQualityTimer();
    const state = get();
    const context: QualityContext = {
      mode: state.mode,
      params: state.liveParams,
      sensorQuality: state.sensorQuality,
      sensorDisplayMode: state.sensorDisplayMode,
    };
    const config = createSceneConfig(context.mode, context.params, context.sensorQuality, context.sensorDisplayMode);
    const requestId = latestQualityRequestId + 1;
    latestQualityRequestId = requestId;

    const worker = getSensorWorker();
    if (worker) {
      qualityContexts.set(requestId, context);
      worker.postMessage({ id: requestId, config });
      return;
    }

    applyQualityResult(requestId, context, renderSensorImage(config));
  };

  const scheduleQualityRender = (delayMs = previewDebounceMs) => {
    clearQualityTimer();
    qualityTimerId = window.setTimeout(startQualityRender, delayMs);
  };

  const schedulePreviewRender = (config: SceneConfig) => {
    pendingPreviewConfig = config;
    if (previewFrameId !== null) {
      return;
    }

    previewFrameId = requestFrame(() => {
      previewFrameId = null;
      const previewConfig = pendingPreviewConfig;
      pendingPreviewConfig = null;
      if (!previewConfig) {
        return;
      }

      set({
        displaySensorResult: renderSensorPreview(previewConfig),
        isPreviewing: true,
      });
    });
  };

  const applyLiveParams = (partialParams: Partial<SimulationParams>) => {
    const state = get();
    const liveParams = {
      ...state.liveParams,
      ...partialParams,
    };
    const sceneConfig = createSceneConfig(state.mode, liveParams, state.sensorQuality, state.sensorDisplayMode);

    set({
      params: liveParams,
      liveParams,
      sceneConfig,
      isPreviewing: true,
    });
    schedulePreviewRender(sceneConfig);
    scheduleQualityRender();
  };

  const applyCommittedState = (
    mode: OpticalMode,
    params: SimulationParams,
    selectedPixel: SelectedPixel | null,
    sensorQuality: SensorQuality,
    sensorDisplayMode: SensorDisplayMode,
  ) => {
    clearPreviewFrame();
    clearQualityTimer();
    latestQualityRequestId += 1;
    qualityContexts.clear();
    set(makeCommittedState(mode, params, selectedPixel, sensorQuality, sensorDisplayMode));
  };

  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      getSensorWorker();
    }, 0);
  }

  return {
    currentStepIndex: 0,
    mode: initialMode,
    params: defaultSimulationParams,
    liveParams: defaultSimulationParams,
    committedParams: defaultSimulationParams,
    sensorDisplayMode: initialSensorDisplayMode,
    sensorQuality: initialSensorQuality,
    rayDisplayMode: initialRayDisplayMode,
    showSensorGrid: false,
    sceneConfig: initialConfig,
    sensorResult: initialResult,
    displaySensorResult: initialResult,
    isPreviewing: false,
    selectedPixel: null,
    selectedRays: [],
    selectedContributorRays: [],
    selectedSourceBundleRays: [],
    dominantSourceSampleId: null,
    showRays: true,
    showWavefronts: true,
    nextStep: () => {
      const state = get();
      const nextIndex = Math.min(state.currentStepIndex + 1, lessonSteps.length - 1);
      const mode = lessonSteps[nextIndex].mode;
      applyCommittedState(mode, paramsForMode(mode, state.liveParams), null, state.sensorQuality, state.sensorDisplayMode);
      set({ currentStepIndex: nextIndex });
    },
    previousStep: () => {
      const state = get();
      const nextIndex = Math.max(state.currentStepIndex - 1, 0);
      const mode = lessonSteps[nextIndex].mode;
      applyCommittedState(mode, paramsForMode(mode, state.liveParams), null, state.sensorQuality, state.sensorDisplayMode);
      set({ currentStepIndex: nextIndex });
    },
    setMode: (mode) => {
      const state = get();
      applyCommittedState(mode, paramsForMode(mode, state.liveParams), null, state.sensorQuality, state.sensorDisplayMode);
    },
    setSensorDisplayMode: (sensorDisplayMode) => {
      const state = get();
      applyCommittedState(state.mode, state.liveParams, state.selectedPixel, state.sensorQuality, sensorDisplayMode);
    },
    setSensorQuality: (sensorQuality) => {
      const state = get();
      applyCommittedState(state.mode, state.liveParams, state.selectedPixel, sensorQuality, state.sensorDisplayMode);
    },
    setRayDisplayMode: (rayDisplayMode) => set({ rayDisplayMode }),
    setRaysVisible: (showRays) => set({ showRays }),
    setWavefrontsVisible: (showWavefronts) => set({ showWavefronts }),
    toggleSensorGrid: () => set((state) => ({ showSensorGrid: !state.showSensorGrid })),
    updateSimulationParam: (key, value) => {
      const state = get();
      if (sameParamValue(state.liveParams[key], value)) {
        return;
      }
      applyLiveParams({ [key]: value } as Partial<SimulationParams>);
    },
    updateSimulationParams: (partialParams) => applyLiveParams(partialParams),
    commitLiveSimulation: () => startQualityRender(),
    setLightEnabled: (enabled) => {
      const state = get();
      if (state.liveParams.lightEnabled === enabled) {
        return;
      }
      applyLiveParams({ lightEnabled: enabled });
    },
    resetSimulationParams: () =>
      applyCommittedState("lens", defaultSimulationParams, get().selectedPixel, get().sensorQuality, get().sensorDisplayMode),
    applySimulationPreset: (presetId) => {
      const state = get();
      const preset = simulationPresets[presetId];
      const params = {
        ...defaultSimulationParams,
        ...preset.params,
      };
      applyCommittedState(preset.mode, params, state.selectedPixel, state.sensorQuality, state.sensorDisplayMode);
    },
    selectPixel: (pixel) => {
      const state = get();
      const normalizedPixel = normalizeSelectedPixel(pixel, state.sensorResult);
      const pixelAnalysis = derivePixelAnalysis(state.sensorResult, normalizedPixel);
      set({
        selectedPixel: normalizedPixel,
        ...pixelAnalysis,
        rayDisplayMode: state.mode === "no-lens" ? "contributors" : "source-bundle",
        showRays: true,
      });
    },
    selectCenterPixel: () => {
      const state = get();
      const pixel = selectedPixelFromGrid(
        Math.floor(state.sensorResult.width / 2),
        Math.floor(state.sensorResult.height / 2),
        { columns: state.sensorResult.width, rows: state.sensorResult.height },
      );
      const pixelAnalysis = derivePixelAnalysis(state.sensorResult, pixel);
      set({
        selectedPixel: pixel,
        ...pixelAnalysis,
        rayDisplayMode: state.mode === "no-lens" ? "contributors" : "source-bundle",
        showRays: true,
      });
    },
    clearSelectedPixel: () =>
      set({ selectedPixel: null, selectedRays: [], selectedContributorRays: [], selectedSourceBundleRays: [], dominantSourceSampleId: null }),
    toggleRays: () => set((state) => ({ showRays: !state.showRays })),
    toggleWavefronts: () => set((state) => ({ showWavefronts: !state.showWavefronts })),
    toggleLight: () => {
      const state = get();
      applyLiveParams({ lightEnabled: !state.liveParams.lightEnabled });
    },
  };
});
