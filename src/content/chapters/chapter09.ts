import type { Chapter } from "../lessonTypes";

export const chapter09: Chapter = {
  id: "chapter-09",
  order: 9,
  title: "ピントが合うとは何か",
  description: "物体の1点から来た光がセンサー上の1点に集まることがピントだと理解する。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第9章",
  steps: [
    {
      id: "c09-ideal-plane",
      type: "cinematic",
      title: "理想像面を見る",
      speaker: "ガイド",
      text: ["レンズには、物体点から来た光が集まる理想像面があります。スクリーンがそこに近いほど像はシャープになります。"],
      scenePreset: { mode: "lens", cameraShot: "sideAligned", showRays: true, rayDisplayMode: "source-bundle" },
    },
    {
      id: "c09-defocus",
      type: "narration",
      title: "スクリーンがずれるとボケる",
      speaker: "ガイド",
      text: ["スクリーン位置が理想像面からずれると、同じ物体点からの光がセンサー上で広がります。これがボケです。"],
      scenePreset: { mode: "out-of-focus", sensorX: 2.35, apertureRadius: 0.56, cameraShot: "sideAligned", rayDisplayMode: "source-bundle", showRays: true },
    },
    {
      id: "c09-focus-task",
      type: "task",
      title: "ピントを合わせる",
      speaker: "ガイド",
      text: ["スクリーン距離を動かして、ピント誤差が小さくなる位置を探してみましょう。"],
      requiredAction: { type: "focusAdjust", tolerance: 0.12 },
      successText: "ピント誤差が小さくなりました。物体点の光がセンサー上の狭い範囲に集まります。",
      scenePreset: { mode: "lens", sensorX: 2.35, cameraShot: "sensorCloseup", showRays: true, rayDisplayMode: "source-bundle" },
      focusMessage: "右パネルのスクリーン距離を動かしてください。",
    },
    {
      id: "c09-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["ピントが合っている状態とは？"],
      choices: [
        { id: "a", label: "物体の1点から来た光がセンサー上の1点に集まること", isCorrect: true, feedback: "正解です。" },
        { id: "b", label: "スクリーンをできるだけ遠くすること", isCorrect: false, feedback: "距離そのものではなく、理想像面との一致が大切です。" },
        { id: "c", label: "光源を消すこと", isCorrect: false, feedback: "光源を消すと像も消えます。" },
      ],
    },
    {
      id: "c09-summary",
      type: "summary",
      title: "第9章まとめ",
      speaker: "ガイド",
      text: ["ピントとは、点が点として写ることです。"],
      summaryItems: ["理想像面にスクリーンが近いとシャープ", "ずれると物体点がセンサー上で広がる", "ボケは点が広がる現象"],
      nextChapterPreview: "次は、絞りとボケの関係を見ます。",
    },
  ],
};
