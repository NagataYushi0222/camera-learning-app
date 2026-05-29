import { useEffect } from "react";
import { getCurrentScenarioStep, useScenarioStore } from "../../state/useScenarioStore";
import { applyScenePreset, runSceneActions } from "./sceneActions";

export function SceneDirector() {
  const currentChapterId = useScenarioStore((state) => state.currentChapterId);
  const currentStepId = useScenarioStore((state) => state.currentStepId);
  const resetChoiceState = useScenarioStore((state) => state.resetChoiceState);

  useEffect(() => {
    const step = getCurrentScenarioStep({ currentChapterId, currentStepId });
    const scenario = useScenarioStore.getState();
    resetChoiceState();
    scenario.setHighlightedUI(null);
    scenario.setHighlightedObject(null);
    applyScenePreset(step.scenePreset);
    runSceneActions(step.actions);
  }, [currentChapterId, currentStepId, resetChoiceState]);

  return null;
}
