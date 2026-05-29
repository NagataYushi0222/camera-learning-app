import type { OpticalMode, SelectedPixel } from "../types";

export const sensorGrid = {
  columns: 112,
  rows: 72,
  width: 2.2,
  height: 1.42,
};

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type SceneConfig = {
  lightPosition: Vec3;
  objectPosition: Vec3;
  lensPosition: Vec3;
  sensorPosition: Vec3;
  focalLength: number;
  apertureRadius: number;
  pinholeRadius: number;
  lightIntensity: number;
  lightEnabled: boolean;
  mode: OpticalMode;
};

export type SimulationParams = {
  objectX: number;
  lensX: number;
  sensorX: number;
  focalLength: number;
  apertureRadius: number;
  pinholeRadius: number;
  lightIntensity: number;
  lightEnabled: boolean;
};

export type ObjectSample = {
  id: string;
  position: Vec3;
  color: RgbColor;
  intensity: number;
};

export type PixelHit = {
  col: number;
  row: number;
};

export type TracedRay = {
  id: string;
  origin: Vec3;
  points: Vec3[];
  color: string;
  intensity: number;
  hitPixel: PixelHit;
  sourceSampleId: string;
};

export type SensorRenderResult = {
  width: number;
  height: number;
  pixelBuffer: Uint8ClampedArray;
  rays: TracedRay[];
  pixelToRays: Record<string, TracedRay[]>;
  samples: ObjectSample[];
  maxChannel: number;
  idealImageX: number | null;
};

type SensorHit = PixelHit & {
  u: number;
  v: number;
  colFloat: number;
  rowFloat: number;
};

const maxRaysPerPixel = 14;

export const defaultSimulationParams: SimulationParams = {
  objectX: -2.8,
  lensX: 0,
  sensorX: 3,
  focalLength: 1.45,
  apertureRadius: 0.52,
  pinholeRadius: 0.055,
  lightIntensity: 1,
  lightEnabled: true,
};

export const modeLabels: Record<OpticalMode, string> = {
  "no-lens": "レンズなし",
  pinhole: "ピンホール",
  lens: "レンズ",
  "out-of-focus": "ピントずれ",
};

export const modeDescriptions: Record<OpticalMode, string> = {
  "no-lens": "広い範囲から来た光が各ピクセルで混ざる",
  pinhole: "穴を通れる光だけが暗い反転像を作る",
  lens: "薄レンズが同じ物体点の光を像面へ集める",
  "out-of-focus": "像面から外れたスクリーンで光が広がる",
};

export function pixelKey(pixel: PixelHit): string {
  return `${pixel.col}:${pixel.row}`;
}

export function defaultSensorXForMode(mode: OpticalMode): number {
  return mode === "out-of-focus" ? 2.35 : defaultSimulationParams.sensorX;
}

export function createSceneConfig(mode: OpticalMode, params: SimulationParams): SceneConfig {
  return {
    lightPosition: { x: -4.25, y: 1.22, z: -1.18 },
    objectPosition: { x: params.objectX, y: 0, z: 0 },
    lensPosition: { x: params.lensX, y: 0, z: 0 },
    sensorPosition: { x: params.sensorX, y: 0, z: 0 },
    focalLength: params.focalLength,
    apertureRadius: params.apertureRadius,
    pinholeRadius: params.pinholeRadius,
    lightIntensity: params.lightIntensity,
    lightEnabled: params.lightEnabled,
    mode,
  };
}

export function selectedPixelFromGrid(col: number, row: number): SelectedPixel {
  const clampedCol = Math.min(Math.max(col, 0), sensorGrid.columns - 1);
  const clampedRow = Math.min(Math.max(row, 0), sensorGrid.rows - 1);
  const u = (clampedCol + 0.5) / sensorGrid.columns;
  const v = (clampedRow + 0.5) / sensorGrid.rows;

  return {
    col: clampedCol,
    row: clampedRow,
    u,
    v,
    sensorX: (u - 0.5) * 2,
    sensorY: (0.5 - v) * 2,
  };
}

export function sensorPoint(config: SceneConfig, pixel: SelectedPixel): Vec3 {
  return {
    x: config.sensorPosition.x,
    y: config.sensorPosition.y + pixel.sensorY * sensorGrid.height * 0.5,
    z: config.sensorPosition.z + pixel.sensorX * sensorGrid.width * 0.5,
  };
}

