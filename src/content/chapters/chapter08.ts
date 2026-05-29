import type { Chapter } from "../lessonTypes";

export const chapter08: Chapter = {
  id: "chapter-08",
  order: 8,
  title: "なぜ像は反転するのか",
  description: "像は上下左右が反転しても、位置関係は保たれていることを理解する。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第8章",
  steps: [
    {
      id: "c08-inversion",
      type: "cinematic",
      title: "反転しても対応している",
      speaker: "ガイド",
      text: ["レンズでできる像は上下左右が反転します。それでも、スクリーン上の各位置は物体上の位置に対応しています。"],
      scenePreset: { mode: "lens", cameraShot: "sensorCloseup", showRays: true, rayDisplayMode: "representative" },
    },
    {
      id: "c08-click",
      type: "task",
      title: "対応点をクリックで確かめる",
      speaker: "ガイド",
      text: ["センサー上の点をクリックし、反転した像のどこが物体のどの方向に対応しているか確認しましょう。"],
      requiredAction: { type: "selectPixel" },
      successText: "反転していても、ピクセルと物体点の対応は保たれています。",
      scenePreset: { mode: "lens", rayDisplayMode: "source-bundle", showRays: true },
    },
    {
      id: "c08-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["像が反転しても像として成立する理由は？"],
      choices: [
        { id: "a", label: "色が変わらないから", isCorrect: false, feedback: "色だけではありません。" },
        { id: "b", label: "スクリーン上の各位置が物体上の各位置に対応しているから", isCorrect: true, feedback: "正解です。反転していても対応関係が保たれています。" },
        { id: "c", label: "光が消えるから", isCorrect: false, feedback: "光は消えていません。" },
      ],
    },
    {
      id: "c08-summary",
      type: "summary",
      title: "第8章まとめ",
      speaker: "ガイド",
      text: ["反転は、対応関係が失われることではありません。"],
      summaryItems: ["レンズ像は反転する", "反転しても位置関係は保たれる", "だから像として成立する"],
      nextChapterPreview: "次は、ピントが合うとは何かを学びます。",
    },
  ],
};
