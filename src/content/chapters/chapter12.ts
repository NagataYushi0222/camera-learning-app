import type { Chapter } from "../lessonTypes";

export const chapter12: Chapter = {
  id: "chapter-12",
  order: 12,
  title: "目とカメラは同じ原理で動いている",
  description: "角膜・水晶体・虹彩・網膜をカメラのレンズ・絞り・センサーと対応づける。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第12章",
  steps: [
    {
      id: "c12-correspondence",
      type: "narration",
      title: "目とカメラの対応",
      speaker: "ガイド",
      text: [
        "カメラのレンズは、目では角膜・水晶体に対応します。絞りは虹彩、センサーは網膜に対応します。",
        "実際の目では、水晶体だけでなく角膜も大きく屈折に関わるため、ここでは角膜と水晶体をまとめて目のレンズ系として扱います。",
      ],
      scenePreset: { mode: "lens", cameraShot: "eyeModel", showRays: true, rayDisplayMode: "representative" },
      glossaryTerms: ["角膜", "水晶体", "虹彩", "網膜"],
    },
    {
      id: "c12-retina-only",
      type: "choice",
      title: "レンズ系を消すと？",
      speaker: "ガイド",
      text: ["レンズ系を消して、網膜だけにしたらどう見えるでしょうか。"],
      choices: [
        { id: "remove-lens", label: "レンズ系を消す", feedback: "網膜だけでは光が混ざり、像は成立しにくくなります。", actions: [{ type: "setMode", mode: "no-lens" }, { type: "setRayDisplayMode", rayDisplayMode: "contributors" }] },
      ],
      scenePreset: { mode: "lens", cameraShot: "sideAligned" },
    },
    {
      id: "c12-click",
      type: "task",
      title: "網膜上の1点を調べる",
      speaker: "ガイド",
      text: ["右側のセンサーをクリックして、レンズなしでは1ピクセルに光が混ざることを確認しましょう。"],
      requiredAction: { type: "selectPixel" },
      successText: "目もカメラも、光を受け取るだけではなく位置関係を対応づける仕組みが必要です。",
      scenePreset: { mode: "no-lens", cameraShot: "sensorCloseup", showRays: true, rayDisplayMode: "contributors" },
    },
    {
      id: "c12-restore",
      type: "choice",
      title: "レンズ系を戻す",
      speaker: "ガイド",
      text: ["レンズ系を戻すと、光は網膜上の対応する点へ整理されます。"],
      choices: [
        { id: "restore-lens", label: "レンズ系を戻す", feedback: "像が戻りました。目とカメラの原理がつながります。", actions: [{ type: "setMode", mode: "lens" }, { type: "setRayDisplayMode", rayDisplayMode: "source-bundle" }] },
      ],
    },
    {
      id: "c12-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["目とカメラに共通する本質は？"],
      choices: [
        { id: "a", label: "空間の位置関係を網膜やセンサー上に対応づけること", isCorrect: true, feedback: "正解です。" },
        { id: "b", label: "すべての光を混ぜること", isCorrect: false, feedback: "混ざると像は失われます。" },
        { id: "c", label: "レンズを消すこと", isCorrect: false, feedback: "レンズ系は対応関係を作る重要な部分です。" },
      ],
    },
    {
      id: "c12-summary",
      type: "summary",
      title: "第12章まとめ",
      speaker: "ガイド",
      text: ["目とカメラは、同じ原理で像を作っています。"],
      summaryItems: ["角膜・水晶体は目のレンズ系として働く", "虹彩は絞り、網膜はセンサーに対応する", "目もカメラも空間の位置関係を受光面上に対応づける"],
      nextChapterPreview: "これで基礎編は完了です。学習マップから各章を復習できます。",
    },
  ],
};
