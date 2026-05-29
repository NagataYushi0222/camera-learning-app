import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls, Text } from "@react-three/drei";
import { Eye, RadioTower, Route, Waves } from "lucide-react";
import { Fragment, useMemo } from "react";
import * as THREE from "three";
import {
  modeLabels,
  sensorGrid,
  sensorPoint,
  type SceneConfig,
  type TracedRay,
  type Vec3,
} from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";

function toTuple(point: Vec3): [number, number, number] {
  return [point.x, point.y, point.z];
}

function RayLines({ rays, selected = false }: { rays: TracedRay[]; selected?: boolean }) {
  return (
    <>
      {rays.map((ray, index) => (
        <Line
          key={`${ray.id}-${index}`}
          points={ray.points.map(toTuple)}
          color={ray.color}
          lineWidth={selected ? 4 : 1.4}
          transparent
          opacity={selected ? Math.min(1, 0.48 + ray.intensity * 2.2) : 0.22}
        />
      ))}
    </>
  );
}

function beamQuaternion(from: Vec3, to: Vec3, axis: "y" | "z") {
  const source = new THREE.Vector3(from.x, from.y, from.z);
  const target = new THREE.Vector3(to.x, to.y, to.z);
  const direction = target.sub(source).normalize();
  const base = axis === "y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  return new THREE.Quaternion().setFromUnitVectors(base, direction);
}

function LightSource({ config, showWavefronts }: { config: SceneConfig; showWavefronts: boolean }) {
  const target = config.objectPosition;
  const source = config.lightPosition;
  const direction = new THREE.Vector3(target.x - source.x, target.y - source.y, target.z - source.z);
  const length = direction.length();
  const midpoint: [number, number, number] = [
    source.x + direction.x * 0.5,
    source.y + direction.y * 0.5,
    source.z + direction.z * 0.5,
  ];
  const coneQuaternion = beamQuaternion(source, target, "y");
  const ringQuaternion = beamQuaternion(source, target, "z");
  const lightPower = config.lightEnabled ? config.lightIntensity : 0;
  const incidentTargets: Vec3[] = [
    { x: target.x, y: target.y + 0.42, z: target.z - 0.3 },
    { x: target.x, y: target.y + 0.1, z: target.z + 0.36 },
    { x: target.x, y: target.y - 0.3, z: target.z - 0.18 },
  ];

  return (
    <group>
      <pointLight position={toTuple(source)} color="#fff1ba" intensity={lightPower * 1.7} distance={7} />
      <spotLight
        position={toTuple(source)}
        color="#ffe8a5"
        intensity={lightPower * 2.6}
        angle={0.42}
        penumbra={0.55}
        distance={7}
      />
      <group position={toTuple(source)} quaternion={coneQuaternion}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.22, 0.3, 0.36, 24]} />
          <meshStandardMaterial color="#38424c" roughness={0.38} metalness={0.45} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshStandardMaterial
            color="#ffd35a"
            emissive="#ffba3a"
            emissiveIntensity={config.lightEnabled ? 1 + config.lightIntensity * 1.2 : 0.05}
          />
        </mesh>
        <mesh position={[0, -0.42, 0]}>
          <boxGeometry args={[0.58, 0.12, 0.44]} />
          <meshStandardMaterial color="#20262d" roughness={0.55} metalness={0.35} />
        </mesh>
      </group>
      <Text
        position={[source.x, source.y + 0.42, source.z]}
        fontSize={0.15}
        color="#ffe7a3"
        anchorX="center"
        anchorY="middle"
      >
        光源
      </Text>
      {config.lightEnabled ? (
        <mesh position={midpoint} quaternion={coneQuaternion} renderOrder={-1}>
          <coneGeometry args={[0.72, length, 36, 1, true]} />
          <meshBasicMaterial
            color="#ffd35a"
            transparent
            opacity={0.13 * Math.min(1.6, config.lightIntensity)}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {config.lightEnabled && showWavefronts
        ? [0.22, 0.42, 0.62].map((fraction) => (
            <mesh
              key={fraction}
              position={[source.x + direction.x * fraction, source.y + direction.y * fraction, source.z + direction.z * fraction]}
              quaternion={ringQuaternion}
            >
              <torusGeometry args={[0.18 + fraction * 0.52, 0.008, 8, 96]} />
              <meshBasicMaterial color="#ffe18a" transparent opacity={0.22} />
            </mesh>
          ))
        : null}
      {config.lightEnabled
        ? incidentTargets.map((end, index) => (
            <Line
              key={`incident-${index}`}
              points={[toTuple(source), toTuple(end)]}
              color="#ffe08a"
              lineWidth={1.2}
              transparent
              opacity={0.26}
            />
          ))
        : null}
    </group>
  );
}

