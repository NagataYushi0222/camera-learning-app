import { CheckCircle2, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { chapters } from "../../content/chapters";
import { useScenarioStore } from "../../state/useScenarioStore";

export function LearningMap() {
  const currentChapterId = useScenarioStore((state) => state.currentChapterId);
  const completedChapterIds = useScenarioStore((state) => state.completedChapterIds);
  const unlockedChapterIds = useScenarioStore((state) => state.unlockedChapterIds);
  const startChapter = useScenarioStore((state) => state.startChapter);
  const setScreen = useScenarioStore((state) => state.setScreen);

  return (
    <main className="learning-map-page">
      <header className="map-header">
        <div>
          <p className="eyebrow">Learning Map</p>
          <h1>章を選ぶ</h1>
          <p>解放済みの章を選んで、光と像の仕組みを順番に学びます。</p>
        </div>
        <button type="button" onClick={() => setScreen("landing")}>
          <RotateCcw size={17} aria-hidden="true" />
          トップへ
        </button>
      </header>

      <section className="chapter-grid" aria-label="章一覧">
        {chapters.map((chapter) => {
          const unlocked = unlockedChapterIds.includes(chapter.id);
          const completed = completedChapterIds.includes(chapter.id);
          const current = chapter.id === currentChapterId;

          return (
            <article className={unlocked ? "chapter-card" : "chapter-card locked"} key={chapter.id}>
              <div className="chapter-card-header">
                <span>{chapter.order}</span>
                {completed ? (
                  <CheckCircle2 size={18} aria-label="完了済み" />
                ) : unlocked ? (
                  <PlayCircle size={18} aria-label={current ? "学習中" : "解放済み"} />
                ) : (
                  <Lock size={18} aria-label="未解放" />
                )}
              </div>
              <h2>{chapter.title}</h2>
              <p>{chapter.description}</p>
              <div className="chapter-state">
                {completed ? "完了済み" : current ? "学習中" : unlocked ? "解放済み" : "ロック中"}
              </div>
              <button type="button" disabled={!unlocked} onClick={() => startChapter(chapter.id)}>
                {completed ? "復習する" : current ? "再開する" : "開始する"}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}
