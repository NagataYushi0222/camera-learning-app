import type { OpticalMode, SelectedPixel } from "../types";

export const sensorGrid = {
  columns: 28,
  rows: 18,
  width: 2.2,
  height: 1.42,
};

export type Point3 = [number, number, number];

export type LightRay = {
  id: string;
  points: Point3[];
  color: string;
  opacity: number;
};

export const modeLabels: Record<OpticalMode, string> = {
  "no-lens": "レンズなし",
  pinhole: "ピンホール",
  lens: "レンズ",
  "out-of-focus": "ピントずれ",
};

export const modeDescriptions: Record<OpticalMode, string> = {
  "no-lens": "1ピクセルに複数の場所から光が混ざる",
  pinhole: "穴を通れる光だけが届く",
  lens: "同じ物体点からの光が1点に集まる",
  "out-of-focus": "集まる位置がずれて点が広がる",
};

const objectX = -2.8;
const lensX = 0;
const sensorX = 3;

export function sensorPoint(pixel: SelectedPixel): Point3 {
  return [sensorX, pixel.sensorY * sensorGrid.height * 0.5, pixel.sensorX * sensorGrid.width * 0.5];
}

export function objectPointForPixel(pixel: SelectedPixel): Point3 {
  return [objectX, -pixel.sensorY * 0.62, -pixel.sensorX * 0.82];
}

export function computeHighlightedRays(mode: OpticalMode, pixel: SelectedPixel | null): LightRay[] {
  if (!pixel) {
    return [];
  }

  const target = sensorPoint(pixel);

  if (mode === "no-lens") {
    const mixedOrigins: Point3[] = [
      [objectX, 0.48, -0.34],
      [objectX, -0.34, 0.28],
      [objectX, 0.05, 0.62],
      [objectX, -0.05, -0.58],
      [objectX, 0.28, 0.05],
    ];

    return mixedOrigins.map((origin, index) => ({
      id: `mixed-${index}`,
      points: [origin, target],
      color: index % 2 === 0 ? "#ff6b4a" : "#ffc247",
      opacity: 0.92,
    }));
  }

  if (mode === "pinhole") {
    const origin = objectPointForPixel(pixel);
    const pinhole: Point3 = [lensX, 0, 0];

    return [
      {
        id: "pinhole-main",
        points: [origin, pinhole, target],
        color: "#ffd34e",
        opacity: 1,
      },
      {
        id: "pinhole-upper",
        points: [[origin[0], origin[1] + 0.1, origin[2] - 0.08], pinhole, target],
        color: "#ff8a4c",
        opacity: 0.55,
      },
      {
        id: "pinhole-lower",
        points: [[origin[0], origin[1] - 0.1, origin[2] + 0.08], pinhole, target],
        color: "#ff8a4c",
        opacity: 0.55,
      },
    ];
  }

  if (mode === "out-of-focus") {
    const baseOrigin = objectPointForPixel(pixel);
    const aperturePoints: Point3[] = [
      [lensX, 0.42, 0],
      [lensX, -0.42, 0],
      [lensX, 0, 0.42],
      [lensX, 0, -0.42],
      [lensX, 0, 0],
    ];

    return aperturePoints.map((aperture, index) => {
      const originOffset = (index - 2) * 0.055;
      return {
        id: `defocus-${index}`,
        points: [
          [baseOrigin[0], baseOrigin[1] + originOffset, baseOrigin[2] - originOffset],
          aperture,
          target,
        ],
        color: "#ffbf3d",
        opacity: index === 4 ? 1 : 0.68,
      };
    });
  }

  const origin = objectPointForPixel(pixel);
  const aperturePoints: Point3[] = [
    [lensX, 0.5, 0],
    [lensX, -0.5, 0],
    [lensX, 0, 0.5],
    [lensX, 0, -0.5],
    [lensX, 0, 0],
  ];

  return aperturePoints.map((aperture, index) => ({
    id: `focused-${index}`,
    points: [origin, aperture, target],
    color: index === 4 ? "#ffe066" : "#ffae3d",
    opacity: index === 4 ? 1 : 0.78,
  }));
}

export function staticGuideRays(mode: OpticalMode): LightRay[] {
  if (mode === "no-lens") {
    return [
      { id: "guide-a", points: [[objectX, 0.42, -0.42], [sensorX, -0.35, 0.56]], color: "#e06a4f", opacity: 0.22 },
      { id: "guide-b", points: [[objectX, -0.35, 0.32], [sensorX, 0.42, -0.38]], color: "#eeb75f", opacity: 0.22 },
      { id: "guide-c", points: [[objectX, 0.12, 0.56], [sensorX, -0.1, -0.62]], color: "#e06a4f", opacity: 0.18 },
    ];
  }

  if (mode === "pinhole") {
    return [
      { id: "guide-p1", points: [[objectX, 0.45, -0.38], [lensX, 0, 0], [sensorX, -0.45, 0.38]], color: "#eeb75f", opacity: 0.28 },
      { id: "guide-p2", points: [[objectX, -0.45, 0.38], [lensX, 0, 0], [sensorX, 0.45, -0.38]], color: "#eeb75f", opacity: 0.28 },
    ];
  }

  return [
    { id: "guide-l1", points: [[objectX, 0.46, -0.38], [lensX, 0.38, 0.18], [sensorX, -0.42, 0.36]], color: "#f0bd59", opacity: 0.24 },
    { id: "guide-l2", points: [[objectX, 0.46, -0.38], [lensX, -0.36, -0.16], [sensorX, -0.42, 0.36]], color: "#f0bd59", opacity: 0.24 },
    { id: "guide-l3", points: [[objectX, -0.42, 0.36], [lensX, 0.36, -0.16], [sensorX, 0.42, -0.36]], color: "#f0bd59", opacity: 0.2 },
  ];
}

export function pixelInfoText(mode: OpticalMode, pixel: SelectedPixel | null): string {
  if (!pixel) {
    return "スクリーン上のピクセルをクリックすると、対応する光線を左で表示します。";
  }

  const position = `列${pixel.col + 1} / 行${pixel.row + 1}`;

  if (mode === "no-lens") {
    return `${position}: 複数の物体点から来た光が混ざっています。`;
  }

  if (mode === "pinhole") {
    return `${position}: 小さな穴を通った限られた光だけが届いています。`;
  }

  if (mode === "out-of-focus") {
    return `${position}: 近い物体点や広がった光が重なり、点がにじんでいます。`;
  }

  return `${position}: 物体上の対応する1点から来た光が集まっています。`;
}