export function getRaysForPixel(result: SensorRenderResult, pixel: SelectedPixel | null): TracedRay[] {
  if (!pixel) {
    return [];
  }

  const exact = result.pixelToRays[pixelKey(pixel)];
  if (exact?.length) {
    return exact;
  }

  for (let radius = 1; radius <= 4; radius += 1) {
    const nearby: TracedRay[] = [];
    for (let row = pixel.row - radius; row <= pixel.row + radius; row += 1) {
      for (let col = pixel.col - radius; col <= pixel.col + radius; col += 1) {
        const bucket = result.pixelToRays[pixelKey({ col, row })];
        if (bucket) {
          nearby.push(...bucket);
        }
      }
    }

    if (nearby.length) {
      return nearby.sort((a, b) => b.intensity - a.intensity).slice(0, maxRaysPerPixel);
    }
  }

  return [];
}

export function pixelInfoText(mode: OpticalMode, pixel: SelectedPixel | null, rays: TracedRay[]): string {
  if (!pixel) {
    return "スクリーン上のピクセルをクリックすると、そのピクセルに実際に寄与した光線を左で表示します。";
  }

  const position = `列${pixel.col + 1} / 行${pixel.row + 1}`;
  const count = rays.length;

  if (count === 0) {
    return `${position}: このピクセルに届いたサンプル光線はほとんどありません。`;
  }

  if (mode === "no-lens") {
    return `${position}: ${count}本の代表光線を表示中です。いろいろな物体点からの光が同じピクセルで混ざっています。`;
  }

  if (mode === "pinhole") {
    return `${position}: ${count}本の代表光線を表示中です。小さな穴を通った光だけが届いています。`;
  }

  if (mode === "out-of-focus") {
    return `${position}: ${count}本の代表光線を表示中です。像面からずれたため、光がこの付近へ広がっています。`;
  }

  return `${position}: ${count}本の代表光線を表示中です。同じ物体点から来た光がセンサー上で集まっています。`;
}

export function renderSensorImage(config: SceneConfig): SensorRenderResult {
  const samples = createAppleSamples(config.objectPosition);
  const accum = new Float32Array(sensorGrid.columns * sensorGrid.rows * 3);
  const pixelToRays: Record<string, TracedRay[]> = {};
  const rays: TracedRay[] = [];
  const idealImageX = computeIdealImageX(config);

  if (!config.lightEnabled || config.lightIntensity <= 0.001) {
    return {
      width: sensorGrid.columns,
      height: sensorGrid.rows,
      pixelBuffer: toPixelBuffer(accum, config.mode),
      rays,
      pixelToRays,
      samples,
      maxChannel: 0,
      idealImageX,
    };
  }

  if (config.mode === "no-lens") {
    renderNoLens(config, samples, accum, pixelToRays, rays);
  } else if (config.mode === "pinhole") {
    renderPinhole(config, samples, accum, pixelToRays, rays);
  } else {
    renderLens(config, samples, accum, pixelToRays, rays);
  }

  const maxChannel = maxValue(accum);

  return {
    width: sensorGrid.columns,
    height: sensorGrid.rows,
    pixelBuffer: toPixelBuffer(accum, config.mode),
    rays,
    pixelToRays,
    samples,
    maxChannel,
    idealImageX,
  };
}

function renderNoLens(
  config: SceneConfig,
  samples: ObjectSample[],
  accum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  for (let row = 0; row < sensorGrid.rows; row += 1) {
    for (let col = 0; col < sensorGrid.columns; col += 1) {
      const hitPoint = sensorPoint(config, selectedPixelFromGrid(col, row));

      for (const sample of samples) {
        const distance = length(sub(hitPoint, sample.position));
        const light = sampleLight(sample, config);
        const contribution = (sample.intensity * light * 0.024) / Math.max(1.2, distance * distance);
        addColor(accum, col, row, sample.color, contribution);
      }

      const representative = representativeNoLensSamples(samples, col, row);
      for (const sample of representative) {
        const hitPixel = { col, row };
        const ray = makeRay(
          `nolens-${sample.id}-${col}-${row}`,
          [sample.position, hitPoint],
          sample,
          hitPixel,
          sampleLight(sample, config) * 0.18,
        );
        pushPixelRay(pixelToRays, hitPixel, ray);
      }
    }
  }

  for (let index = 0; index < Math.min(90, samples.length); index += 9) {
    const sample = samples[index];
    const target = sensorPoint(config, selectedPixelFromGrid((index * 13) % sensorGrid.columns, (index * 7) % sensorGrid.rows));
    rays.push(makeRay(`nolens-guide-${sample.id}`, [sample.position, target], sample, pointToSensorHit(config, target) ?? { col: 0, row: 0 }, 0.18));
  }
}

