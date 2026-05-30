import { SceneView } from "./components/SceneView";
import { SensorPanel } from "./components/SensorPanel";
import { TopBar } from "./components/TopBar";
import { Box, MessageSquareText, SlidersHorizontal, View } from "lucide-react";
import { useState } from "react";
import { SceneDirector } from "./features/cinematic/SceneDirector";
import { LandingPage } from "./features/landing/LandingPage";
import { LearningMap } from "./features/learning-map/LearningMap";
import { ScenarioPlayer } from "./features/scenario/ScenarioPlayer";
import { useScenarioStore } from "./state/useScenarioStore";

type MobileWorkspaceTab = "scene" | "sensor" | "controls" | "lesson";

const mobileTabs: Array<{ id: MobileWorkspaceTab; label: string; icon: JSX.Element }> = [
  { id: "scene", label: "3D", icon: <Box size={16} aria-hidden="true" /> },
  { id: "sensor", label: "センサー", icon: <View size={16} aria-hidden="true" /> },
  { id: "controls", label: "操作", icon: <SlidersHorizontal size={16} aria-hidden="true" /> },
  { id: "lesson", label: "解説", icon: <MessageSquareText size={16} aria-hidden="true" /> },
];

export default function App() {
  const screen = useScenarioStore((state) => state.screen);
  const learningMode = useScenarioStore((state) => state.learningMode);
  const highlightedUI = useScenarioStore((state) => state.highlightedUI);
  const [mobileTab, setMobileTab] = useState<MobileWorkspaceTab>("scene");

  if (screen === "landing") {
    return <LandingPage />;
  }

  if (screen === "map") {
    return <LearningMap />;
  }

  return (
    <div className={`app-shell ${learningMode === "guided" ? "guided-mode" : "explore-mode"} mobile-tab-${mobileTab}`}>
      <SceneDirector />
      <TopBar />
      <nav className="mobile-workspace-tabs" aria-label="表示切り替え">
        {mobileTabs.map((tab) => (
          <button
            className={mobileTab === tab.id ? "mobile-tab-button active" : "mobile-tab-button"}
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="workspace main-workspace" aria-label="学習シミュレーション">
        <section className="left-learning-column" aria-label="3Dビューと解説">
          <div className={highlightedUI === "sceneView" ? "view-pane view-pane-3d scene-pane ui-highlight" : "view-pane view-pane-3d scene-pane"} aria-label="3Dビュー">
            <SceneView />
          </div>
          <div className="lesson-pane">
            <ScenarioPlayer />
          </div>
        </section>
        <aside className={highlightedUI === "sensorPanel" ? "view-pane sensor-pane right-inspector ui-highlight" : "view-pane sensor-pane right-inspector"} aria-label="スクリーン表示">
          <SensorPanel onShowScene={() => setMobileTab("scene")} />
        </aside>
      </main>
    </div>
  );
}
