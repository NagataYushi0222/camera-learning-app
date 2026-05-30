import { Crosshair, Grid2X2, MousePointer2, Power, RotateCcw, X } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  modeDescriptions,
  modeLabels,
  pixelInfoText,
  rayDisplayModeLabels,
  selectedPixelFromGrid,
  sensorDisplayModeLabels,
  sensorQualityLabels,
  computeOpticalInfo,
  simulationPresets,
  type RayDisplayMode,
  type SensorDisplayMode,
  type SensorQuality,
  type SimulationPresetId,
  type SimulationParams,
} from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";
import { useScenarioStore } from "../state/useScenarioStore";
import { getStep } from "../content/chapters";
import type { SelectedPixel } from "../types";

function pixelFromPointer(event: MouseEvent<HTMLDivElement>, width: number, height: number): SelectedPixel {
  const rect = event.currentTarget.getBoundingClientRect();
  const u = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const v = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
  const col = Math.min(Math.floor(u * width), width - 1);
  const row = Math.min(Math.floor(v * height), height - 1);

  return selectedPixelFromGrid(col, row, { columns: width, rows: height });
}

function formatValue(value: number, digits = 2): string {
  return value.toFixed(digits);
}

type NumericControlProps = {
  label: string;
  paramKey: keyof SimulationParams;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  value: number;
  onChange: (key: keyof SimulationParams, value: number) => void;
};

function NumericControl({ label, paramKey, min, max, step, unit = "", digits = 2, value, onChange }: NumericControlProps) {
  const [draftValue, setDraftValue] = useState(value);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const scheduleChange = (nextValue: number) => {
    setDraftValue(nextValue);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      onChange(paramKey, nextValue);
      timeoutRef.current = null;
    }, 90);
  };

  const commitChange = (nextValue = draftValue) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onChange(paramKey, nextValue);
  };

  return (
    <label className="experiment-control">
      <span>
        <strong>{label}</strong>
        <output>
          {formatValue(draftValue, digits)}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onChange={(event) => scheduleChange(Number(event.currentTarget.value))}
        onPointerUp={() => commitChange()}
        onBlur={() => commitChange()}
        onKeyUp={() => commitChange()}
      />
    </label>
  );
}

type ParameterGroupProps = {
  title: string;
  children: ReactNode;
};

function ParameterGroup({ title, children }: ParameterGroupProps) {
  return (
    <div className="parameter-group">
      <h3>{title}</h3>
      <div className="parameter-controls">{children}</div>
    </div>
  );
}

function formatMetric(value: number | null, unit = "", digits = 2): string {
  return value === null ? "--" : `${value.toFixed(digits)}${unit}`;
}