function renderPinhole(
  config: SceneConfig,
  samples: ObjectSample[],
  accum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  const aperturePoints = diskSamples(config.lensPosition, Math.max(0.002, config.pinholeRadius), 9);
  const brightness = 0.23 * Math.min(2.8, Math.max(0.25, config.pinholeRadius / 0.055));

  for (const sample of samples) {
    for (const aperturePoint of aperturePoints) {
      const direction = sub(aperturePoint, sample.position);
      const hitPoint = intersectRayWithX(aperturePoint, direction, config.sensorPosition.x);
      const hit = hitPoint ? pointToSensorHit(config, hitPoint) : null;

      if (!hitPoint || !hit || radialDistance(aperturePoint, config.lensPosition) > config.pinholeRadius) {
        continue;
      }

      const light = sampleLight(sample, config);
      const rayIntensity = sample.intensity * light * brightness;
      const ray = makeRay(`pinhole-${sample.id}-${aperturePoint.y.toFixed(2)}-${aperturePoint.z.toFixed(2)}`, [sample.position, aperturePoint, hitPoint], sample, hit, rayIntensity);
      splat(accum, pixelToRays, hit, sample.color, rayIntensity, config.pinholeRadius > 0.1 ? 1.2 : 0.65, ray);

      if (rays.length < 360 && sampleIndex(sample) % 8 === 0) {
        rays.push(ray);
      }
    }
  }
}

function renderLens(
  config: SceneConfig,
  samples: ObjectSample[],
  accum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  const aperturePoints = diskSamples(config.lensPosition, Math.max(0.04, config.apertureRadius), 13);
  const brightness = config.mode === "out-of-focus" ? 0.17 : 0.26;

  for (const sample of samples) {
    const imagePoint = idealImagePoint(config, sample.position);

    for (const aperturePoint of aperturePoints) {
      if (radialDistance(aperturePoint, config.lensPosition) > config.apertureRadius) {
        continue;
      }

      const refractedDirection = sub(imagePoint, aperturePoint);
      const hitPoint = intersectRayWithX(aperturePoint, refractedDirection, config.sensorPosition.x);
      const hit = hitPoint ? pointToSensorHit(config, hitPoint) : null;

      if (!hitPoint || !hit) {
        continue;
      }

      const light = sampleLight(sample, config);
      const focusDistance = Math.abs((computeIdealImageX(config) ?? config.sensorPosition.x) - config.sensorPosition.x);
      const defocusBoost = config.mode === "out-of-focus" ? Math.min(1.25, 0.85 + focusDistance * 0.35) : 1;
      const rayIntensity = sample.intensity * light * brightness * defocusBoost;
      const ray = makeRay(`lens-${sample.id}-${aperturePoint.y.toFixed(2)}-${aperturePoint.z.toFixed(2)}`, [sample.position, aperturePoint, hitPoint], sample, hit, rayIntensity);
      splat(accum, pixelToRays, hit, sample.color, rayIntensity, config.mode === "out-of-focus" ? 1.05 : 0.78, ray);

      if (rays.length < 440 && sampleIndex(sample) % 7 === 0) {
        rays.push(ray);
      }
    }
  }
}

function createAppleSamples(objectPosition: Vec3): ObjectSample[] {
  const samples: ObjectSample[] = [];
  let index = 0;

  for (let iy = -7; iy <= 7; iy += 1) {
    for (let iz = -7; iz <= 7; iz += 1) {
      const y = iy * 0.075;
      const z = iz * 0.07;
      const upperDent = y > 0.28 ? 0.85 + Math.abs(z) * 0.35 : 1;
      const shape = (z / 0.46) ** 2 + ((y + 0.03) / (0.55 * upperDent)) ** 2;

      if (shape <= 1 && !(y > 0.38 && Math.abs(z) < 0.09)) {
        const shade = 0.82 + (z + 0.46) * 0.18 + (0.55 - Math.abs(y)) * 0.06;
        samples.push({
          id: `apple-${index}`,
          position: { x: objectPosition.x, y: objectPosition.y + y, z: objectPosition.z + z },
          color: { r: 0.82 * shade, g: 0.13 * shade, b: 0.1 * shade },
          intensity: 0.9,
        });
        index += 1;
      }
    }
  }

  for (let stem = 0; stem < 7; stem += 1) {
    samples.push({
      id: `stem-${index}`,
      position: {
        x: objectPosition.x,
        y: objectPosition.y + 0.43 + stem * 0.045,
        z: objectPosition.z + 0.015 + stem * 0.006,
      },
      color: { r: 0.36, g: 0.2, b: 0.1 },
      intensity: 0.78,
    });
    index += 1;
  }

  for (let leaf = 0; leaf < 13; leaf += 1) {
    const angle = (leaf / 13) * Math.PI * 2;
    samples.push({
      id: `leaf-${index}`,
      position: {
        x: objectPosition.x,
        y: objectPosition.y + 0.62 + Math.sin(angle) * 0.045,
        z: objectPosition.z + 0.18 + Math.cos(angle) * 0.12,
      },
      color: { r: 0.18, g: 0.5, b: 0.26 },
      intensity: 0.74,
    });
    index += 1;
  }

  return samples;
}

