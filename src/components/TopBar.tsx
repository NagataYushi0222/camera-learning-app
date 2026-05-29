import { Aperture, CircleDot, Eye, Grid2X2, Settings, Rows3 } from "lucide-react";
import { getChapter, getStep } from "../content/chapters";
import { modeLabels } from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";
import { useScenarioStore } from "../state/useScenarioStore";
import type { OpticalMode } from "../types";

const modeIcons: Record<OpticalMode, JSX.Element> = {
  "no-lens": <Grid2X2 size={16} aria-hidden="true" />,
  pinhole: <CircleDot size={16} aria-hidden="true" />,
  lens: <Aperture size={16} aria-hidden="true" />,
  "out-of-focus": <Eye size={16} aria-hidden="true" />,
};

export function TopBar() {
  const { mode, setMode } = useLessonStore();
  const { currentChapterId, currentStepId, openMap, toggleLearningMode, learningMode } = useScenarioStore();
  const chapter = getChapter(currentChapterId);
  const step = getStep(currentChapterId, currentStepId);
  const stepIndex = chapter.steps.findIndex((item) => item.id === step.id);
  const progress = ((stepIndex + 1) / chapter.steps.length) * 100;
  const modes = Object.keys(modeLabels) as OpticalMode[];

  return (
    <header className="top-bar">
      <div className="chapter-block">
        <p className="eyebrow">Camera / Eye Optics</p>
        <h1>{chapter.order}. {chapter.title}</h1>
      </div>

      <div className="top-progress" aria-label="進行状況">
        <span>
          {stepIndex + 1} / {chapter.steps.length}
        </span>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <nav className="mode-switcher" aria-label="表示モード切り替え">
        {modes.map((nextMode) => (
          <button
            className={nextMode === mode ? "mode-button active" : "mode-button"}
            key={nextMode}
            onClick={() => setMode(nextMode)}
            title={`${modeLabels[nextMode]}に切り替え`}
            type="button"
          >
            {modeIcons[nextMode]}
            <span>{modeLabels[nextMode]}</span>
          </button>
        ))}
      </nav>

      <div className="top-actions">
        <button className="icon-button" title="目次" type="button" onClick={openMap}>
          <Rows3 size={18} aria-hidden="true" />
        </button>
        <button className={learningMode === "explore" ? "icon-button active" : "icon-button"} title="Guided / Explore" type="button" onClick={toggleLearningMode}>
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