function AppleObject({ config }: { config: SceneConfig }) {
  const position = toTuple(config.objectPosition);

  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.52, 48, 48]} />
        <meshStandardMaterial color="#c9362e" roughness={0.62} metalness={0.04} />
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

function LensObject({ config }: { config: SceneConfig }) {
  const mode = config.mode;

  if (mode === "no-lens") {
    return null;
  }

  if (mode === "pinhole") {
    const panelHeight = 1.82;
    const panelWidth = 2.35;
    const hole = Math.max(0.09, config.pinholeRadius * 3.2);
    const barY = (panelHeight - hole * 2) / 2;
    const barZ = (panelWidth - hole * 2) / 2;

    return (
      <group position={toTuple(config.lensPosition)}>
        <mesh position={[0, hole + barY / 2, 0]}>
          <boxGeometry args={[0.08, barY, panelWidth]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, -hole - barY / 2, 0]}>
          <boxGeometry args={[0.08, barY, panelWidth]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, hole + barZ / 2]}>
          <boxGeometry args={[0.08, hole * 2, barZ]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, -hole - barZ / 2]}>
          <boxGeometry args={[0.08, hole * 2, barZ]} />
          <meshStandardMaterial color="#202226" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[hole, 0.012, 10, 48]} />
          <meshBasicMaterial color="#ffd35a" />
        </mesh>
      </group>
    );
  }

  const radius = Math.max(0.1, config.apertureRadius);

  return (
    <group position={toTuple(config.lensPosition)}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, 0.16, 48]} />
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
        <torusGeometry args={[radius, 0.018, 12, 80]} />
        <meshStandardMaterial color="#2d6b73" roughness={0.35} />
      </mesh>
    </group>
  );
}

function SensorPlane({ config, selectedPixel }: { config: SceneConfig; selectedPixel: ReturnType<typeof useLessonStore.getState>["selectedPixel"] }) {
  const selectedPosition = useMemo(() => (selectedPixel ? sensorPoint(config, selectedPixel) : null), [config, selectedPixel]);

  return (
    <group position={toTuple(config.sensorPosition)}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[sensorGrid.width, sensorGrid.height]} />
        <meshStandardMaterial color="#eef3f5" roughness={0.36} metalness={0.02} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[sensorGrid.width + 0.12, sensorGrid.height + 0.12, 0.035]} />
        <meshBasicMaterial color="#202226" wireframe />
      </mesh>
      {selectedPosition ? (
        <mesh position={[-0.035, selectedPosition.y - config.sensorPosition.y, selectedPosition.z - config.sensorPosition.z]}>
          <sphereGeometry args={[0.055, 24, 24]} />
          <meshStandardMaterial color="#ffcf33" emissive="#ffb000" emissiveIntensity={1.2} />
        </mesh>
      ) : null}
    </group>
  );
}

function CameraWireframe({ config }: { config: SceneConfig }) {
  const centerX = (config.lensPosition.x + config.sensorPosition.x) / 2;
  const width = Math.max(1.2, Math.abs(config.sensorPosition.x - config.lensPosition.x) + 0.9);

  return (
    <group>
      <mesh position={[centerX, 0, 0]}>
        <boxGeometry args={[width, 1.9, 2.55]} />
        <meshBasicMaterial color="#687079" wireframe transparent opacity={0.42} />
      </mesh>
      <mesh position={[config.lensPosition.x - 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.02, 1.02, 0.42, 32, 1, true]} />
        <meshBasicMaterial color="#687079" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const { sceneConfig, sensorResult, selectedPixel, selectedRays, showRays, showWavefronts } = useLessonStore();
  const guideRays = useMemo(() => sensorResult.rays.slice(0, 120), [sensorResult]);

  return (
    <Fragment>
      <color attach="background" args={["#111214"]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 5, 3]} intensity={0.72} castShadow />
      <Grid
        args={[8, 8]}
        position={[0, -0.78, 0]}
        cellColor="#3f454a"
        sectionColor="#697078"
        fadeDistance={8}
        fadeStrength={1.6}
      />
      <LightSource config={sceneConfig} showWavefronts={showWavefronts} />
      <AppleObject config={sceneConfig} />
      <LensObject config={sceneConfig} />
      <SensorPlane config={sceneConfig} selectedPixel={selectedPixel} />
      <CameraWireframe config={sceneConfig} />
      {showRays ? <RayLines rays={guideRays} /> : null}
      <RayLines rays={selectedRays} selected />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.5} maxDistance={9} />
    </Fragment>
  );
}

export function SceneView() {
  const { mode, selectedPixel, selectedRays, showRays, showWavefronts, toggleRays, toggleWavefronts } = useLessonStore();

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
              寄与光線 {selectedRays.length} 本
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
