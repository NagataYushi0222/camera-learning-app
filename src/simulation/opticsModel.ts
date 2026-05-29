import type { OpticalMode, SelectedPixel } from "../types";

export const sensorGrid = {
  columns: 224,
  rows: 144,
  width: 2.2,
  height: 1.42,
};

export type SensorDisplayMode = "learning" | "samples" | "debug";
export type SensorQuality = "low" | "medium" | "high";
export type RayDisplayMode = "representative" | "contributors" | "source-bundle" | "debug";

export type SensorResolution = {
  columns: number;
  rows: number;
};

export const sensorQualityLabels: Record<SensorQuality, string> = {
  low: "112 x 72",
  medium: "224 x 144",
  high: "448 x 288",
};

export const sensorDisplayModeLabels: Record<SensorDisplayMode, string> = {
  learning: "学習用表示",
  samples: "サンプル点表示",
  debug: "デバッグ表示",
};

export const rayDisplayModeLabels: Record<RayDisplayMode, string> = {
  representative: "代表光線",
  contributors: "このピクセルに届いた光",
  "source-bundle": "対応する物体点の光束",
  debug: "全光線デバッグ",
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
  sensorDisplayMode: SensorDisplayMode;
  sensorQuality: SensorQuality;
  resolution: SensorResolution;
  sampleCount: number;
  rayCount: number;
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
  sampleCount: number;
  rayCount: number;
};

export type SimulationPresetId =
  | "no-lens-mix"
  | "pinhole-inverted"
  | "lens-focused"
  | "defocused"
  | "wide-open"
  | "stopped-down";

export type SimulationPreset = {
  label: string;
  description: string;
  mode: OpticalMode;
  params: Partial<SimulationParams>;
};

export type OpticalInfo = {
  objectDistance: number;
  focalLength: number;
  idealImageDistance: number | null;
  currentScreenDistance: number;
  focusError: number | null;
  estimatedBlur: number | null;
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

export type RayKind =
  | "sensor-sample"
  | "selected-pixel-contributor"
  | "source-bundle"
  | "representative"
  | "debug";

export type TracedRay = {
  id: string;
  origin: Vec3;
  sourcePosition: Vec3;
  points: Vec3[];
  aperturePoint: Vec3 | null;
  idealImagePoint: Vec3 | null;
  sensorHitPoint: Vec3;
  exactHitPixel: PixelHit | null;
  displayedHitPixel: PixelHit;
  rayKind: RayKind;
  color: string;
  intensity: number;
  hitPixel: PixelHit;
  sourceSampleId: string;
};

export type SensorRenderResult = {
  width: number;
  height: number;
  pixelBuffer: Uint8ClampedArray;
  learningBuffer: Uint8ClampedArray;
  sampleBuffer: Uint8ClampedArray;
  debugBuffer: Uint8ClampedArray;
  rays: TracedRay[];
  pixelToRays: Record<string, TracedRay[]>;
  samples: ObjectSample[];
  maxChannel: number;
  idealImageX: number | null;
  config: SceneConfig;
};

type SensorHit = PixelHit & {
  u: number;
  v: number;
  colFloat: number;
  rowFloat: number;
};

const maxRaysPerPixel = 14;

export function resolutionForQuality(quality: SensorQuality): SensorResolution {
  if (quality === "low") {
    return { columns: 112, rows: 72 };
  }

  if (quality === "high") {
    return { columns: 448, rows: 288 };
  }

  return { columns: 224, rows: 144 };
}

export const defaultSimulationParams: SimulationParams = {
  objectX: -2.8,
  lensX: 0,
  sensorX: 3,
  focalLength: 1.45,
  apertureRadius: 0.52,
  pinholeRadius: 0.055,
  lightIntensity: 1,
  lightEnabled: true,
  sampleCount: 2,
  rayCount: 13,
};

export const simulationPresets: Record<SimulationPresetId, SimulationPreset> = {
  "no-lens-mix": {
    label: "レンズなし",
    description: "光が混ざる",
    mode: "no-lens",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 3,
      apertureRadius: 0.52,
      pinholeRadius: 0.055,
      lightIntensity: 1,
    },
  },
  "pinhole-inverted": {
    label: "ピンホール",
    description: "暗い反転像",
    mode: "pinhole",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 3,
      pinholeRadius: 0.055,
      lightIntensity: 1.25,
    },
  },
  "lens-focused": {
    label: "レンズ",
    description: "ピントが合う",
    mode: "lens",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 3,
      focalLength: 1.45,
      apertureRadius: 0.48,
      lightIntensity: 1,
    },
  },
  defocused: {
    label: "ピントずれ",
    description: "スクリーン位置がずれてボケる",
    mode: "out-of-focus",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 2.35,
      focalLength: 1.45,
      apertureRadius: 0.56,
      lightIntensity: 1,
    },
  },
  "wide-open": {
    label: "絞り開放",
    description: "明るいがボケやすい",
    mode: "out-of-focus",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 2.45,
      focalLength: 1.45,
      apertureRadius: 0.78,
      lightIntensity: 1.15,
    },
  },
  "stopped-down": {
    label: "絞り込み",
    description: "暗いがボケにくい",
    mode: "out-of-focus",
    params: {
      objectX: -2.8,
      lensX: 0,
      sensorX: 2.45,
      focalLength: 1.45,
      apertureRadius: 0.18,
      lightIntensity: 0.85,
    },
  },
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