export function SensorPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    mode,
    params,
    sensorDisplayMode,
    sensorQuality,
    rayDisplayMode,
    showSensorGrid,
    sceneConfig,
    sensorResult,
    selectedPixel,
    selectedContributorRays,
    selectedSourceBundleRays,
    dominantSourceSampleId,
    selectPixel,
    clearSelectedPixel,
    setSensorDisplayMode,
    setSensorQuality,
    setRayDisplayMode,
    toggleSensorGrid,
    updateSimulationParam,
    resetSimulationParams,
    applySimulationPreset,
    toggleLight,
  } = useLessonStore();
  const { learningMode, currentChapterId, currentStepId } = useScenarioStore();
  const scenarioStep = getStep(currentChapterId, currentStepId);
  const needsParameterPanel =
    learningMode === "explore" ||
    scenarioStep.requiredAction?.type === "focusAdjust" ||
    scenarioStep.requiredAction?.type === "changeAperture" ||
    scenarioStep.requiredAction?.type === "changeFocalLength";
  const opticalInfo = computeOpticalInfo(sceneConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = sensorResult.width;
    canvas.height = sensorResult.height;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = true;
    const imageData = new ImageData(
      new Uint8ClampedArray(sensorResult.pixelBuffer),
      sensorResult.width,
      sensorResult.height,
    );
    context.putImageData(imageData, 0, 0);
  }, [sensorResult]);

  const updateNumber = (key: keyof SimulationParams, value: number) => {
    updateSimulationParam(key, value);
  };

  return (
    <div className="sensor-panel">
      <div className="sensor-fixed sensor-preview-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Ray-traced Sensor</p>
            <h2>スクリーン / センサー</h2>
          </div>
          <span className="mode-pill">{modeLabels[mode]}</span>
        </div>

        <div
          className="sensor-screen"
          style={{ aspectRatio: `${sensorResult.width} / ${sensorResult.height}` }}
          onClick={(event) => selectPixel(pixelFromPointer(event, sensorResult.width, sensorResult.height))}
          role="button"
          tabIndex={0}
          aria-label="クリックしてピクセルを選択"
        >
          <canvas ref={canvasRef} className="sensor-canvas" aria-label="光線計算によるセンサー画像" />
          {showSensorGrid ? <div className="sensor-grid" aria-hidden="true" /> : null}
          {selectedPixel ? (
            <span
              className="selected-pixel-marker"
              style={{ left: `${selectedPixel.u * 100}%`, top: `${selectedPixel.v * 100}%` }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>

      <div className="sensor-controls-scroll">
        <div className="display-panel inspector-card" aria-label="表示設定">
          <div className="display-row">
            <span>センサー表示</span>
            <div className="segmented-control compact">
              {(Object.keys(sensorDisplayModeLabels) as SensorDisplayMode[]).map((displayMode) => (
                <button
                  key={displayMode}
                  className={displayMode === sensorDisplayMode ? "segment-button active" : "segment-button"}
                  type="button"
                  onClick={() => setSensorDisplayMode(displayMode)}
                >
                  {sensorDisplayModeLabels[displayMode]}
                </button>
              ))}
            </div>
          </div>
          <div className="display-row">
            <span>品質</span>
            <div className="segmented-control compact">
              {(Object.keys(sensorQualityLabels) as SensorQuality[]).map((quality) => (
                <button
                  key={quality}
                  className={quality === sensorQuality ? "segment-button active" : "segment-button"}
                  type="button"
                  onClick={() => setSensorQuality(quality)}
                >
                  {sensorQualityLabels[quality]}
                </button>
              ))}
            </div>
          </div>
          <div className="display-row">
            <span>光線表示</span>
            <div className="segmented-control compact">
              {(Object.keys(rayDisplayModeLabels) as RayDisplayMode[]).map((displayMode) => (
                <button
                  key={displayMode}
                  className={displayMode === rayDisplayMode ? "segment-button active" : "segment-button"}
                  type="button"
                  onClick={() => setRayDisplayMode(displayMode)}
                >
                  {rayDisplayModeLabels[displayMode]}
                </button>
              ))}
            </div>
          </div>
          <button className={showSensorGrid ? "grid-toggle active" : "grid-toggle"} type="button" onClick={toggleSensorGrid}>
            <Grid2X2 size={15} aria-hidden="true" />
            グリッド
          </button>
        </div>

        <section className="optical-info-panel inspector-card" aria-label="光学情報">
          <div className="info-row">
            <strong>光学情報</strong>
          </div>
          <dl className="optical-metrics">
            <div>
              <dt>物体距離 do</dt>
              <dd>{formatMetric(opticalInfo.objectDistance, "u")}</dd>
            </div>
            <div>
              <dt>焦点距離 f</dt>
              <dd>{formatMetric(opticalInfo.focalLength, "u")}</dd>
            </div>
            <div>
              <dt>理想像距離 di</dt>
              <dd>{formatMetric(mode === "lens" || mode === "out-of-focus" ? opticalInfo.idealImageDistance : null, "u")}</dd>
            </div>
            <div>
              <dt>現在のスクリーン距離</dt>
              <dd>{formatMetric(opticalInfo.currentScreenDistance, "u")}</dd>
            </div>
            <div>
              <dt>ピント誤差</dt>
              <dd>{formatMetric(mode === "lens" || mode === "out-of-focus" ? opticalInfo.focusError : null, "u")}</dd>
            </div>
            <div>
              <dt>推定ボケ量</dt>
              <dd>{formatMetric(mode === "lens" || mode === "out-of-focus" ? opticalInfo.estimatedBlur : null, "px")}</dd>
            </div>
          </dl>
        </section>

        <div className="pixel-info inspector-card">
          <div className="info-row">
            <Crosshair size={16} aria-hidden="true" />
            <strong>選択ピクセル</strong>
          </div>
          <p>{pixelInfoText(mode, selectedPixel, selectedContributorRays, selectedSourceBundleRays)}</p>
          <dl>
            <div>
              <dt>座標</dt>
              <dd>{selectedPixel ? `列${selectedPixel.col + 1}・行${selectedPixel.row + 1}` : "未選択"}</dd>
            </div>
            <div>
              <dt>届いた光</dt>
              <dd>{selectedPixel ? `${selectedContributorRays.length} 本` : "未選択"}</dd>
            </div>
            <div>
              <dt>物体点光束</dt>
              <dd>{selectedPixel ? `${selectedSourceBundleRays.length} 本` : "未選択"}</dd>
            </div>
            <div>
              <dt>状態</dt>
              <dd>{modeDescriptions[mode]}</dd>
            </div>
          </dl>
          <div className="sensor-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={() =>
                selectPixel(
                  selectedPixelFromGrid(Math.floor(sensorResult.width / 2), Math.floor(sensorResult.height / 2), {
                    columns: sensorResult.width,
                    rows: sensorResult.height,
                  }),
                )
              }
            >
              <MousePointer2 size={16} aria-hidden="true" />
              中央を選択
            </button>
            <button className="icon-button subtle" title="選択を解除" type="button" onClick={clearSelectedPixel}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {learningMode === "explore" ? <section className="debug-panel inspector-card" aria-label="光学デバッグ">
          <div className="info-row">
            <strong>光学デバッグ</strong>
          </div>
          <dl className="debug-metrics">
            <div>
              <dt>mode</dt>
              <dd>{mode}</dd>
            </div>
            <div>
              <dt>objectX</dt>
              <dd>{formatMetric(params.objectX)}</dd>
            </div>
            <div>
              <dt>lensX</dt>
              <dd>{formatMetric(params.lensX)}</dd>
            </div>
            <div>
              <dt>sensorX</dt>
              <dd>{formatMetric(params.sensorX)}</dd>
            </div>
            <div>
              <dt>focalLength</dt>
              <dd>{formatMetric(params.focalLength)}</dd>
            </div>
            <div>
              <dt>do</dt>
              <dd>{formatMetric(opticalInfo.objectDistance)}</dd>
            </div>
            <div>
              <dt>di</dt>
              <dd>{formatMetric(opticalInfo.idealImageDistance)}</dd>
            </div>
            <div>
              <dt>idealImageX</dt>
              <dd>{formatMetric(sensorResult.idealImageX)}</dd>
            </div>
            <div>
              <dt>focusError</dt>
              <dd>{formatMetric(opticalInfo.focusError)}</dd>
            </div>
            <div>
              <dt>apertureRadius</dt>
              <dd>{formatMetric(params.apertureRadius)}</dd>
            </div>
            <div>
              <dt>selectedPixel</dt>
              <dd>{selectedPixel ? `${selectedPixel.col},${selectedPixel.row}` : "--"}</dd>
            </div>
            <div>
              <dt>contributor rays</dt>
              <dd>{selectedContributorRays.length}</dd>
            </div>
            <div>
              <dt>dominantSourceSampleId</dt>
              <dd>{dominantSourceSampleId ?? "--"}</dd>
            </div>
            <div>
              <dt>source bundle rays</dt>
              <dd>{selectedSourceBundleRays.length}</dd>
            </div>
          </dl>
        </section> : null}

        {needsParameterPanel ? <section className="experiment-panel parameter-panel inspector-card" aria-label="実験パラメータ">
          <div className="info-row experiment-heading">
            <strong>実験パラメータ</strong>
            <button
              className="secondary-action reset-action"
              type="button"
              onClick={resetSimulationParams}
              title="初期値に戻す"
            >
              <RotateCcw size={15} aria-hidden="true" />
              リセット
            </button>
          </div>
          <div className="preset-grid" aria-label="プリセット">
            {(Object.keys(simulationPresets) as SimulationPresetId[]).map((presetId) => {
              const preset = simulationPresets[presetId];
              return (
                <button className="preset-button" key={presetId} type="button" onClick={() => applySimulationPreset(presetId)}>
                  <strong>{preset.label}</strong>
                  <span>{preset.description}</span>
                </button>
              );
            })}
          </div>

          <ParameterGroup title="基本">
            <NumericControl label="焦点距離" paramKey="focalLength" min={0.9} max={2.1} step={0.05} value={params.focalLength} onChange={updateNumber} />
            <NumericControl label="スクリーン距離" paramKey="sensorX" min={1.4} max={4.6} step={0.05} value={params.sensorX} onChange={updateNumber} />
            <NumericControl label="レンズ口径" paramKey="apertureRadius" min={0.08} max={0.82} step={0.02} value={params.apertureRadius} onChange={updateNumber} />
          </ParameterGroup>

          <ParameterGroup title="位置">
            <NumericControl label="物体位置" paramKey="objectX" min={-4.2} max={-1.6} step={0.05} value={params.objectX} onChange={updateNumber} />
            <NumericControl label="レンズ位置" paramKey="lensX" min={-0.7} max={0.7} step={0.05} value={params.lensX} onChange={updateNumber} />
            <NumericControl label="スクリーン位置" paramKey="sensorX" min={1.4} max={4.6} step={0.05} value={params.sensorX} onChange={updateNumber} />
          </ParameterGroup>

          <ParameterGroup title="詳細">
            <NumericControl label="ピンホール半径" paramKey="pinholeRadius" min={0.01} max={0.22} step={0.005} value={params.pinholeRadius} onChange={updateNumber} digits={3} />
            <NumericControl label="光源強度" paramKey="lightIntensity" min={0} max={2.5} step={0.05} value={params.lightIntensity} onChange={updateNumber} />
            <NumericControl label="サンプル数" paramKey="sampleCount" min={1} max={3} step={1} value={params.sampleCount} onChange={updateNumber} digits={0} />
            <NumericControl label="光線数" paramKey="rayCount" min={5} max={25} step={1} value={params.rayCount} onChange={updateNumber} digits={0} />
            <div className="parameter-inline">
              <span>光源ON/OFF</span>
              <button
                className={params.lightEnabled ? "power-button active" : "power-button"}
                type="button"
                onClick={toggleLight}
                title="光源ON/OFF"
              >
                <Power size={15} aria-hidden="true" />
                光源
              </button>
            </div>
          </ParameterGroup>
        </section> : (
          <div className="guided-compact-note inspector-card">
            <strong>Guided Mode</strong>
            <span>必要な操作だけを表示しています。全パラメータは「自由に試す」で開けます。</span>
          </div>
        )}
      </div>
    </div>
  );
}
