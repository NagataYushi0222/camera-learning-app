import { Crosshair, MousePointer2, X } from "lucide-react";
import type { MouseEvent } from "react";
import { modeDescriptions, modeLabels, pixelInfoText, sensorGrid } from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";
import type { SelectedPixel } from "../types";

function pixelFromPointer(event: MouseEvent<HTMLDivElement>): SelectedPixel {
  const rect = event.currentTarget.getBoundingClientRect();
  const u = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const v = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

  return {
    col: Math.min(Math.floor(u * sensorGrid.columns), sensorGrid.columns - 1),
    row: Math.min(Math.floor(v * sensorGrid.rows), sensorGrid.rows - 1),
    u,
    v,
    sensorX: (u - 0.5) * 2,
    sensorY: (0.5 - v) * 2,
  };
}

export function SensorPanel() {
  const { mode, selectedPixel, selectPixel, clearSelectedPixel } = useLessonStore();

  return (
    <div className="sensor-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Sensor Preview</p>
          <h2>スクリーン / センサー</h2>
        </div>
        <span className="mode-pill">{modeLabels[mode]}</span>
      </div>

      <div
        className={`sensor-screen sensor-screen-${mode}`}
        onClick={(event) => selectPixel(pixelFromPointer(event))}
        role="button"
        tabIndex={0}
        aria-label="クリックしてピクセルを選択"
      >
        <div className="sensor-grid" aria-hidden="true" />
        <div className="projection-stage" aria-hidden="true">
          <div className="apple-projection">
            <span className="apple-stem" />
            <span className="apple-body" />
          </div>
        </div>
        {selectedPixel ? (
          <span
            className="selected-pixel-marker"
            style={{ left: `${selectedPixel.u * 100}%`, top: `${selectedPixel.v * 100}%` }}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="pixel-info">
        <div className="info-row">
          <Crosshair size={16} aria-hidden="true" />
          <strong>選択ピクセル</strong>
        </div>
        <p>{pixelInfoText(mode, selectedPixel)}</p>
        <dl>
          <div>
            <dt>座標</dt>
            <dd>{selectedPixel ? `列${selectedPixel.col + 1}・行${selectedPixel.row + 1}` : "未選択"}</dd>
          </div>
          <div>
            <dt>状態</dt>
            <dd>{modeDescriptions[mode]}</dd>
          </div>
        </dl>
        <div className="sensor-actions">
          <button className="secondary-action" type="button" onClick={() => selectPixel({
            col: Math.floor(sensorGrid.columns / 2),
            row: Math.floor(sensorGrid.rows / 2),
            u: 0.5,
            v: 0.5,
            sensorX: 0,
            sensorY: 0,
          })}>
            <MousePointer2 size={16} aria-hidden="true" />
            中央を選択
          </button>
          <button className="icon-button subtle" title="選択を解除" type="button" onClick={clearSelectedPixel}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