export function createSceneConfig(
  mode: OpticalMode,
  params: SimulationParams,
  sensorQuality: SensorQuality = "medium",
  sensorDisplayMode: SensorDisplayMode = "learning",
): SceneConfig {
  const resolution = resolutionForQuality(sensorQuality);

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
    sensorDisplayMode,
    sensorQuality,
    resolution,
    sampleCount: Math.min(3, Math.max(1, Math.round(params.sampleCount))),
    rayCount: Math.min(25, Math.max(5, Math.round(params.rayCount))),
  };
}

export function computeOpticalInfo(config: SceneConfig): OpticalInfo {
  const objectDistance = Math.max(0.1, config.lensPosition.x - config.objectPosition.x);
  const focalLength = config.focalLength;
  const denominator = 1 / focalLength - 1 / objectDistance;
  const idealImageDistance = denominator > 0.02 ? 1 / denominator : null;
  const currentScreenDistance = config.sensorPosition.x - config.lensPosition.x;
  const focusError = idealImageDistance === null ? null : currentScreenDistance - idealImageDistance;
  const estimatedBlur = focusError === null ? null : Math.abs(focusError) * Math.max(0.08, config.apertureRadius) * 7.5;

  return {
    objectDistance,
    focalLength,
    idealImageDistance,
    currentScreenDistance,
    focusError,
    estimatedBlur,
  };
}

