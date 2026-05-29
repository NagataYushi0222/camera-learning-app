import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { lessonSteps } from "../data/lessonSteps";
import { useLessonStore } from "../state/useLessonStore";

export function NovelBox() {
  const [showTakeaway, setShowTakeaway] = useState(false);
  const {
    currentStepIndex,
    nextStep,
    previousStep,
    selectCenterPixel,
  } = useLessonStore();
  const step = lessonSteps[currentStepIndex];

  const movePrevious = () => {
    setShowTakeaway(false);
    previousStep();
  };

  const moveNext = () => {
    setShowTakeaway(false);
    nextStep();
  };

  return (
    <footer className="novel-box" aria-label="解説">
      <div className="guide-avatar" aria-hidden="true">
        <span>光</span>
      </div>
      <div className="dialogue-content">
        <div className="dialogue-heading">
          <span className="speaker-name">{step.speaker}</span>
          <strong>{step.stepTitle}</strong>
        </div>
        <div className="dialogue-lines">
          {step.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {showTakeaway ? <p className="takeaway">{step.takeaway}</p> : null}
      </div>
      <div className="dialogue-actions" aria-label="レッスン操作">
        <button onClick={movePrevious} type="button" disabled={currentStepIndex === 0}>
          <ChevronLeft size={16} aria-hidden="true" />
          前へ
        </button>
        <button className="secondary-action" onClick={selectCenterPixel} type="button">
          <Sparkles size={16} aria-hidden="true" />
          3Dで確かめる
        </button>
        <button className="secondary-action" onClick={() => setShowTakeaway((value) => !value)} type="button">
          この章の要点
        </button>
        <button onClick={moveNext} type="button" disabled={currentStepIndex === lessonSteps.length - 1}>
          次へ
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
