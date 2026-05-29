import type { Chapter } from "../lessonTypes";

export const chapter02: Chapter = {
  id: "chapter-02",
  order: 2,
  title: "なぜ暗闇では物が見えないのか",
  description: "物体は自分で光っているのではなく、光を反射することで見えると理解する。",
  sourceNote: "docs/content/02_CORE_EXPLANATION.md 第2章",
  steps: [
    {
      id: "c02-dark-room",
      type: "cinematic",
      title: "りんごはある。でも見えない",
      speaker: "ガイド",
      text: [
        "暗い空間にりんごを置きます。",
        "りんごはそこにあります。でも、暗闇ではスクリーンにほとんど何も写りません。",
      ],
      scenePreset: {
        mode: "lens",
        cameraShot: "overview",
        lightEnabled: false,
        showRays: false,
        showWavefronts: false,
      },
      focusMessage: "右側のセンサー画像が暗くなることを確認しましょう。",
    },
    {
      id: "c02-why-question",
      type: "choice",
      title: "なぜ見えない？",
      speaker: "ガイド",
      text: ["りんごはそこにあるのに、なぜ見えないのでしょうか。"],
      choices: [
        { id: "a", label: "りんごが小さすぎるから", isCorrect: false, feedback: "大きさではありません。光が届いていないことが問題です。" },
        { id: "b", label: "りんごが光を反射していないから", isCorrect: true, feedback: "その通りです。多くの物体は光を反射して見えます。" },
        { id: "c", label: "スクリーンが遠すぎるから", isCorrect: false, feedback: "距離よりも、そもそも光がないことが原因です。" },
      ],
      scenePreset: {
        mode: "lens",
        lightEnabled: false,
        cameraShot: "objectAndLight",
      },
    },
    {
      id: "c02-light-on-task",
      type: "task",
      title: "ライトをつけてみる",
      speaker: "ガイド",
      text: [
        "多くの物体は、自分で光っているわけではありません。",
        "光源から来た光を反射することで、私たちは物を見ることができます。ライトをつけてみましょう。",
      ],
      scenePreset: {
        mode: "lens",
        lightEnabled: false,
        cameraShot: "objectAndLight",
      },
      actions: [{ type: "highlightObject", target: "lightSource" }],
      requiredAction: { type: "toggleLightOn" },
      successText: "光源から光が出ると、りんごとスクリーンに明るさが戻ります。",
      focusMessage: "右パネルの光源ON/OFFを押すか、次の選択肢でライトをつけます。",
      choices: [
        {
          id: "light-on",
          label: "ライトをつける",
          actions: [
            { type: "fadeLight", enabled: true, durationMs: 500 },
            { type: "setWavefrontsVisible", visible: true },
            { type: "setRaysVisible", visible: true },
          ],
          feedback: "光源から光が広がり、りんごに当たります。",
        },
      ],
    },
    {
      id: "c02-wavefront",
      type: "cinematic",
      title: "光源から光が広がる",
      speaker: "ガイド",
      text: [
        "ライトをつけると、光源から光の波が広がります。",
        "光はりんごに当たり、一部は吸収され、一部は反射します。",
      ],
      scenePreset: {
        mode: "lens",
        lightEnabled: true,
        cameraShot: "objectAndLight",
        showWavefronts: true,
        showRays: true,
        rayDisplayMode: "representative",
      },
      glossaryTerms: ["波面", "反射", "吸収"],
    },
    {
      id: "c02-reflection",
      type: "narration",
      title: "見えるとは反射光を受け取ること",
      speaker: "ガイド",
      text: [
        "りんごが見えるのは、りんごそのものがライトのように光っているからではありません。",
        "光源から来た光がりんごで反射し、その反射光がスクリーンや目に届くからです。",
      ],
      scenePreset: {
        mode: "lens",
        lightEnabled: true,
        cameraShot: "sideAligned",
        showRays: true,
        showWavefronts: true,
      },
    },
    {
      id: "c02-dark-task",
      type: "task",
      title: "もう一度暗くする",
      speaker: "ガイド",
      text: [
        "もう一度ライトを消して、光源がないとセンサー像も消えることを確認しましょう。",
      ],
      requiredAction: { type: "toggleLightOff" },
      successText: "光がなくなると、りんごがそこにあってもセンサーは暗くなります。",
      choices: [
        {
          id: "light-off",
          label: "ライトを消す",
          actions: [
            { type: "fadeLight", enabled: false, durationMs: 400 },
            { type: "setRaysVisible", visible: false },
            { type: "setWavefrontsVisible", visible: false },
          ],
        },
      ],
      scenePreset: {
        mode: "lens",
        lightEnabled: true,
        cameraShot: "overview",
      },
    },
    {
      id: "c02-quiz",
      type: "quiz",
      title: "理解チェック",
      speaker: "ガイド",
      text: ["暗闇で多くの物体が見えない一番の理由はどれでしょう？"],
      choices: [
        { id: "a", label: "物体が光を反射するための光源がないから", isCorrect: true, feedback: "正解です。物体を見るには、反射される光が必要です。" },
        { id: "b", label: "レンズが必ず必要だから", isCorrect: false, feedback: "レンズは像を作る助けになりますが、まず光が必要です。" },
        { id: "c", label: "赤い物体は暗闇で消えるから", isCorrect: false, feedback: "色に関係なく、光がなければ反射光が届きません。" },
      ],
    },
    {
      id: "c02-summary",
      type: "summary",
      title: "第2章まとめ",
      speaker: "ガイド",
      text: ["この章では、物が見えるために光が必要な理由を確認しました。"],
      summaryItems: [
        "多くの物体は自分で光っていない",
        "光源から来た光を物体が反射することで見える",
        "ライトが消えると、物体が存在していてもセンサーにはほとんど何も写らない",
      ],
      glossaryTerms: ["光源", "反射光", "暗闇"],
      nextChapterPreview: "次は、物体の1点から光がどのように広がるかを見ます。",
    },
  ],
};
