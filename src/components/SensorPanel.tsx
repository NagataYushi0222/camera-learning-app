import { Crosshair, Grid2X2, MousePointer2, Power, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";
import {
  modeDescriptions,
  modeLabels,
  pixelInfoText,
  rayDisplayModeLabels,
  selectedPixelFromGrid,
  sensorDisplayModeLabels,
  sensorQualityLabels,
  type RayDisplayMode,
  type SensorDisplayMode,
  type SensorQuality,
  type SimulationParams,
} from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";
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
  return (
    <label className="experiment-control">
      <span>
        <strong>{label}</strong>
        <output>
          {formatValue(value, digits)}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) => onChange(paramKey, Number(event.currentTarget.value))}
        onChange={(event) => onChange(paramKey, Number(event.currentTarget.value))}
      />
    </label>
  );
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
    sensorResult,
    selectedPixel,
    selectedRays,
    selectPixel,
    clearSelectedPixel,
    setSensorDisplayMode,
    setSensorQuality,
    setRayDisplayMode,
    toggleSensorGrid,
    updateSimulationParam,
    toggleLight,
  } = useLessonStore();

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
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ray-traced Sensor</p>
          <h2>スクリーン / センサー</h2>
        </div>
        <span className="mode-pill">{modeLabels[mode]}</span>
      </div>

      <div
        className="sensor-screen"
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

      <div className="display-panel" aria-label="表示設定">
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

      <div className="pixel-info">
        <div className="info-row">
          <Crosshair size={16} aria-hidden="true" />
          <strong>選択ピクセル</strong>
        </div>
        <p>{pixelInfoText(mode, selectedPixel, selectedRays)}</p>
        <dl>
          <div>
            <dt>座標</dt>
            <dd>{selectedPixel ? `列${selectedPixel.col + 1}・行${selectedPixel.row + 1}` : "未選択"}</dd>
          </div>
          <div>
            <dt>寄与光線</dt>
            <dd>{selectedPixel ? `${selectedRays.length} 本` : "未選択"}</dd>
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

      <section className="experiment-panel" aria-label="実験パラメータ">
        <div className="info-row experiment-heading">
          <strong>実験パラメータ</strong>
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
        <NumericControl label="物体X" paramKey="objectX" min={-4.2} max={-1.6} step={0.05} value={params.objectX} onChange={updateNumber} />
        <NumericControl label="レンズX" paramKey="lensX" min={-0.7} max={0.7} step={0.05} value={params.lensX} onChange={updateNumber} />
        <NumericControl label="センサーX" paramKey="sensorX" min={1.4} max={4.6} step={0.05} value={params.sensorX} onChange={updateNumber} />
        <NumericControl label="焦点距離" paramKey="focalLength" min={0.9} max={2.1} step={0.05} value={params.focalLength} onChange={updateNumber} />
        <NumericControl label="レンズ口径" paramKey="apertureRadius" min={0.08} max={0.82} step={0.02} value={params.apertureRadius} onChange={updateNumber} />
        <NumericControl label="ピンホール半径" paramKey="pinholeRadius" min={0.01} max={0.22} step={0.005} value={params.pinholeRadius} onChange={updateNumber} digits={3} />
        <NumericControl label="光の強さ" paramKey="lightIntensity" min={0} max={2.5} step={0.05} value={params.lightIntensity} onChange={updateNumber} />
      </section>
    </div>
  );
}
