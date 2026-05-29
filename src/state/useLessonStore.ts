import { create } from "zustand";
import { lessonSteps } from "../data/lessonSteps";
import { sensorGrid } from "../simulation/opticsModel";
import type { OpticalMode, SelectedPixel } from "../types";

type LessonState = {
  currentStepIndex: number;
  mode: OpticalMode;
  selectedPixel: SelectedPixel | null;
  showRays: boolean;
  showWavefronts: boolean;
  nextStep: () => void;
  previousStep: () => void;
  setMode: (mode: OpticalMode) => void;
  selectPixel: (pixel: SelectedPixel) => void;
  selectCenterPixel: () => void;
  clearSelectedPixel: () => void;
  toggleRays: () => void;
  toggleWavefronts: () => void;
};

const makeCenterPixel = (): SelectedPixel => ({
  col: Math.floor(sensorGrid.columns / 2),
  row: Math.floor(sensorGrid.rows / 2),
  u: 0.5,
  v: 0.5,
  sensorX: 0,
  sensorY: 0,
});

export const useLessonStore = create<LessonState>((set) => ({
  currentStepIndex: 0,
  mode: lessonSteps[0].mode,
  selectedPixel: null,
  showRays: true,
  showWavefronts: true,
  nextStep: () =>
    set((state) => {
      const nextIndex = Math.min(state.currentStepIndex + 1, lessonSteps.length - 1);
      return {
        currentStepIndex: nextIndex,
        mode: lessonSteps[nextIndex].mode,
        selectedPixel: null,
      };
    }),
  previousStep: () =>
    set((state) => {
      const nextIndex = Math.max(state.currentStepIndex - 1, 0);
      return {
        currentStepIndex: nextIndex,
        mode: lessonSteps[nextIndex].mode,
        selectedPixel: null,
      };
    }),
  setMode: (mode) => set({ mode, selectedPixel: null }),
  selectPixel: (pixel) => set({ selectedPixel: pixel }),
  selectCenterPixel: () => set({ selectedPixel: makeCenterPixel() }),
  clearSelectedPixel: () => set({ selectedPixel: null }),
  toggleRays: () => set((state) => ({ showRays: !state.showRays })),
  toggleWavefronts: () => set((state) => ({ showWavefronts: !state.showWavefronts })),
}));
