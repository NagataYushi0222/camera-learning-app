import { BookOpen, HelpCircle, Map, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { hasProgress, loadProgress } from "../save/saveProgress";
import { useScenarioStore } from "../../state/useScenarioStore";

export function LandingPage() {
  const [showHelp, setShowHelp] = useState(false);
  const startNew = useScenarioStore((state) => state.startNew);
  const continueFromSave = useScenarioStore((state) => state.continueFromSave);
  const openMap = useScenarioStore((state) => state.openMap);
  const saved = useMemo(() => hasProgress(), []);
  const save = useMemo(() => loadProgress(), []);

  return (
    <main className="landing-page">
      <section className="landing-hero" aria-label="開始画面">
        <div className="landing-copy">
          <p className="eyebrow">Camera / Eye Optics</p>
          <h1>見えるとは何か？</h1>
          <h2>カメラと目の仕組みを学ぶ</h2>
          <p>光・レンズ・像の成り立ちを、3Dで体験的に理解する学習アプリです。</p>
          {saved && save ? <span className="save-chip">保存あり: {new Date(save.lastUpdatedAt).toLocaleString()}</span> : null}
        </div>

        <div className="landing-actions" aria-label="開始操作">
          <button className="primary-start" type="button" onClick={startNew}>
            {saved ? <RotateCcw size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {saved ? "最初から" : "はじめる"}
          </button>
          <button type="button" onClick={continueFromSave} disabled={!saved}>
            <BookOpen size={18} aria-hidden="true" />
            つづきから
          </button>
          <button type="button" onClick={openMap}>
            <Map size={18} aria-hidden="true" />
            章を選ぶ
          </button>
          <button type="button" onClick={() => setShowHelp((value) => !value)}>
            <HelpCircle size={18} aria-hidden="true" />
            使い方
          </button>
        </div>

        <div className="landing-preview" aria-hidden="true">
          <div className="preview-scene">
            <span className="preview-light" />
            <span className="preview-object" />
            <span className="preview-lens" />
            <span className="preview-sensor" />
            <span className="preview-ray one" />
            <span className="preview-ray two" />
            <span className="preview-ray three" />
          </div>
          <div className="preview-caption">左で仕組みを見て、右で結果を調べる</div>
        </div>

        {showHelp ? (
          <div className="landing-help">
            <strong>使い方</strong>
            <p>左側の3Dビューで光源・物体・レンズ・スクリーンの位置関係を見ます。</p>
            <p>右側のスクリーン / センサーをクリックすると、その1ピクセルに届いた光を左側で確認できます。</p>
            <p>学習中はガイドに沿って進み、自由に試すボタンから全パラメータを操作できます。</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
