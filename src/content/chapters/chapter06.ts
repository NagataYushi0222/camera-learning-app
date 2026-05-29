import type { Chapter } from "../lessonTypes";

export const chapter06: Chapter = {
  id: "chapter-06",
  order: 6,
  title: "ピンホールは光を制限して像を作る",
  description: "ピンホールは光を曲げず、通れる光を制限することで暗い反転像を作る。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第6章",
  steps: [
    {
      id: "c06-pinhole",
      type: "cinematic",
      title: "小さな穴を置く",
      speaker: "ガイド",
      text: ["りんごとスクリーンの間にピンホール板を置きます。通れる光だけがスクリーンへ届きます。"],
      scenePreset: { mode: "pinhole", cameraShot: "pinholeCloseup", lightEnabled: true, showRays: true, rayDisplayMode: "representative" },
    },
    {
      id: "c06-click",
      type: "task",
      title: "穴を通った光を見る",
      speaker: "ガイド",
      text: ["右側のスクリーンをクリックして、このピクセルへ届く光がピンホールで限定されていることを確認しましょう。"],
      requiredAction: { type: "selectPixel" },
      successText: "ピンホールは光を曲げず、通れる方向を選ぶことで位置対応を作ります。",
      scenePreset: { mode: "pinhole", cameraShot: "pinholeCloseup", showRays: true, rayDisplayMode: "contributors" },
    },
    {
      id: "c06-hole-size",
      type: "choice",
      title: "穴の大きさを変える",
      speaker: "ガイド",
      text: ["ピンホール半径を少し大きくして、明るさとボケがどう変わるか見てください。"],
      choices: [
        {
          id: "wide-pinhole",
          label: "穴を大きくする",
          feedback: "穴を大きくすると明るくなりますが、1ピクセルに届く方向も広がり、ボケやすくなります。",
          scenePreset: { mode: "pinhole", pinholeRadius: 0.13, showRays: true, rayDisplayMode: "contributors" },
        },
        {
          id: "small-pinhole",
          label: "穴を小さく戻す",
          feedback: "穴を小さくすると暗くなりますが、位置対応は保たれやすくなります。",
          scenePreset: { mode: "pinhole", pinholeRadius: 0.04, showRays: true, rayDisplayMode: "contributors" },
        },
      ],
      scenePreset: { mode: "pinhole", pinholeRadius: 0.055, cameraShot: "sensorCloseup" },
    },
    {
      id: "c06-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["ピンホールが像を作る主な理由は？"],
      choices: [
        { id: "a", label: "光を強く曲げるから", isCorrect: false, feedback: "ピンホールは光を曲げません。" },
        { id: "b", label: "通れる光を制限して位置対応を作るから", isCorrect: true, feedback: "正解です。" },
        { id: "c", label: "スクリーンを明るくするから", isCorrect: false, feedback: "むしろ暗くなります。" },
      ],
    },
    {
      id: "c06-summary",
      type: "summary",
      title: "第6章まとめ",
      speaker: "ガイド",
      text: ["ピンホールは、通れる光を制限して像を作ります。"],
      summaryItems: ["ピンホールは光を曲げない", "余計な方向の光を遮る", "穴が大きいと明るいがボケやすい"],
      nextChapterPreview: "次は、レンズが光の波面を曲げて整理する様子を見ます。",
    },
  ],
};