function diskSamples(center: Vec3, radius: number, count: 9 | 13): Vec3[] {
  const points: Vec3[] = [{ ...center }];
  const rings = count === 13 ? [0.46, 0.82] : [0.72];
  const counts = count === 13 ? [4, 8] : [8];

  rings.forEach((ring, ringIndex) => {
    const ringCount = counts[ringIndex];
    for (let index = 0; index < ringCount; index += 1) {
      const angle = (index / ringCount) * Math.PI * 2 + (ringIndex * Math.PI) / 8;
      points.push({
        x: center.x,
        y: center.y + Math.sin(angle) * radius * ring,
        z: center.z + Math.cos(angle) * radius * ring,
      });
    }
  });

  return points;
}

function representativeNoLensSamples(samples: ObjectSample[], col: number, row: number): ObjectSample[] {
  const selected: ObjectSample[] = [];
  const seed = col * 31 + row * 17;

  for (let index = 0; index < 8; index += 1) {
    selected.push(samples[(seed + index * 13) % samples.length]);
  }

  return selected;
}

function sampleIndex(sample: ObjectSample): number {
  const parts = sample.id.split("-");
  return Number(parts[parts.length - 1]) || 0;
}

function idealImagePoint(config: SceneConfig, objectPoint: Vec3): Vec3 {
  const doDistance = Math.max(0.1, config.lensPosition.x - objectPoint.x);
  const denominator = 1 / config.focalLength - 1 / doDistance;
  const di = denominator > 0.02 ? 1 / denominator : 14;
  const magnification = -di / doDistance;

  return {
    x: config.lensPosition.x + di,
    y: config.lensPosition.y + (objectPoint.y - config.lensPosition.y) * magnification,
    z: config.lensPosition.z + (objectPoint.z - config.lensPosition.z) * magnification,
  };
}

function computeIdealImageX(config: SceneConfig): number | null {
  if (config.mode === "no-lens" || config.mode === "pinhole") {
    return null;
  }

  const doDistance = Math.max(0.1, config.lensPosition.x - config.objectPosition.x);
  const denominator = 1 / config.focalLength - 1 / doDistance;
  return denominator > 0.02 ? config.lensPosition.x + 1 / denominator : null;
}

function sampleLight(sample: ObjectSample, config: SceneConfig): number {
  if (!config.lightEnabled) {
    return 0;
  }

  const toLight = sub(config.lightPosition, sample.position);
  const distance = Math.max(0.5, length(toLight));
  const surfaceNormal = normalize({
    x: -0.35,
    y: sample.position.y - config.objectPosition.y,
    z: sample.position.z - config.objectPosition.z,
  });
  const incoming = normalize(toLight);
  const facing = Math.max(0.28, dot(surfaceNormal, incoming) * 0.62 + 0.44);

  return config.lightIntensity * facing / (0.65 + distance * distance * 0.1);
}

function pointToSensorHit(config: SceneConfig, point: Vec3): SensorHit | null {
  const u = (point.z - config.sensorPosition.z) / sensorGrid.width + 0.5;
  const v = 0.5 - (point.y - config.sensorPosition.y) / sensorGrid.height;

  if (u < 0 || u >= 1 || v < 0 || v >= 1) {
    return null;
  }

  const colFloat = u * sensorGrid.columns - 0.5;
  const rowFloat = v * sensorGrid.rows - 0.5;

  return {
    col: Math.min(Math.max(Math.round(colFloat), 0), sensorGrid.columns - 1),
    row: Math.min(Math.max(Math.round(rowFloat), 0), sensorGrid.rows - 1),
    u,
    v,
    colFloat,
    rowFloat,
  };
}