export function selectedPixelFromGrid(
  col: number,
  row: number,
  resolution: SensorResolution = { columns: sensorGrid.columns, rows: sensorGrid.rows },
): SelectedPixel {
  const clampedCol = Math.min(Math.max(col, 0), resolution.columns - 1);
  const clampedRow = Math.min(Math.max(row, 0), resolution.rows - 1);
  const u = (clampedCol + 0.5) / resolution.columns;
  const v = (clampedRow + 0.5) / resolution.rows;

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

function getRawPixelRays(result: SensorRenderResult, pixel: SelectedPixel | null): TracedRay[] {
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

export function getPixelContributorRays(result: SensorRenderResult, pixel: SelectedPixel | null): TracedRay[] {
  if (!pixel) {
    return [];
  }

  if (result.config.mode === "no-lens") {
    return getNoLensAnalysisRays(result.config, pixel, result.samples);
  }

  return getRawPixelRays(result, pixel)
    .slice(0, maxRaysPerPixel)
    .map((ray) => ({ ...ray, rayKind: "selected-pixel-contributor" }));
}

export function getRaysForPixel(result: SensorRenderResult, pixel: SelectedPixel | null): TracedRay[] {
  return getPixelContributorRays(result, pixel);
}

export function getDominantSourceSample(result: SensorRenderResult, pixel: SelectedPixel | null): ObjectSample | null {
  if (!pixel) {
    return null;
  }

  const candidates = result.config.mode === "no-lens" ? getNoLensAnalysisRays(result.config, pixel, result.samples) : getRawPixelRays(result, pixel);
  const totals = new Map<string, number>();

  for (const ray of candidates) {
    totals.set(ray.sourceSampleId, (totals.get(ray.sourceSampleId) ?? 0) + ray.intensity);
  }

  const dominantId = [...totals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return dominantId ? (result.samples.find((sample) => sample.id === dominantId) ?? null) : null;
}

export function getSourceBundleRays(config: SceneConfig, sourceSample: ObjectSample | null): TracedRay[] {
  if (!sourceSample || !config.lightEnabled || config.lightIntensity <= 0.001) {
    return [];
  }

  if (config.mode === "no-lens") {
    const centerPixel = selectedPixelFromGrid(Math.floor(config.resolution.columns / 2), Math.floor(config.resolution.rows / 2), config.resolution);
    const hitPoint = sensorPoint(config, centerPixel);
    const displayedHit = pointToDisplayedHit(config, hitPoint);
    return [
      makeRay({
        id: `source-bundle-nolens-${sourceSample.id}`,
        points: [sourceSample.position, hitPoint],
        sample: sourceSample,
        exactHitPixel: displayedHit,
        displayedHitPixel: displayedHit,
        sensorHitPoint: hitPoint,
        intensity: sourceSample.intensity * sampleLight(sourceSample, config),
        rayKind: "source-bundle",
      }),
    ];
  }

  const apertureRadius = config.mode === "pinhole" ? Math.max(0.002, config.pinholeRadius) : Math.max(0.04, config.apertureRadius);
  const aperturePoints = diskSamples(config.lensPosition, apertureRadius, config.mode === "pinhole" ? Math.min(15, config.rayCount) : config.rayCount);
  const imagePoint = config.mode === "pinhole" ? null : computeIdealImagePoint(config, sourceSample.position);
  const rays: TracedRay[] = [];

  for (const aperturePoint of aperturePoints) {
    if (radialDistance(aperturePoint, config.lensPosition) > apertureRadius) {
      continue;
    }

    const direction = imagePoint ? sub(imagePoint, aperturePoint) : sub(aperturePoint, sourceSample.position);
    const hitPoint = intersectRayWithX(aperturePoint, direction, config.sensorPosition.x);
    if (!hitPoint) {
      continue;
    }

    const exactHit = pointToSensorHit(config, hitPoint);
    const displayedHit = exactHit ?? pointToDisplayedHit(config, hitPoint);
    const points = imagePoint ? [sourceSample.position, aperturePoint, imagePoint, hitPoint] : [sourceSample.position, aperturePoint, hitPoint];

    rays.push(
      makeRay({
        id: `source-bundle-${sourceSample.id}-${rays.length}`,
        points,
        sample: sourceSample,
        exactHitPixel: exactHit,
        displayedHitPixel: displayedHit,
        sensorHitPoint: hitPoint,
        aperturePoint,
        idealImagePoint: imagePoint,
        intensity: sourceSample.intensity * sampleLight(sourceSample, config),
        rayKind: "source-bundle",
      }),
    );
  }

  return rays.slice(0, 25);
}

export function getNoLensAnalysisRays(config: SceneConfig, pixel: SelectedPixel | null, samples: ObjectSample[]): TracedRay[] {
  if (!pixel || !config.lightEnabled || config.lightIntensity <= 0.001) {
    return [];
  }

  const hitPoint = sensorPoint(config, pixel);
  const hit = pointToDisplayedHit(config, hitPoint);
  return stratifiedObjectSamples(samples, 28).map((sample, index) =>
    makeRay({
      id: `nolens-analysis-${sample.id}-${index}`,
      points: [sample.position, hitPoint],
      sample,
      exactHitPixel: hit,
      displayedHitPixel: hit,
      sensorHitPoint: hitPoint,
      intensity: sample.intensity * sampleLight(sample, config),
      rayKind: "selected-pixel-contributor",
    }),
  );
}

export function getRepresentativeRays(config: SceneConfig, samples: ObjectSample[]): TracedRay[] {
  if (!config.lightEnabled || config.lightIntensity <= 0.001) {
    return [];
  }

  if (config.mode === "no-lens") {
    const centerPixel = selectedPixelFromGrid(Math.floor(config.resolution.columns / 2), Math.floor(config.resolution.rows / 2), config.resolution);
    return getNoLensAnalysisRays(config, centerPixel, samples).slice(0, 7).map((ray) => ({ ...ray, rayKind: "representative" }));
  }

  const sourceSample =
    nearestSample(samples, { x: config.objectPosition.x, y: config.objectPosition.y + 0.08, z: config.objectPosition.z }) ?? samples[0] ?? null;
  return getSourceBundleRays(config, sourceSample)
    .slice(0, 7)
    .map((ray) => ({ ...ray, rayKind: "representative" }));
}

export function pixelInfoText(
  mode: OpticalMode,
  pixel: SelectedPixel | null,
  contributorRays: TracedRay[],
  sourceBundleRays: TracedRay[] = [],
): string {
  if (!pixel) {
    return "スクリーン上のピクセルをクリックすると、「届いた光」と「対応する物体点の光束」を分けて確認できます。";
  }

  const position = `列${pixel.col + 1} / 行${pixel.row + 1}`;
  const count = contributorRays.length;

  if (count === 0) {
    return `${position}: このピクセルに届いたサンプル光線はほとんどありません。`;
  }

  if (mode === "no-lens") {
    return `${position}: 実際には物体全体の多数の点から光が届いています。表示は上下左右・葉・茎を含む${count}本の代表光線です。`;
  }

  if (mode === "pinhole") {
    return `${position}: ${count}本の代表光線を表示中です。小さな穴を通った光だけが届いています。`;
  }

  if (mode === "out-of-focus") {
    return `${position}: このピクセルには${count}本の寄与光線があります。対応する物体点の光束${sourceBundleRays.length}本を見ると、理想像面で集まった後に広がる様子を確認できます。`;
  }

  return `${position}: このピクセルには${count}本の寄与光線があります。対応する物体点の光束${sourceBundleRays.length}本がセンサー上へ集まります。`;
}

export function renderSensorImage(config: SceneConfig): SensorRenderResult {
  const samples = createAppleSamples(config.objectPosition, config.sampleCount);
  const learningAccum = new Float32Array(config.resolution.columns * config.resolution.rows * 3);
  const sampleAccum = new Float32Array(config.resolution.columns * config.resolution.rows * 3);
  const debugAccum = new Float32Array(config.resolution.columns * config.resolution.rows * 3);
  const pixelToRays: Record<string, TracedRay[]> = {};
  const rays: TracedRay[] = [];
  const idealImageX = computeIdealImageX(config);

  if (!config.lightEnabled || config.lightIntensity <= 0.001) {
    const emptyBuffer = toPixelBuffer(learningAccum, config.mode, config.resolution, "learning");
    return {
      width: config.resolution.columns,
      height: config.resolution.rows,
      pixelBuffer: emptyBuffer,
      learningBuffer: emptyBuffer,
      sampleBuffer: emptyBuffer,
      debugBuffer: emptyBuffer,
      rays,
      pixelToRays,
      samples,
      maxChannel: 0,
      idealImageX,
      config,
    };
  }

  if (config.mode === "no-lens") {
    renderNoLens(config, samples, learningAccum, sampleAccum, debugAccum, pixelToRays, rays);
  } else if (config.mode === "pinhole") {
    renderPinhole(config, samples, learningAccum, sampleAccum, debugAccum, pixelToRays, rays);
  } else {
    renderLens(config, samples, learningAccum, sampleAccum, debugAccum, pixelToRays, rays);
  }

  const learningBuffer = toPixelBuffer(learningAccum, config.mode, config.resolution, "learning");
  const sampleBuffer = toPixelBuffer(sampleAccum, config.mode, config.resolution, "samples");
  const debugBuffer = toPixelBuffer(debugAccum, config.mode, config.resolution, "debug");
  const pixelBuffer =
    config.sensorDisplayMode === "samples"
      ? sampleBuffer
      : config.sensorDisplayMode === "debug"
        ? debugBuffer
        : learningBuffer;
  const maxChannel = maxValue(learningAccum);

  return {
    width: config.resolution.columns,
    height: config.resolution.rows,
    pixelBuffer,
    learningBuffer,
    sampleBuffer,
    debugBuffer,
    rays,
    pixelToRays,
    samples,
    maxChannel,
    idealImageX,
    config,
  };
}

function renderNoLens(
  config: SceneConfig,
  samples: ObjectSample[],
  learningAccum: Float32Array,
  sampleAccum: Float32Array,
  debugAccum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  const subsetTarget = Math.max(28, config.sampleCount * 28);
  const sampleStride = Math.max(1, Math.floor(samples.length / subsetTarget));

  for (let row = 0; row < config.resolution.rows; row += 1) {
    for (let col = 0; col < config.resolution.columns; col += 1) {
      const hitPoint = sensorPoint(config, selectedPixelFromGrid(col, row, config.resolution));
      const start = (col * 17 + row * 31) % sampleStride;

      for (let sampleIndex = start; sampleIndex < samples.length; sampleIndex += sampleStride) {
        const sample = samples[sampleIndex];
        const distance = length(sub(hitPoint, sample.position));
        const light = sampleLight(sample, config);
        const contribution = (sample.intensity * light * 0.024 * sampleStride) / Math.max(1.2, distance * distance);
        addColor(learningAccum, config.resolution, col, row, sample.color, contribution);
        addColor(debugAccum, config.resolution, col, row, sample.color, contribution * 0.9);
      }

      const representative = representativeNoLensSamples(samples, col, row);
      for (const sample of representative.slice(0, 5)) {
        const hitPixel = { col, row };
        const ray = makeRay({
          id: `nolens-${sample.id}-${col}-${row}`,
          points: [sample.position, hitPoint],
          sample,
          exactHitPixel: hitPixel,
          displayedHitPixel: hitPixel,
          sensorHitPoint: hitPoint,
          intensity: sampleLight(sample, config) * 0.1,
          rayKind: "sensor-sample",
        });
        pushPixelRay(pixelToRays, hitPixel, ray);
      }
    }
  }

  for (const sample of samples) {
    for (let scatter = 0; scatter < 5; scatter += 1) {
      const seed = sampleIndex(sample) * 47 + scatter * 19;
      const col = Math.abs(seed * 13) % config.resolution.columns;
      const row = Math.abs(seed * 7) % config.resolution.rows;
      const hitPoint = sensorPoint(config, selectedPixelFromGrid(col, row, config.resolution));
      const hit = pointToSensorHit(config, hitPoint);
      if (!hit) {
        continue;
      }
      const ray = makeRay({
        id: `nolens-sample-${sample.id}-${scatter}`,
        points: [sample.position, hitPoint],
        sample,
        exactHitPixel: hit,
        displayedHitPixel: hit,
        sensorHitPoint: hitPoint,
        intensity: sampleLight(sample, config) * 0.08,
        rayKind: "sensor-sample",
      });
      splat(sampleAccum, pixelToRays, config.resolution, hit, sample.color, sample.intensity * sampleLight(sample, config) * 0.08, 0.45, ray, false);
    }
  }

  for (let index = 0; index < Math.min(90, samples.length); index += 9) {
    const sample = samples[index];
    const target = sensorPoint(config, selectedPixelFromGrid((index * 13) % config.resolution.columns, (index * 7) % config.resolution.rows, config.resolution));
    const exactHit = pointToSensorHit(config, target);
    rays.push(
      makeRay({
        id: `nolens-guide-${sample.id}`,
        points: [sample.position, target],
        sample,
        exactHitPixel: exactHit,
        displayedHitPixel: exactHit ?? pointToDisplayedHit(config, target),
        sensorHitPoint: target,
        intensity: 0.18,
        rayKind: "debug",
      }),
    );
  }
}

function renderPinhole(
  config: SceneConfig,
  samples: ObjectSample[],
  learningAccum: Float32Array,
  sampleAccum: Float32Array,
  debugAccum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  const aperturePoints = diskSamples(config.lensPosition, Math.max(0.002, config.pinholeRadius), Math.min(15, config.rayCount));
  const brightness = 0.15 * Math.min(2.8, Math.max(0.25, config.pinholeRadius / 0.055));

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
      const ray = makeRay({
        id: `pinhole-${sample.id}-${aperturePoint.y.toFixed(2)}-${aperturePoint.z.toFixed(2)}`,
        points: [sample.position, aperturePoint, hitPoint],
        sample,
        exactHitPixel: hit,
        displayedHitPixel: hit,
        sensorHitPoint: hitPoint,
        aperturePoint,
        intensity: rayIntensity,
        rayKind: "sensor-sample",
      });
      splat(learningAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, pinholeLearningRadius(config), ray, true);
      splat(sampleAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, 0.45, ray, false);
      splat(debugAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, 0.28, ray, false);

      if (rays.length < 360 && sampleIndex(sample) % 8 === 0) {
        rays.push(ray);
      }
    }
  }
}

function renderLens(
  config: SceneConfig,
  samples: ObjectSample[],
  learningAccum: Float32Array,
  sampleAccum: Float32Array,
  debugAccum: Float32Array,
  pixelToRays: Record<string, TracedRay[]>,
  rays: TracedRay[],
) {
  const aperturePoints = diskSamples(config.lensPosition, Math.max(0.04, config.apertureRadius), config.rayCount);
  const brightness = config.mode === "out-of-focus" ? 0.17 : 0.26;

  for (const sample of samples) {
    const imagePoint = computeIdealImagePoint(config, sample.position);

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
      const ray = makeRay({
        id: `lens-${sample.id}-${aperturePoint.y.toFixed(2)}-${aperturePoint.z.toFixed(2)}`,
        points: [sample.position, aperturePoint, imagePoint, hitPoint],
        sample,
        exactHitPixel: hit,
        displayedHitPixel: hit,
        sensorHitPoint: hitPoint,
        aperturePoint,
        idealImagePoint: imagePoint,
        intensity: rayIntensity,
        rayKind: "sensor-sample",
      });
      splat(learningAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, lensLearningRadius(config), ray, true);
      splat(sampleAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, 0.42, ray, false);
      splat(debugAccum, pixelToRays, config.resolution, hit, sample.color, rayIntensity, 0.24, ray, false);

      if (rays.length < 440 && sampleIndex(sample) % 7 === 0) {
        rays.push(ray);
      }
    }
  }
}

