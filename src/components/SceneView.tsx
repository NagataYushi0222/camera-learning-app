import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import { Eye, RadioTower, Route, Waves } from "lucide-react";
import { Fragment, useMemo } from "react";
import * as THREE from "three";
import {
  computeHighlightedRays,
  modeLabels,
  sensorGrid,
  sensorPoint,
  staticGuideRays,
  type LightRay,
} from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";

function RayLines({ rays, selected = false }: { rays: LightRay[]; selected?: boolean }) {
  return (
    <>
      {rays.map((ray) => (
        <Line
          key={ray.id}
          points={ray.points}
          color={ray.color}
          lineWidth={selected ? 4 : 1.8}
          transparent
          opacity={ray.opacity}
        />
      ))}
    </>
  );
}

function LightSource({ showWavefronts }: { showWavefronts: boolean }) {
  return (
    <group position={[-4.25, 1.2, -1.35]}>
      <pointLight color="#fff1ba" intensity={1.4} distance={7} />
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#ffd35a" emissive="#ffba3a" emissiveIntensity={1.3} />
      </mesh>
      {showWavefronts
        ? [0.42, 0.72, 1.02].map((radius) => (
            <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius, 0.008, 8, 96]} />
              <meshBasicMaterial color="#ffe18a" transparent opacity={0.26} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function AppleObject() {
  return (
    <group position={[-2.8, 0, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.52, 48, 48]} />
        <meshStandardMaterial color="#c9362e" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0.35, 0, 0.2]}>
        <cylinderGeometry args={[0.035, 0.055, 0.34, 12]} />
        <meshStandardMaterial color="#5b351b" roughness={0.8} />
      </mesh>
      <mesh position={[0.09, 0.62, 0.08]} rotation={[0.4, 0.2, -0.7]} scale={[0.18, 0.06, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#3e8c4b" roughness={0.7} />
      </mesh>
    </group>
  );
}

function LensObject({ mode }: { mode: string }) {
  if (mode === "no-lens") {
    return null;
  }

  if (mode === "pinhole") {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.54, 0]}>
          <boxGeometry args={[0.08, 1.08, 1.7]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.54, 0]}>
          <boxGeometry args={[0.08, 1.08, 1.7]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.56]}>
          <boxGeometry args={[0.08, 0.18, 0.58]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.56]}>
          <boxGeometry args={[0.08, 0.18, 0.58]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.16, 0.012, 10, 48]} />
          <meshBasicMaterial color="#ffd35a" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.82, 0.82, 0.16, 48]} />
        <meshPhysicalMaterial
          color="#9ed7e4"
          transparent
          opacity={0.34}
          roughness={0.08}
          transmission={0.6}
          thickness={0.36}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.83, 0.018, 12, 80]} />
        <meshStandardMaterial color="#2d6b73" roughness={0.35} />
      </mesh>
    </group>
  );
}

function SensorPlane({ selectedPixel }: { selectedPixel: ReturnType<typeof useLessonStore.getState>["selectedPixel"] }) {
  const selectedPosition = useMemo(() => (selectedPixel ? sensorPoint(selectedPixel) : null), [selectedPixel]);

  return (
    <group position={[3, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[sensorGrid.width, sensorGrid.height]} />
        <meshStandardMaterial color="#f3f5f6" roughness={0.35} metalness={0.02} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[sensorGrid.width + 0.12, sensorGrid.height + 0.12, 0.035]} />
        <meshBasicMaterial color="#202226" wireframe />
      </mesh>
      {selectedPosition ? (
        <mesh position={[selectedPosition[0] - 3 - 0.035, selectedPosition[1], selectedPosition[2]]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color="#ffcf33" emissive="#ffb000" emissiveIntensity={1.2} />
        </mesh>
      ) : null}
    </group>
  );
}

function CameraWireframe() {
  return (
    <group>
      <mesh position={[1.15, 0, 0]}>
        <boxGeometry args={[3.9, 1.9, 2.55]} />
        <meshBasicMaterial color="#687079" wireframe transparent opacity={0.42} />
      </mesh>
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.02, 1.02, 0.42, 32, 1, true]} />
        <meshBasicMaterial color="#687079" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const { mode, selectedPixel, showRays, showWavefronts } = useLessonStore();
  const guideRays = useMemo(() => staticGuideRays(mode), [mode]);
  const highlightedRays = useMemo(() => computeHighlightedRays(mode, selectedPixel), [mode, selectedPixel]);

  return (
    <Fragment>
      <color attach="background" args={["#111214"]} />
      <ambientLight intensity={0.52} />
      <directionalLight position={[4, 5, 3]} intensity={1.25} castShadow />
      <Grid
        args={[8, 8]}
        position={[0, -0.78, 0]}
        cellColor="#3f454a"
        sectionColor="#697078"
        fadeDistance={8}
        fadeStrength={1.6}
      />
      <LightSource showWavefronts={showWavefronts} />
      <AppleObject />
      <LensObject mode={mode} />
      <SensorPlane selectedPixel={selectedPixel} />
      <CameraWireframe />
      {showRays ? <RayLines rays={guideRays} /> : null}
      <RayLines rays={highlightedRays} selected />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.5} maxDistance={9} />
    </Fragment>
  );
}

export function SceneView() {
  const { mode, selectedPixel, showRays, showWavefronts, toggleRays, toggleWavefronts } = useLessonStore();

  return (
    <div className="scene-shell">
      <div className="scene-title">
        <div>
          <p className="eyebrow">Interactive 3D</p>
          <h2>光の経路ビュー</h2>
        </div>
        <span className="mode-pill dark">{modeLabels[mode]}</span>
      </div>
      <Canvas camera={{ position: [5.6, 3.2, 5.2], fov: 46 }} gl={{ preserveDrawingBuffer: true }} shadows>
        <SceneContent />
      </Canvas>
      <div className="scene-toolbar" aria-label="3D表示操作">
        <button className={showRays ? "tool-button active" : "tool-button"} onClick={toggleRays} type="button" title="光線表示">
          <Route size={16} aria-hidden="true" />
          光線
        </button>
        <button
          className={showWavefronts ? "tool-button active" : "tool-button"}
          onClick={toggleWavefronts}
          type="button"
          title="波面表示"
        >
          <Waves size={16} aria-hidden="true" />
          波面
        </button>
        <span className="scene-status">
          {selectedPixel ? (
            <>
              <RadioTower size={15} aria-hidden="true" />
              選択光線を表示中
            </>
          ) : (
            <>
              <Eye size={15} aria-hidden="true" />
              右のセンサーをクリック
            </>
          )}
        </span>
      </div>
    </div>
  );
}