function intersectRayWithX(origin: Vec3, direction: Vec3, x: number): Vec3 | null {
  if (Math.abs(direction.x) < 0.0001) {
    return null;
  }

  const t = (x - origin.x) / direction.x;
  if (t <= 0) {
    return null;
  }

  return add(origin, scale(direction, t));
}

function splat(
  accum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  hit: SensorHit,
  color: RgbColor,
  intensity: number,
  radius: number,
  ray: TracedRay,
) {
  const minCol = Math.max(0, Math.floor(hit.colFloat - radius));
  const maxCol = Math.min(sensorGrid.columns - 1, Math.ceil(hit.colFloat + radius));
  const minRow = Math.max(0, Math.floor(hit.rowFloat - radius));
  const maxRow = Math.min(sensorGrid.rows - 1, Math.ceil(hit.rowFloat + radius));
  const sigma = Math.max(0.42, radius * 0.62);

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      const dx = col - hit.colFloat;
      const dy = row - hit.rowFloat;
      const distance2 = dx * dx + dy * dy;
      const weight = Math.exp(-distance2 / (2 * sigma * sigma));

      if (weight < 0.08) {
        continue;
      }

      addColor(accum, col, row, color, intensity * weight);
      if (weight > 0.08) {
        pushPixelRay(pixelToRays, { col, row }, { ...ray, hitPixel: { col, row } });
      }
    }
  }
}

function addColor(accum: Float32Array, col: number, row: number, color: RgbColor, intensity: number) {
  const offset = (row * sensorGrid.columns + col) * 3;
  accum[offset] += color.r * intensity;
  accum[offset + 1] += color.g * intensity;
  accum[offset + 2] += color.b * intensity;
}

function pushPixelRay(pixelToRays: Record<string, TracedRay[]>, pixel: PixelHit, ray: TracedRay) {
  const key = pixelKey(pixel);
  const bucket = pixelToRays[key] ?? [];
  bucket.push(ray);
  bucket.sort((a, b) => b.intensity - a.intensity);

  if (bucket.length > maxRaysPerPixel) {
    bucket.length = maxRaysPerPixel;
  }

  pixelToRays[key] = bucket;
}

function makeRay(id: string, points: Vec3[], sample: ObjectSample, hitPixel: PixelHit, intensity: number): TracedRay {
  return {
    id,
    origin: points[0],
    points,
    color: rgbToCss(sample.color),
    intensity,
    hitPixel,
    sourceSampleId: sample.id,
  };
}

function toPixelBuffer(accum: Float32Array, mode: OpticalMode): Uint8ClampedArray {
  const buffer = new Uint8ClampedArray(sensorGrid.columns * sensorGrid.rows * 4);
  const exposure = mode === "no-lens" ? 8.2 : mode === "pinhole" ? 1.25 : mode === "out-of-focus" ? 1.08 : 1;
  const floor = mode === "no-lens" ? 17 : 8;

  for (let pixel = 0; pixel < sensorGrid.columns * sensorGrid.rows; pixel += 1) {
    const inOffset = pixel * 3;
    const outOffset = pixel * 4;
    buffer[outOffset] = toneMap(accum[inOffset], exposure, floor);
    buffer[outOffset + 1] = toneMap(accum[inOffset + 1], exposure, floor);
    buffer[outOffset + 2] = toneMap(accum[inOffset + 2], exposure, floor);
    buffer[outOffset + 3] = 255;
  }

  return buffer;
}

function toneMap(value: number, exposure: number, floor: number): number {
  return Math.min(255, Math.round(floor + (255 - floor) * (1 - Math.exp(-value * exposure))));
}

function rgbToCss(color: RgbColor): string {
  const r = Math.round(Math.min(1, color.r) * 255);
  const g = Math.round(Math.min(1, color.g) * 255);
  const b = Math.round(Math.min(1, color.b) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function maxValue(values: Float32Array): number {
  let max = 0;
  for (const value of values) {
    max = Math.max(max, value);
  }
  return max;
}

function radialDistance(point: Vec3, center: Vec3): number {
  return Math.hypot(point.y - center.y, point.z - center.z);
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(value: Vec3, scalar: number): Vec3 {
  return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar };
}

function length(value: Vec3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function normalize(value: Vec3): Vec3 {
  const size = length(value) || 1;
  return scale(value, 1 / size);
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
