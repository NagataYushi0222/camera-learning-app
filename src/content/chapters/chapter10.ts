import type { Chapter } from "../lessonTypes";

export const chapter10: Chapter = {
  id: "chapter-10",
  order: 10,
  title: "絞りとボケ",
  description: "絞りが明るさとボケ量、1ピクセルに届く光束の太さを変えることを学ぶ。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第10章",
  steps: [
    {
      id: "c10-aperture",
      type: "cinematic",
      title: "絞りを開く",
      speaker: "ガイド",
      text: ["絞りを開くと、多くの光がレンズを通ります。明るくなりますが、ピントずれ時のボケも大きくなります。"],
      scenePreset: { mode: "out-of-focus", apertureRadius: 0.78, sensorX: 2.45, cameraShot: "lensCloseup", showRays: true, rayDisplayMode: "source-bundle" },
    },
    {
      id: "c10-bundle-width",
      type: "narration",
      title: "同じ点から来る光束の太さ",
      speaker: "ガイド",
      text: [
        "絞りは、同じ物体点から来る光束の太さを変えます。",
        "ピントが少し外れているとき、光束が太いほどセンサー上で広がり、ボケとして見えやすくなります。",
      ],
      scenePreset: {
        mode: "out-of-focus",
        apertureRadius: 0.72,
        sensorX: 2.45,
        cameraShot: "sensorCloseup",
        showRays: true,
        rayDisplayMode: "source-bundle",
      },
      glossaryTerms: ["絞り", "光束", "ボケ"],
    },
    {
      id: "c10-change-task",
      type: "task",
      title: "絞りを変える",
      speaker: "ガイド",
      text: ["レンズ口径を小さくして、ボケと明るさの変化を比べてみましょう。"],
      requiredAction: { type: "changeAperture", max: 0.28 },
      successText: "絞ると暗くなりますが、ピントずれ時の広がりは小さくなります。",
      scenePreset: { mode: "out-of-focus", apertureRadius: 0.78, sensorX: 2.45, cameraShot: "sensorCloseup" },
    },
    {
      id: "c10-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["絞りを開いたときに起きやすいことは？"],
      choices: [
        { id: "a", label: "明るいがボケが大きくなりやすい", isCorrect: true, feedback: "正解です。通る光束が太くなります。" },
        { id: "b", label: "必ず暗くなる", isCorrect: false, feedback: "開くと通る光は増えます。" },
        { id: "c", label: "レンズがなくなる", isCorrect: false, feedback: "絞りは開口の大きさです。" },
      ],
    },
    {
      id: "c10-summary",
      type: "summary",
      title: "第10章まとめ",
      speaker: "ガイド",
      text: ["絞りは明るさだけでなく、ボケにも関係します。"],
      summaryItems: ["開くと明るいがボケやすい", "絞ると暗いがボケにくい", "絞りは1ピクセルに届く光束の太さを変える"],
      nextChapterPreview: "次は、焦点距離と画角を見ます。",
    },
  ],
};
