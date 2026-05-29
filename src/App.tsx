import { SceneView } from "./components/SceneView";
import { SensorPanel } from "./components/SensorPanel";
import { TopBar } from "./components/TopBar";
import { SceneDirector } from "./features/cinematic/SceneDirector";
import { LandingPage } from "./features/landing/LandingPage";
import { LearningMap } from "./features/learning-map/LearningMap";
import { ScenarioPlayer } from "./features/scenario/ScenarioPlayer";
import { useScenarioStore } from "./state/useScenarioStore";

export default function App() {
  const screen = useScenarioStore((state) => state.screen);
  const learningMode = useScenarioStore((state) => state.learningMode);
  const highlightedUI = useScenarioStore((state) => state.highlightedUI);

  if (screen === "landing") {
    return <LandingPage />;
  }

  if (screen === "map") {
    return <LearningMap />;
  }

  return (
    <div className={`app-shell ${learningMode === "guided" ? "guided-mode" : "explore-mode"}`}>
      <SceneDirector />
      <TopBar />
      <main className="workspace main-workspace" aria-label="学習シミュレーション">
        <section className={highlightedUI === "sceneView" ? "view-pane view-pane-3d ui-highlight" : "view-pane view-pane-3d"} aria-label="3Dビュー">
          <SceneView />
        </section>
        <aside className={highlightedUI === "sensorPanel" ? "view-pane sensor-pane right-inspector ui-highlight" : "view-pane sensor-pane right-inspector"} aria-label="スクリーン表示">
          <SensorPanel />
        </aside>
      </main>
      <ScenarioPlayer />
    </div>
  );
}
