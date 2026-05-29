import type { Chapter } from "../lessonTypes";

export const chapter07: Chapter = {
  id: "chapter-07",
  order: 7,
  title: "レンズは光の波面を曲げて整理する",
  description: "同じ物体点から広がった光を、レンズが対応する像点へ集めることを学ぶ。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第7章",
  steps: [
    {
      id: "c07-lens",
      type: "cinematic",
      title: "レンズを置く",
      speaker: "ガイド",
      text: ["ピンホール板を外してレンズを置きます。レンズは光の波面を曲げ、対応する像点へ集めます。"],
      scenePreset: { mode: "lens", cameraShot: "lensCloseup", lightEnabled: true, showRays: true, rayDisplayMode: "representative" },
    },
    {
      id: "c07-click",
      type: "task",
      title: "物体点の光束を見る",
      speaker: "ガイド",
      text: ["右側のセンサーをクリックして、対応する物体点からの光束を表示しましょう。"],
      requiredAction: { type: "selectPixel" },
      successText: "同じ物体点から出た光が、レンズを通って理想像点へ集まります。",
      scenePreset: { mode: "lens", cameraShot: "lensCloseup", showRays: true, rayDisplayMode: "source-bundle" },
    },
    {
      id: "c07-message",
      type: "narration",
      title: "ただ集めるだけではない",
      speaker: "ガイド",
      text: ["レンズは光をただ集める道具ではありません。物体の各点から出た光を、スクリーン上の対応する各点へ整理する道具です。"],
      scenePreset: { mode: "lens", cameraShot: "sideAligned", rayDisplayMode: "source-bundle", showRays: true },
    },
    {
      id: "c07-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["レンズの重要な働きは？"],
      choices: [
        { id: "a", label: "物体の各点の光を対応する像点へ集める", isCorrect: true, feedback: "正解です。対応関係を整理することが大切です。" },
        { id: "b", label: "画面を赤くする", isCorrect: false, feedback: "色ではありません。" },
        { id: "c", label: "光を止める", isCorrect: false, feedback: "光を止めるのではなく曲げます。" },
      ],
    },
    {
      id: "c07-summary",
      type: "summary",
      title: "第7章まとめ",
      speaker: "ガイド",
      text: ["レンズは物体点からの光を対応する像点へ整理します。"],
      summaryItems: ["同じ物体点から出た光がレンズで曲がる", "理想像点に集まる", "明るくはっきりした像ができる"],
      nextChapterPreview: "次は、像が反転する理由を見ます。",
    },
  ],
};
