import { BookOpen, ChevronLeft, ChevronRight, Compass, FlaskConical, Map } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getChapter, getStep } from "../../content/chapters";
import type { Choice, RequiredAction } from "../../content/lessonTypes";
import { computeOpticalInfo } from "../../simulation/opticsModel";
import { useLessonStore } from "../../state/useLessonStore";
import { useScenarioStore } from "../../state/useScenarioStore";
import { applyScenePreset, runSceneActions } from "../cinematic/sceneActions";
import { ChapterSummary } from "./ChapterSummary";
import { ChoicePanel } from "./ChoicePanel";
import { DialogueBox } from "./DialogueBox";
import { TaskHint } from "./TaskHint";

function isRequiredActionComplete(requiredAction: RequiredAction | undefined): boolean {
  if (!requiredAction) {
    return true;
  }

  const lesson = useLessonStore.getState();
  const opticalInfo = computeOpticalInfo(lesson.sceneConfig);

  switch (requiredAction.type) {
    case "selectPixel":
      return lesson.selectedPixel !== null;
    case "toggleLightOff":
      return !lesson.params.lightEnabled;
    case "toggleLightOn":
      return lesson.params.lightEnabled;
    case "switchMode":
      return lesson.mode === requiredAction.mode;
    case "focusAdjust":
      return opticalInfo.focusError !== null && Math.abs(opticalInfo.focusError) <= requiredAction.tolerance;
    case "changeAperture":
      return (
        (requiredAction.min === undefined || lesson.params.apertureRadius >= requiredAction.min) &&
        (requiredAction.max === undefined || lesson.params.apertureRadius <= requiredAction.max)
      );
    case "changeFocalLength":
      return (
        (requiredAction.min === undefined || lesson.params.focalLength >= requiredAction.min) &&
        (requiredAction.max === undefined || lesson.params.focalLength <= requiredAction.max)
      );
    case "clickObjectPoint":
      return false;
    default:
      return true;
  }
}

export function ScenarioPlayer() {
  const [expanded, setExpanded] = useState(false);
  const {
    currentChapterId,
    currentStepId,
    choiceFeedback,
    selectedChoiceId,
    learningMode,
    setChoiceFeedback,
    nextStep,
    previousStep,
    openMap,
    toggleLearningMode,
  } = useScenarioStore();
  const selectedPixel = useLessonStore((state) => state.selectedPixel);
  const lightEnabled = useLessonStore((state) => state.params.lightEnabled);
  const apertureRadius = useLessonStore((state) => state.params.apertureRadius);
  const focalLength = useLessonStore((state) => state.params.focalLength);
  const mode = useLessonStore((state) => state.mode);
  const sceneConfig = useLessonStore((state) => state.sceneConfig);
  const chapter = getChapter(currentChapterId);
  const step = getStep(currentChapterId, currentStepId);
  const stepIndex = chapter.steps.findIndex((item) => item.id === step.id);
  const progressText = `${chapter.order}章 ${stepIndex + 1} / ${chapter.steps.length}`;
  const taskCompleted = useMemo(
    () => isRequiredActionComplete(step.requiredAction),
    [step.requiredAction, selectedPixel, lightEnabled, apertureRadius, focalLength, mode, sceneConfig],
  );
  const selectedChoice = step.choices?.find((choice) => choice.id === selectedChoiceId);
  const quizAnsweredCorrectly = step.type !== "quiz" || selectedChoice?.isCorrect === true;
  const requiresChoice = (step.type === "choice" || step.type === "quiz") && !selectedChoiceId;
  const disableNext = (step.type === "task" && !taskCompleted) || requiresChoice || !quizAnsweredCorrectly;
  const forceExpanded = step.type === "choice" || step.type === "quiz" || step.type === "task" || step.type === "summary";
  const compact = !expanded && !forceExpanded;

  useEffect(() => {
    setExpanded(false);
  }, [currentChapterId, currentStepId]);

  const selectChoice = (choice: Choice) => {
    if (choice.scenePreset) {
      applyScenePreset(choice.scenePreset);
    }
    if (choice.actions) {
      runSceneActions(choice.actions);
    }
    setChoiceFeedback(choice.id, choice.feedback ?? null);
    if (choice.nextStepId) {
      useScenarioStore.getState().goToStep(choice.nextStepId);
    }
  };

  return (
    <footer className={`novel-box lesson-dialog scenario-player ${expanded || forceExpanded ? "expanded" : "compact"}`} aria-label="解説">
      <div className="guide-avatar" aria-hidden="true">
        <span>光</span>
      </div>

      <DialogueBox step={step} compact={compact}>
        {step.type === "summary" ? <ChapterSummary step={step} /> : null}
        {step.choices?.length ? <ChoicePanel choices={step.choices} selectedChoiceId={selectedChoiceId} onSelect={selectChoice} /> : null}
        {choiceFeedback ? <p className={selectedChoice?.isCorrect === false ? "choice-feedback error" : "choice-feedback"}>{choiceFeedback}</p> : null}
        {step.type === "task" ? (
          <TaskHint
            requiredAction={step.requiredAction}
            completed={taskCompleted}
            successText={step.successText}
            focusMessage={step.focusMessage}
          />
        ) : null}
      </DialogueBox>

      <div className="dialogue-actions scenario-actions" aria-label="レッスン操作">
        <span className="scenario-progress">
          <BookOpen size={15} aria-hidden="true" />
          {progressText}
        </span>
        {!forceExpanded ? (
          <button className="secondary-action detail-toggle" onClick={() => setExpanded((value) => !value)} type="button">
            {expanded ? "短く表示" : "詳しく読む"}
          </button>
        ) : null}
        <button onClick={previousStep} type="button" disabled={stepIndex === 0 && chapter.order === 1}>
          <ChevronLeft size={16} aria-hidden="true" />
          前へ
        </button>
        <button className="secondary-action" onClick={toggleLearningMode} type="button">
          {learningMode === "guided" ? <FlaskConical size={16} aria-hidden="true" /> : <Compass size={16} aria-hidden="true" />}
          {learningMode === "guided" ? "自由に試す" : "学習へ戻る"}
        </button>
        <button className="secondary-action" onClick={openMap} type="button">
          <Map size={16} aria-hidden="true" />
          学習マップ
        </button>
        <button onClick={nextStep} type="button" disabled={disableNext}>
          {step.type === "summary" ? "次の章へ" : "次へ"}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
