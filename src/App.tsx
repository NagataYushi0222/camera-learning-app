import { NovelBox } from "./components/NovelBox";
import { SceneView } from "./components/SceneView";
import { SensorPanel } from "./components/SensorPanel";
import { TopBar } from "./components/TopBar";

export default function App() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="workspace main-workspace" aria-label="学習シミュレーション">
        <section className="view-pane view-pane-3d" aria-label="3Dビュー">
          <SceneView />
        </section>
        <aside className="view-pane sensor-pane right-inspector" aria-label="スクリーン表示">
          <SensorPanel />
        </aside>
      </main>
      <NovelBox />
    </div>
  );
}
