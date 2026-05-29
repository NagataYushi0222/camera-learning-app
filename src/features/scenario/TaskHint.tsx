import type { RequiredAction } from "../../content/lessonTypes";

function actionLabel(requiredAction: RequiredAction): string {
  switch (requiredAction.type) {
    case "selectPixel":
      return "右側のスクリーン / センサーをクリックしてください。";
    case "toggleLightOff":
      return "光源をOFFにしてください。";
    case "toggleLightOn":
      return "光源をONにしてください。";
    case "switchMode":
      return `${requiredAction.mode} モードに切り替えてください。`;
    case "focusAdjust":
      return "スクリーン距離を動かして、ピント誤差を小さくしてください。";
    case "changeAperture":
      return "レンズ口径を指定範囲まで動かしてください。";
    case "changeFocalLength":
      return "焦点距離を指定範囲まで動かしてください。";
    case "clickObjectPoint":
      return "指定された物体点を選んでください。";
    default:
      return "画面の指示に沿って操作してください。";
  }
}

export function TaskHint({
  requiredAction,
  completed,
  successText,
  focusMessage,
}: {
  requiredAction: RequiredAction;
  completed: boolean;
  successText?: string;
  focusMessage?: string;
}) {
  return (
    <div className={completed ? "task-hint complete" : "task-hint"} role="status">
      <strong>{completed ? "達成しました" : "操作課題"}</strong>
      <span>{completed ? (successText ?? "次へ進めます。") : (focusMessage ?? actionLabel(requiredAction))}</span>
    </div>
  );
}