function createAppleSamples(objectPosition: Vec3, sampleCount: number): ObjectSample[] {
  const samples: ObjectSample[] = [];
  let index = 0;
  const gridRadius = sampleCount <= 1 ? 9 : sampleCount >= 3 ? 18 : 14;
  const yStep = 0.525 / gridRadius;
  const zStep = 0.49 / gridRadius;

  for (let iy = -gridRadius; iy <= gridRadius; iy += 1) {
    for (let iz = -gridRadius; iz <= gridRadius; iz += 1) {
      const y = iy * yStep;
      const z = iz * zStep;
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

  const stemCount = sampleCount <= 1 ? 8 : sampleCount >= 3 ? 18 : 13;
  for (let stem = 0; stem < stemCount; stem += 1) {
    samples.push({
      id: `stem-${index}`,
      position: {
        x: objectPosition.x,
        y: objectPosition.y + 0.43 + stem * (0.31 / stemCount),
        z: objectPosition.z + 0.015 + stem * (0.052 / stemCount),
      },
      color: { r: 0.36, g: 0.2, b: 0.1 },
      intensity: 0.78,
    });
    index += 1;
  }

  const leafCount = sampleCount <= 1 ? 16 : sampleCount >= 3 ? 42 : 28;
  for (let leaf = 0; leaf < leafCount; leaf += 1) {
    const angle = (leaf / leafCount) * Math.PI * 2;
    samples.push({
      id: `leaf-${index}`,
      position: {
        x: objectPosition.x,
        y: objectPosition.y + 0.62 + Math.sin(angle) * 0.05,
        z: objectPosition.z + 0.18 + Math.cos(angle) * 0.12,
      },
      color: { r: 0.18, g: 0.5, b: 0.26 },
      intensity: 0.74,
    });
    index += 1;
  }

  return samples;
}

function diskSamples(center: Vec3, radius: number, count: number): Vec3[] {
  const points: Vec3[] = [{ ...center }];

  if (count <= 1) {
    return points;
  }

  const safeCount = Math.max(2, Math.round(count));
  const rings = safeCount <= 6 ? [0.78] : safeCount <= 14 ? [0.46, 0.82] : [0.32, 0.62, 0.9];
  const counts =
    safeCount <= 6
      ? [safeCount - 1]
      : safeCount <= 14
        ? [Math.min(4, safeCount - 1), safeCount - 1 - Math.min(4, safeCount - 1)]
        : [6, 8, safeCount - 15];

  rings.forEach((ring, ringIndex) => {
    const ringCount = counts[ringIndex];
    if (ringCount <= 0) {
      return;
    }

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

function stratifiedObjectSamples(samples: ObjectSample[], targetCount: number): ObjectSample[] {
  const groups: Record<string, ObjectSample[]> = {
    center: [],
    top: [],
    bottom: [],
    left: [],
    right: [],
    leaf: [],
    stem: [],
  };

  for (const sample of samples) {
    if (sample.id.startsWith("leaf")) {
      groups.leaf.push(sample);
    } else if (sample.id.startsWith("stem")) {
      groups.stem.push(sample);
    } else if (sample.position.y > 0.2) {
      groups.top.push(sample);
    } else if (sample.position.y < -0.2) {
      groups.bottom.push(sample);
    } else if (sample.position.z < -0.16) {
      groups.left.push(sample);
    } else if (sample.position.z > 0.16) {
      groups.right.push(sample);
    } else {
      groups.center.push(sample);
    }
  }

  const selected: ObjectSample[] = [];
  const plan: Array<[keyof typeof groups, number]> = [
    ["center", 5],
    ["top", 4],
    ["bottom", 4],
    ["left", 4],
    ["right", 4],
    ["leaf", 4],
    ["stem", 3],
  ];

  for (const [groupName, count] of plan) {
    selected.push(...evenlyPick(groups[groupName], count));
  }

  if (selected.length < targetCount) {
    selected.push(...evenlyPick(samples.filter((sample) => !selected.includes(sample)), targetCount - selected.length));
  }

  return selected.slice(0, targetCount);
}

function evenlyPick(samples: ObjectSample[], count: number): ObjectSample[] {
  if (samples.length === 0 || count <= 0) {
    return [];
  }

  if (samples.length <= count) {
    return samples;
  }

  const picked: ObjectSample[] = [];
  for (let index = 0; index < count; index += 1) {
    const sampleIndex = Math.round((index / Math.max(1, count - 1)) * (samples.length - 1));
    picked.push(samples[sampleIndex]);
  }
  return picked;
}

function nearestSample(samples: ObjectSample[], point: Vec3): ObjectSample | null {
  return samples
    .map((sample) => ({ sample, distance: length(sub(sample.position, point)) }))
    .sort((a, b) => a.distance - b.distance)[0]?.sample ?? null;
}

function sampleIndex(sample: ObjectSample): number {
  const parts = sample.id.split("-");
  return Number(parts[parts.length - 1]) || 0;
}

function resolutionScale(config: SceneConfig): number {
  return config.resolution.columns / 224;
}

function pinholeLearningRadius(config: SceneConfig): number {
  return (config.pinholeRadius > 0.09 ? 2.8 : 2.3) * resolutionScale(config);
}

function lensLearningRadius(config: SceneConfig): number {
  const idealX = computeIdealImageX(config) ?? config.sensorPosition.x;
  const focusError = Math.abs(config.sensorPosition.x - idealX);
  const apertureTerm = Math.max(0.08, config.apertureRadius);
  const circleOfConfusion = focusError * apertureTerm * 7.5;
  const minimumReconstruction = 2.6;
  return Math.min(18, (minimumReconstruction + circleOfConfusion) * resolutionScale(config));
}

export function computeIdealImagePoint(config: SceneConfig, objectPoint: Vec3): Vec3 {
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

  const colFloat = u * config.resolution.columns - 0.5;
  const rowFloat = v * config.resolution.rows - 0.5;

  return {
    col: Math.min(Math.max(Math.round(colFloat), 0), config.resolution.columns - 1),
    row: Math.min(Math.max(Math.round(rowFloat), 0), config.resolution.rows - 1),
    u,
    v,
    colFloat,
    rowFloat,
  };
}

function pointToDisplayedHit(config: SceneConfig, point: Vec3): PixelHit {
  const u = (point.z - config.sensorPosition.z) / sensorGrid.width + 0.5;
  const v = 0.5 - (point.y - config.sensorPosition.y) / sensorGrid.height;

  return {
    col: Math.min(Math.max(Math.round(u * config.resolution.columns - 0.5), 0), config.resolution.columns - 1),
    row: Math.min(Math.max(Math.round(v * config.resolution.rows - 0.5), 0), config.resolution.rows - 1),
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
  resolution: SensorResolution,
  hit: SensorHit,
  color: RgbColor,
  intensity: number,
  radius: number,
  ray: TracedRay,
  trackPixelRays: boolean,
) {
  const minCol = Math.max(0, Math.floor(hit.colFloat - radius));
  const maxCol = Math.min(resolution.columns - 1, Math.ceil(hit.colFloat + radius));
  const minRow = Math.max(0, Math.floor(hit.rowFloat - radius));
  const maxRow = Math.min(resolution.rows - 1, Math.ceil(hit.rowFloat + radius));
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

      addColor(accum, resolution, col, row, color, intensity * weight);
      if (trackPixelRays && weight > 0.08) {
        pushPixelRay(pixelToRays, { col, row }, { ...ray, displayedHitPixel: { col, row }, hitPixel: { col, row } });
      }
    }
  }
}

function addColor(accum: Float32Array, resolution: SensorResolution, col: number, row: number, color: RgbColor, intensity: number) {
  const offset = (row * resolution.columns + col) * 3;
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

function makeRay({
  id,
  points,
  sample,
  exactHitPixel,
  displayedHitPixel,
  sensorHitPoint,
  intensity,
  rayKind,
  aperturePoint = null,
  idealImagePoint = null,
}: {
  id: string;
  points: Vec3[];
  sample: ObjectSample;
  exactHitPixel: PixelHit | null;
  displayedHitPixel: PixelHit;
  sensorHitPoint: Vec3;
  intensity: number;
  rayKind: RayKind;
  aperturePoint?: Vec3 | null;
  idealImagePoint?: Vec3 | null;
}): TracedRay {
  return {
    id,
    origin: sample.position,
    sourcePosition: sample.position,
    points,
    aperturePoint,
    idealImagePoint,
    sensorHitPoint,
    exactHitPixel,
    displayedHitPixel,
    color: rgbToCss(sample.color),
    intensity,
    hitPixel: displayedHitPixel,
    rayKind,
    sourceSampleId: sample.id,
  };
}

function toPixelBuffer(
  accum: Float32Array,
  mode: OpticalMode,
  resolution: SensorResolution,
  displayMode: SensorDisplayMode,
): Uint8ClampedArray {
  const buffer = new Uint8ClampedArray(resolution.columns * resolution.rows * 4);
  const exposure =
    displayMode === "samples"
      ? mode === "pinhole"
        ? 1.5
        : 1.15
      : mode === "no-lens"
        ? 8.2
        : mode === "pinhole"
          ? 1.2
          : mode === "out-of-focus"
            ? 1.15
            : 1.08;
  const floor = mode === "no-lens" ? 17 : 8;

  for (let pixel = 0; pixel < resolution.columns * resolution.rows; pixel += 1) {
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
