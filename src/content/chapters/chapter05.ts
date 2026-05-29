import type { Chapter } from "../lessonTypes";

export const chapter05: Chapter = {
  id: "chapter-05",
  order: 5,
  title: "見えるとは、位置関係が保たれること",
  description: "像とは、現実世界の位置関係がスクリーン上の色と明るさの配置として写ることだと理解する。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第5章",
  steps: [
    {
      id: "c05-correspondence",
      type: "narration",
      title: "像は対応関係でできている",
      speaker: "ガイド",
      text: ["像とは、現実世界の位置関係が、スクリーン上の明るさや色の配置として写し取られたものです。"],
      scenePreset: { mode: "lens", cameraShot: "overview", showRays: false, lightEnabled: true },
      glossaryTerms: ["対応関係", "像"],
    },
    {
      id: "c05-click-a",
      type: "task",
      title: "1つ目のピクセルを調べる",
      speaker: "ガイド",
      text: ["右側のセンサー上の1点をクリックして、どの物体点の光が集まっているか見てみましょう。"],
      requiredAction: { type: "selectPixel" },
      successText: "スクリーン上の場所ごとに、対応する物体上の場所があります。",
      scenePreset: { mode: "lens", rayDisplayMode: "source-bundle", showRays: true, cameraShot: "sensorCloseup" },
    },
    {
      id: "c05-lens-comparison",
      type: "choice",
      title: "対応が保たれない場合",
      speaker: "ガイド",
      text: ["レンズを外すと、その対応関係はどうなるでしょうか。"],
      choices: [
        { id: "remove-lens", label: "レンズなしにする", feedback: "対応関係が崩れ、光が混ざった状態になります。", actions: [{ type: "setMode", mode: "no-lens" }, { type: "setRayDisplayMode", rayDisplayMode: "contributors" }] },
      ],
    },
    {
      id: "c05-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["像として見えるために必要なことは？"],
      choices: [
        { id: "a", label: "スクリーンにとにかく光が届くこと", isCorrect: false, feedback: "光だけでは形になりません。" },
        { id: "b", label: "物体上の点とスクリーン上の点が対応すること", isCorrect: true, feedback: "正解です。位置関係が保たれることが像の本質です。" },
        { id: "c", label: "光源を大きくすること", isCorrect: false, feedback: "明るさだけでは対応関係は作れません。" },
      ],
    },
    {
      id: "c05-summary",
      type: "summary",
      title: "第5章まとめ",
      speaker: "ガイド",
      text: ["見えるとは、位置関係が保たれることです。"],
      summaryItems: ["像は現実世界の位置関係が写し取られたもの", "スクリーン上の場所ごとに光の出どころが分かれている必要がある", "混ざると形は失われる"],
      nextChapterPreview: "次は、ピンホールがどうやって対応関係を作るかを見ます。",
    },
  ],
};
