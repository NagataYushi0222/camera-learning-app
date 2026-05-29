import type { CameraShot } from "../../content/lessonTypes";

export type CameraShotConfig = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export const cameraShots: Record<CameraShot, CameraShotConfig> = {
  overview: {
    position: [5.6, 3.2, 5.2],
    target: [0, 0, 0],
    fov: 46,
  },
  sideAligned: {
    position: [0.4, 1.7, 6.2],
    target: [0.1, 0, 0],
    fov: 42,
  },
  sensorCloseup: {
    position: [4.2, 1.8, 2.2],
    target: [2.4, 0, 0],
    fov: 38,
  },
  lensCloseup: {
    position: [2.2, 1.35, 2.8],
    target: [0, 0, 0],
    fov: 36,
  },
  objectPointCloseup: {
    position: [-1.4, 1.2, 2.4],
    target: [-2.8, 0.1, 0],
    fov: 34,
  },
  objectAndLight: {
    position: [-1.9, 2.25, 3.2],
    target: [-3.2, 0.45, -0.25],
    fov: 40,
  },
  pinholeCloseup: {
    position: [1.7, 1.25, 2.8],
    target: [0, 0, 0],
    fov: 35,
  },
  eyeModel: {
    position: [4.8, 2.4, 4.4],
    target: [0.5, 0, 0],
    fov: 42,
  },
};
