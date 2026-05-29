import type { Chapter } from "../lessonTypes";

export const chapter11: Chapter = {
  id: "chapter-11",
  order: 11,
  title: "焦点距離と画角",
  description: "焦点距離が変わると、像の大きさ、写る範囲、ピント位置が変わることを学ぶ。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第11章",
  steps: [
    {
      id: "c11-focal",
      type: "cinematic",
      title: "焦点距離を変える",
      speaker: "ガイド",
      text: ["焦点距離が変わると、像の大きさや写る範囲、ピント位置が変わります。"],
      scenePreset: { mode: "lens", focalLength: 1.2, cameraShot: "sideAligned", showRays: true, rayDisplayMode: "representative" },
    },
    {
      id: "c11-angle",
      type: "narration",
      title: "画角と像の大きさ",
      speaker: "ガイド",
      text: [
        "焦点距離が短いと、広い範囲を小さく写しやすくなります。",
        "焦点距離が長いと、写る範囲は狭くなりますが、同じ物体が大きく写ります。",
      ],
      scenePreset: {
        mode: "lens",
        focalLength: 1.2,
        cameraShot: "overview",
        showRays: true,
        rayDisplayMode: "representative",
        sensorDisplayMode: "learning",
      },
      glossaryTerms: ["焦点距離", "画角"],
    },
    {
      id: "c11-change-task",
      type: "task",
      title: "焦点距離を長くする",
      speaker: "ガイド",
      text: ["焦点距離を長くして、センサー像と理想像距離がどう変わるか見てみましょう。"],
      requiredAction: { type: "changeFocalLength", min: 1.75 },
      successText: "焦点距離が変わると、理想像面の位置も変わります。",
      scenePreset: { mode: "lens", focalLength: 1.2, cameraShot: "sensorCloseup" },
    },
    {
      id: "c11-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["焦点距離を変えると何が変わりますか？"],
      choices: [
        { id: "a", label: "画角や像の大きさ、ピント位置", isCorrect: true, feedback: "正解です。" },
        { id: "b", label: "りんごの実物の大きさ", isCorrect: false, feedback: "物体そのものは変わりません。" },
        { id: "c", label: "光源が消える", isCorrect: false, feedback: "焦点距離と光源ON/OFFは別です。" },
      ],
    },
    {
      id: "c11-summary",
      type: "summary",
      title: "第11章まとめ",
      speaker: "ガイド",
      text: ["焦点距離は、写る範囲と像の大きさに関係します。"],
      summaryItems: ["短い焦点距離は広い範囲を写す", "長い焦点距離は狭い範囲を大きく写す", "焦点距離が変わると理想像面も変わる"],
      nextChapterPreview: "最後に、目とカメラの共通原理につなげます。",
    },
  ],
};
