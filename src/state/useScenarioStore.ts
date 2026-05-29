import { create } from "zustand";
import { chapters, getChapter, getNextChapter, getStep } from "../content/chapters";
import type { CameraShot, HighlightTarget, LessonStep } from "../content/lessonTypes";
import { clearProgress, loadProgress, saveProgress, type SaveData } from "../features/save/saveProgress";

export type AppScreen = "landing" | "learning" | "map";
export type LearningMode = "guided" | "explore";

type ScenarioState = {
  screen: AppScreen;
  currentChapterId: string;
  currentStepId: string;
  completedChapterIds: string[];
  completedStepIds: string[];
  unlockedChapterIds: string[];
  learningMode: LearningMode;
  cameraShot: CameraShot;
  highlightedUI: HighlightTarget | null;
  highlightedObject: HighlightTarget | null;
  choiceFeedback: string | null;
  selectedChoiceId: string | null;
  settings: SaveData["settings"];
  setScreen: (screen: AppScreen) => void;
  startNew: () => void;
  continueFromSave: () => boolean;
  openMap: () => void;
  startChapter: (chapterId: string) => void;
  goToStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (stepId: string) => void;
  completeCurrentChapter: () => void;
  resetChoiceState: () => void;
  setChoiceFeedback: (choiceId: string, feedback: string | null) => void;
  setLearningMode: (mode: LearningMode) => void;
  toggleLearningMode: () => void;
  setCameraShot: (shot: CameraShot) => void;
  setHighlightedUI: (target: HighlightTarget | null) => void;
  setHighlightedObject: (target: HighlightTarget | null) => void;
  persist: () => void;
};

const firstChapter = chapters[0];
const defaultSettings: SaveData["settings"] = {
  textSpeed: "normal",
  bgmEnabled: false,
  seEnabled: true,
  skipSeenText: false,
};

function firstStepId(chapterId: string): string {
  return getChapter(chapterId).steps[0].id;
}

function stepIndex(chapterId: string, stepId: string): number {
  return getChapter(chapterId).steps.findIndex((step) => step.id === stepId);
}

function saveFromState(state: ScenarioState) {
  saveProgress({
    currentChapterId: state.currentChapterId,
    currentStepId: state.currentStepId,
    completedChapterIds: state.completedChapterIds,
    completedStepIds: state.completedStepIds,
    unlockedChapterIds: state.unlockedChapterIds,
    settings: state.settings,
  });
}

export function getCurrentScenarioStep(state: Pick<ScenarioState, "currentChapterId" | "currentStepId">): LessonStep {
  return getStep(state.currentChapterId, state.currentStepId);
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  screen: "landing",
  currentChapterId: firstChapter.id,
  currentStepId: firstChapter.steps[0].id,
  completedChapterIds: [],
  completedStepIds: [],
  unlockedChapterIds: [firstChapter.id],
  learningMode: "guided",
  cameraShot: "overview",
  highlightedUI: null,
  highlightedObject: null,
  choiceFeedback: null,
  selectedChoiceId: null,
  settings: defaultSettings,
  setScreen: (screen) => set({ screen }),
  startNew: () => {
    clearProgress();
    set({
      screen: "learning",
      currentChapterId: firstChapter.id,
      currentStepId: firstChapter.steps[0].id,
      completedChapterIds: [],
      completedStepIds: [],
      unlockedChapterIds: [firstChapter.id],
      learningMode: "guided",
      choiceFeedback: null,
      selectedChoiceId: null,
    });
    get().persist();
  },
  continueFromSave: () => {
    const save = loadProgress();
    if (!save) {
      return false;
    }
    set({
      screen: "learning",
      currentChapterId: save.currentChapterId,
      currentStepId: save.currentStepId,
      completedChapterIds: save.completedChapterIds,
      completedStepIds: save.completedStepIds,
      unlockedChapterIds: save.unlockedChapterIds.length ? save.unlockedChapterIds : [firstChapter.id],
      settings: save.settings,
      learningMode: "guided",
      choiceFeedback: null,
      selectedChoiceId: null,
    });
    return true;
  },
  openMap: () => set({ screen: "map" }),
  startChapter: (chapterId) => {
    if (!get().unlockedChapterIds.includes(chapterId)) {
      return;
    }
    set({
      screen: "learning",
      currentChapterId: chapterId,
      currentStepId: firstStepId(chapterId),
      learningMode: "guided",
      choiceFeedback: null,
      selectedChoiceId: null,
    });
    get().persist();
  },
  goToStep: (stepId) => {
    set({ currentStepId: stepId, choiceFeedback: null, selectedChoiceId: null });
    get().persist();
  },
  nextStep: () => {
    const state = get();
    const chapter = getChapter(state.currentChapterId);
    const index = stepIndex(state.currentChapterId, state.currentStepId);
    const step = chapter.steps[index];
    const nextStepId = step?.nextStepId ?? chapter.steps[index + 1]?.id;

    if (step) {
      get().markStepCompleted(step.id);
    }

    if (nextStepId) {
      set({ currentStepId: nextStepId, choiceFeedback: null, selectedChoiceId: null });
    } else {
      get().completeCurrentChapter();
    }
    get().persist();
  },
  previousStep: () => {
    const state = get();
    const chapter = getChapter(state.currentChapterId);
    const index = stepIndex(state.currentChapterId, state.currentStepId);
    const step = chapter.steps[index];
    const previousStepId = step?.previousStepId ?? chapter.steps[index - 1]?.id;

    if (previousStepId) {
      set({ currentStepId: previousStepId, choiceFeedback: null, selectedChoiceId: null });
      get().persist();
    }
  },
  markStepCompleted: (stepId) => {
    set((state) => ({
      completedStepIds: state.completedStepIds.includes(stepId) ? state.completedStepIds : [...state.completedStepIds, stepId],
    }));
  },
  completeCurrentChapter: () => {
    const state = get();
    const nextChapter = getNextChapter(state.currentChapterId);
    const completedChapterIds = state.completedChapterIds.includes(state.currentChapterId)
      ? state.completedChapterIds
      : [...state.completedChapterIds, state.currentChapterId];
    const unlockedChapterIds = nextChapter && !state.unlockedChapterIds.includes(nextChapter.id)
      ? [...state.unlockedChapterIds, nextChapter.id]
      : state.unlockedChapterIds;

    if (nextChapter) {
      set({
        completedChapterIds,
        unlockedChapterIds,
        currentChapterId: nextChapter.id,
        currentStepId: nextChapter.steps[0].id,
        choiceFeedback: null,
        selectedChoiceId: null,
      });
    } else {
      set({ completedChapterIds, unlockedChapterIds, screen: "map" });
    }
    get().persist();
  },
  resetChoiceState: () => set({ choiceFeedback: null, selectedChoiceId: null }),
  setChoiceFeedback: (choiceId, feedback) => set({ selectedChoiceId: choiceId, choiceFeedback: feedback }),
  setLearningMode: (learningMode) => set({ learningMode }),
  toggleLearningMode: () => set((state) => ({ learningMode: state.learningMode === "guided" ? "explore" : "guided" })),
  setCameraShot: (cameraShot) => set({ cameraShot }),
  setHighlightedUI: (highlightedUI) => set({ highlightedUI }),
  setHighlightedObject: (highlightedObject) => set({ highlightedObject }),
  persist: () => saveFromState(get()),
}));
