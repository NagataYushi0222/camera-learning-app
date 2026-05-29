export const saveVersion = 1;
const saveKey = "camera-learning-app-progress";

export type SaveData = {
  saveVersion: number;
  currentChapterId: string;
  currentStepId: string;
  completedChapterIds: string[];
  completedStepIds: string[];
  unlockedChapterIds: string[];
  lastUpdatedAt: string;
  settings: {
    textSpeed: "slow" | "normal" | "fast";
    bgmEnabled: boolean;
    seEnabled: boolean;
    skipSeenText: boolean;
  };
};

export function loadProgress(): SaveData | null {
  const raw = localStorage.getItem(saveKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SaveData;
    return parsed.saveVersion === saveVersion ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProgress(data: Omit<SaveData, "saveVersion" | "lastUpdatedAt">) {
  const payload: SaveData = {
    ...data,
    saveVersion,
    lastUpdatedAt: new Date().toISOString(),
  };
  localStorage.setItem(saveKey, JSON.stringify(payload));
}

export function clearProgress() {
  localStorage.removeItem(saveKey);
}

export function hasProgress(): boolean {
  return loadProgress() !== null;
}
