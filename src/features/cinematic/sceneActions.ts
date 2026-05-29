import type { SceneAction, ScenePreset } from "../../content/lessonTypes";
import { selectedPixelFromGrid, type RayDisplayMode, type SimulationParams } from "../../simulation/opticsModel";
import { useLessonStore } from "../../state/useLessonStore";
import { useScenarioStore } from "../../state/useScenarioStore";

const paramKeys: Array<keyof SimulationParams> = [
  "objectX",
  "lensX",
  "sensorX",
  "focalLength",
  "apertureRadius",
  "pinholeRadius",
  "lightIntensity",
  "lightEnabled",
  "sampleCount",
  "rayCount",
];

function normalizeRayDisplayMode(mode: ScenePreset["rayDisplayMode"]): RayDisplayMode | null {
  if (!mode) {
    return null;
  }
  return mode === "selected-pixel" ? "contributors" : mode;
}

export function applyScenePreset(preset?: ScenePreset) {
  if (!preset) {
    return;
  }

  const lesson = useLessonStore.getState();
  const scenario = useScenarioStore.getState();

  if (preset.mode) {
    lesson.setMode(preset.mode);
  }

  const params: Partial<SimulationParams> = {};
  for (const key of paramKeys) {
    if (preset[key] !== undefined) {
      params[key] = preset[key] as never;
    }
  }
  if (Object.keys(params).length) {
    lesson.updateSimulationParams(params);
  }

  if (preset.sensorDisplayMode) {
    lesson.setSensorDisplayMode(preset.sensorDisplayMode);
  }

  const rayMode = normalizeRayDisplayMode(preset.rayDisplayMode);
  if (rayMode) {
    lesson.setRayDisplayMode(rayMode);
  }

  if (preset.showRays !== undefined) {
    lesson.setRaysVisible(preset.showRays);
  }

  if (preset.showWavefronts !== undefined) {
    lesson.setWavefrontsVisible(preset.showWavefronts);
  }

  if (preset.selectedPixel === null) {
    lesson.clearSelectedPixel();
  } else if (preset.selectedPixel) {
    lesson.selectPixel(
      selectedPixelFromGrid(preset.selectedPixel.col, preset.selectedPixel.row, {
        columns: lesson.sensorResult.width,
        rows: lesson.sensorResult.height,
      }),
    );
  }

  if (preset.cameraShot) {
    scenario.setCameraShot(preset.cameraShot);
  }

  if (preset.highlightedObject !== undefined) {
    scenario.setHighlightedObject(preset.highlightedObject ?? null);
  }
}

export function runSceneActions(actions: SceneAction[] = []) {
  const lesson = useLessonStore.getState();
  const scenario = useScenarioStore.getState();

  for (const action of actions) {
    switch (action.type) {
      case "moveCamera":
        scenario.setCameraShot(action.cameraShot);
        break;
      case "applyPreset":
        applyScenePreset(action.preset);
        break;
      case "setLight":
      case "fadeLight":
        lesson.setLightEnabled(action.enabled);
        break;
      case "setMode":
        lesson.setMode(action.mode);
        break;
      case "setRaysVisible":
        lesson.setRaysVisible(action.visible);
        break;
      case "setWavefrontsVisible":
        lesson.setWavefrontsVisible(action.visible);
        break;
      case "setRayDisplayMode": {
        const rayMode = normalizeRayDisplayMode(action.rayDisplayMode);
        if (rayMode) {
          lesson.setRayDisplayMode(rayMode);
        }
        break;
      }
      case "selectPixel":
        if (action.pixel) {
          lesson.selectPixel(
            selectedPixelFromGrid(action.pixel.col, action.pixel.row, {
              columns: lesson.sensorResult.width,
              rows: lesson.sensorResult.height,
            }),
          );
        } else {
          lesson.selectCenterPixel();
        }
        break;
      case "clearSelectedPixel":
        lesson.clearSelectedPixel();
        break;
      case "highlightUI":
        scenario.setHighlightedUI(action.target);
        break;
      case "highlightObject":
        scenario.setHighlightedObject(action.target);
        break;
      case "animateObjectPosition":
        lesson.updateSimulationParams({ objectX: action.objectX });
        break;
      case "animateLensPosition":
        lesson.updateSimulationParams({ lensX: action.lensX });
        break;
      case "animateSensorPosition":
        lesson.updateSimulationParams({ sensorX: action.sensorX });
        break;
      case "animateFocalLength":
        lesson.updateSimulationParams({ focalLength: action.focalLength });
        break;
      case "animateAperture":
        lesson.updateSimulationParams({ apertureRadius: action.apertureRadius });
        break;
      case "setLensVisible":
      case "setPinholeVisible":
      case "showLabel":
      case "hideLabel":
      case "wait":
      case "setDialogueEmphasis":
        break;
      default:
        break;
    }
  }
}
