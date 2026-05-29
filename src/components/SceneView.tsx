import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Line, OrbitControls, Text } from "@react-three/drei";
import { Eye, RadioTower, Route, Waves } from "lucide-react";
import { Fragment, useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  computeIdealImagePoint,
  computeOpticalInfo,
  getRepresentativeRays,
  modeLabels,
  rayDisplayModeLabels,
  sensorGrid,
  type SceneConfig,
  type SensorRenderResult,
  type TracedRay,
  type Vec3,
} from "../simulation/opticsModel";
import { useLessonStore } from "../state/useLessonStore";
import { useScenarioStore } from "../state/useScenarioStore";
import { cameraShots } from "../features/cinematic/cameraShots";

function toTuple(point: Vec3): [number, number, number] {
  return [point.x, point.y, point.z];
}

function SceneCameraDirector() {
  const cameraShot = useScenarioStore((state) => state.cameraShot);
  const learningMode = useScenarioStore((state) => state.learningMode);
  const { camera, controls } = useThree();

  useFrame(() => {
    if (learningMode === "explore") {
      return;
    }

    const shot = cameraShots[cameraShot];
    const targetPosition = new THREE.Vector3(...shot.position);
    camera.position.lerp(targetPosition, 0.035);
    if ("fov" in camera) {
      camera.fov += (shot.fov - camera.fov) * 0.035;
      camera.updateProjectionMatrix();
    }

    const orbitControls = controls as { target?: THREE.Vector3; update?: () => void } | undefined;
    if (orbitControls?.target) {
      orbitControls.target.lerp(new THREE.Vector3(...shot.target), 0.045);
      orbitControls.update?.();
    }
  });

  return null;
}

function RayLines({
  rays,
  selected = false,
  color,
  opacity,
  lineWidth,
}: {
  rays: TracedRay[];
  selected?: boolean;
  color?: string;
  opacity?: number;
  lineWidth?: number;
}) {
  return (
    <>
      {rays.map((ray, index) => (
        <Line
          key={`${ray.id}-${index}`}
          points={ray.points.map(toTuple)}
          color={color ?? ray.color}
          lineWidth={lineWidth ?? (selected ? 4 : 1.4)}
          transparent
          opacity={opacity ?? (selected ? Math.min(1, 0.54 + ray.intensity * 2.2) : 0.22)}
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

function SensorPlane({
  config,
  sensorResult,
  selectedPixel,
}: {
  config: SceneConfig;
  sensorResult: SensorRenderResult;
  selectedPixel: ReturnType<typeof useLessonStore.getState>["selectedPixel"];
}) {
  const texture = useMemo(() => {
    const dataTexture = new THREE.DataTexture(
      Uint8Array.from(sensorResult.pixelBuffer),
      sensorResult.width,
      sensorResult.height,
      THREE.RGBAFormat,
    );
    dataTexture.needsUpdate = true;
    dataTexture.flipY = true;
    dataTexture.colorSpace = THREE.SRGBColorSpace;
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.generateMipmaps = false;
    return dataTexture;
  }, [sensorResult]);
  const screenWidth = sensorGrid.width;
  const screenHeight = (screenWidth * sensorResult.height) / sensorResult.width;
  const selectedScreenOffset = selectedPixel
    ? {
        y: (0.5 - selectedPixel.v) * screenHeight,
        z: (selectedPixel.u - 0.5) * screenWidth,
      }
    : null;

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={toTuple(config.sensorPosition)}>
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[screenWidth + 0.12, screenHeight + 0.12, 0.035]} />
        <meshBasicMaterial color="#202226" wireframe />
      </mesh>
      <Text
        position={[-0.04, screenHeight * 0.58, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.13}
        color="#dfe9ec"
        anchorX="center"
        anchorY="middle"
      >
        スクリーン / センサー
      </Text>
      {selectedScreenOffset ? (
        <mesh position={[-0.035, selectedScreenOffset.y, selectedScreenOffset.z]}>
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial color="#ffcf33" emissive="#ffb000" emissiveIntensity={1.2} />
        </mesh>
      ) : null}
      {selectedScreenOffset ? (
        <mesh
          position={[-0.032, selectedScreenOffset.y, selectedScreenOffset.z]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.085, 0.008, 8, 40]} />
          <meshBasicMaterial color="#ffd34e" transparent opacity={0.95} />
        </mesh>
      ) : null}
    </group>
  );
}

function AxisMarkers({ config }: { config: SceneConfig }) {
  const objectX = config.objectPosition.x;
  const lensX = config.lensPosition.x;
  const sensorX = config.sensorPosition.x;
  const minX = Math.min(objectX, lensX, sensorX) - 0.35;
  const maxX = Math.max(objectX, lensX, sensorX) + 0.35;
  const objectDistance = Math.abs(lensX - objectX);
  const screenDistance = Math.abs(sensorX - lensX);

  return (
    <group>
      <Line points={[[minX, -0.62, 0], [maxX, -0.62, 0]]} color="#88929b" lineWidth={1.1} transparent opacity={0.65} />
      {[
        { label: "物体", x: objectX, color: "#e36b58" },
        { label: "レンズ", x: lensX, color: "#7bd4df" },
        { label: "スクリーン", x: sensorX, color: "#f4d35e" },
      ].map((marker) => (
        <group key={marker.label} position={[marker.x, -0.62, 0]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={marker.color} />
          </mesh>
          <Line points={[[0, -0.02, 0], [0, 0.34, 0]]} color={marker.color} lineWidth={1} transparent opacity={0.42} />
          <Text position={[0, 0.48, 0]} fontSize={0.12} color="#e7edf0" anchorX="center" anchorY="middle">
            {marker.label}
          </Text>
        </group>
      ))}
      <Line points={[[objectX, -0.92, -0.18], [lensX, -0.92, -0.18]]} color="#e6a44c" lineWidth={1.2} transparent opacity={0.7} />
      <Text position={[(objectX + lensX) / 2, -1.03, -0.18]} fontSize={0.11} color="#ffd99b" anchorX="center" anchorY="middle">
        物体距離 {objectDistance.toFixed(2)}
      </Text>
      <Line points={[[lensX, -0.92, 0.18], [sensorX, -0.92, 0.18]]} color="#f4d35e" lineWidth={1.2} transparent opacity={0.7} />
      <Text position={[(lensX + sensorX) / 2, -1.03, 0.18]} fontSize={0.11} color="#fff1a8" anchorX="center" anchorY="middle">
        スクリーン距離 {screenDistance.toFixed(2)}
      </Text>
    </group>
  );
}

function IdealOpticsOverlay({ config, sourceBundleRays }: { config: SceneConfig; sourceBundleRays: TracedRay[] }) {
  if (config.mode !== "lens" && config.mode !== "out-of-focus") {
    return null;
  }

  const opticalInfo = computeOpticalInfo(config);
  if (opticalInfo.idealImageDistance === null) {
    return null;
  }

  const idealImageX = config.lensPosition.x + opticalInfo.idealImageDistance;
  const screenHeight = sensorGrid.height;
  const markerPoint =
    sourceBundleRays.find((ray) => ray.idealImagePoint)?.idealImagePoint ??
    computeIdealImagePoint(config, { x: config.objectPosition.x, y: config.objectPosition.y, z: config.objectPosition.z });
  const focusError = opticalInfo.focusError ?? 0;
  const focusLineY = screenHeight * 0.75;
  const focusLineZ = -sensorGrid.width * 0.62;

  return (
    <group>
      <group position={[idealImageX, 0, 0]}>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[sensorGrid.width, screenHeight]} />
          <meshBasicMaterial color="#fff4c2" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[sensorGrid.width + 0.08, screenHeight + 0.08, 0.024]} />
          <meshBasicMaterial color="#fff4c2" wireframe transparent opacity={0.55} />
        </mesh>
        <Text
          position={[-0.035, screenHeight * 0.58, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.12}
          color="#fff2ad"
          anchorX="center"
          anchorY="middle"
        >
          理想像面
        </Text>
      </group>
      <mesh position={toTuple(markerPoint)}>
        <sphereGeometry args={[0.052, 24, 24]} />
        <meshStandardMaterial color="#fff7d6" emissive="#ffe27a" emissiveIntensity={1.4} />
      </mesh>
      <Text
        position={[markerPoint.x, markerPoint.y + 0.16, markerPoint.z]}
        fontSize={0.095}
        color="#fff7d6"
        anchorX="center"
        anchorY="middle"
      >
        idealImagePoint
      </Text>
      <Line
        points={[[idealImageX, focusLineY, focusLineZ], [config.sensorPosition.x, focusLineY, focusLineZ]]}
        color={Math.abs(focusError) < 0.08 ? "#dfffe5" : "#ffe27a"}
        lineWidth={2}
        transparent
        opacity={0.8}
      />
      <Text
        position={[(idealImageX + config.sensorPosition.x) / 2, focusLineY + 0.13, focusLineZ]}
        fontSize={0.105}
        color="#fff0a8"
        anchorX="center"
        anchorY="middle"
      >
        {`ピント誤差 ${focusError.toFixed(2)} / di ${opticalInfo.idealImageDistance.toFixed(2)} / f ${opticalInfo.focalLength.toFixed(2)}`}
      </Text>
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

function limitSelectedRays(rays: TracedRay[]): TracedRay[] {
  return rays.slice(0, 32);
}

function averagePoint(points: Vec3[]): Vec3 {
  if (points.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y, z: sum.z + point.z }),
    { x: 0, y: 0, z: 0 },
  );

  return { x: total.x / points.length, y: total.y / points.length, z: total.z / points.length };
}

function FluxSegment({ from, to, radiusStart, radiusEnd, color, opacity }: {
  from: Vec3;
  to: Vec3;
  radiusStart: number;
  radiusEnd: number;
  color: string;
  opacity: number;
}) {
  const fromVector = new THREE.Vector3(from.x, from.y, from.z);
  const toVector = new THREE.Vector3(to.x, to.y, to.z);
  const direction = toVector.clone().sub(fromVector);
  const length = direction.length();
  const midpoint = fromVector.clone().add(direction.multiplyScalar(0.5));
  const quaternion = beamQuaternion(from, to, "y");

  return (
    <mesh position={[midpoint.x, midpoint.y, midpoint.z]} quaternion={quaternion}>
      <cylinderGeometry args={[radiusEnd, radiusStart, length, 36, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function FluxVolumes({ config, rays }: { config: SceneConfig; rays: TracedRay[] }) {
  const visibleRays = rays.length > 0 ? rays : [];
  const objectPoint = visibleRays[0]?.origin ?? config.objectPosition;
  const apertureCenter = config.lensPosition;
  const sensorPoints = visibleRays.map((ray) => ray.sensorHitPoint ?? ray.points[ray.points.length - 1]);
  const sensorCenter = sensorPoints.length ? averagePoint(sensorPoints) : config.sensorPosition;

  if (config.mode === "no-lens") {
    return (
      <FluxSegment
        from={config.objectPosition}
        to={config.sensorPosition}
        radiusStart={0.28}
        radiusEnd={0.96}
        color="#d65a3b"
        opacity={0.12}
      />
    );
  }

  if (config.mode === "pinhole") {
    return (
      <>
        <FluxSegment from={objectPoint} to={apertureCenter} radiusStart={0.16} radiusEnd={0.035} color="#ffd45c" opacity={0.18} />
        <FluxSegment from={apertureCenter} to={sensorCenter} radiusStart={0.035} radiusEnd={0.12} color="#ffe79a" opacity={0.16} />
      </>
    );
  }

  return (
    <>
      <FluxSegment from={objectPoint} to={apertureCenter} radiusStart={0.1} radiusEnd={config.apertureRadius} color="#ffd45c" opacity={0.15} />
      <FluxSegment from={apertureCenter} to={sensorCenter} radiusStart={config.apertureRadius} radiusEnd={config.mode === "out-of-focus" ? 0.36 : 0.08} color="#fff0b8" opacity={0.13} />
    </>
  );
}

function SceneContent() {
  const {
    sceneConfig,
    sensorResult,
    selectedPixel,
    selectedContributorRays,
    selectedSourceBundleRays,
    showRays,
    showWavefronts,
    rayDisplayMode,
  } = useLessonStore();
  const representativeRays = useMemo(
    () => getRepresentativeRays(sceneConfig, sensorResult.samples),
    [sceneConfig, sensorResult.samples],
  );
  const visibleContributorRays = useMemo(() => limitSelectedRays(selectedContributorRays), [selectedContributorRays]);
  const visibleSourceBundleRays = useMemo(() => limitSelectedRays(selectedSourceBundleRays), [selectedSourceBundleRays]);
  const debugRays = useMemo(() => sensorResult.rays.slice(0, 180), [sensorResult]);

  return (
    <Fragment>
      <color attach="background" args={["#111214"]} />
      <SceneCameraDirector />
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
      <SensorPlane config={sceneConfig} sensorResult={sensorResult} selectedPixel={selectedPixel} />
      <CameraWireframe config={sceneConfig} />
      <AxisMarkers config={sceneConfig} />
      <IdealOpticsOverlay config={sceneConfig} sourceBundleRays={visibleSourceBundleRays} />
      {showRays && rayDisplayMode === "representative" ? (
        <RayLines rays={representativeRays} color="#f2a23a" opacity={0.72} lineWidth={2.2} />
      ) : null}
      {showRays && rayDisplayMode === "contributors" ? (
        <>
          <RayLines
            rays={visibleContributorRays}
            selected
            color={sceneConfig.mode === "no-lens" ? "#e8683a" : "#ffe36e"}
            opacity={sceneConfig.mode === "no-lens" ? 0.46 : 0.94}
            lineWidth={sceneConfig.mode === "no-lens" ? 2.1 : 4}
          />
          {visibleContributorRays.length === 0 ? <RayLines rays={representativeRays.slice(0, 3)} color="#6f7780" opacity={0.16} lineWidth={1.2} /> : null}
        </>
      ) : null}
      {showRays && rayDisplayMode === "source-bundle" ? (
        <>
          <RayLines
            rays={visibleSourceBundleRays.length ? visibleSourceBundleRays : representativeRays}
            selected
            color="#fff0a8"
            opacity={0.92}
            lineWidth={3.2}
          />
          <FluxVolumes config={sceneConfig} rays={visibleSourceBundleRays.length ? visibleSourceBundleRays : representativeRays} />
        </>
      ) : null}
      {showRays && rayDisplayMode === "debug" ? (
        <>
          <RayLines rays={debugRays} color={sceneConfig.mode === "no-lens" ? "#d75b3c" : "#6f7780"} opacity={sceneConfig.mode === "no-lens" ? 0.12 : 0.18} lineWidth={1} />
          <RayLines rays={visibleContributorRays} selected color="#ffe36e" opacity={0.96} lineWidth={4} />
        </>
      ) : null}
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.5} maxDistance={9} />
    </Fragment>
  );
}

export function SceneView() {
  const {
    mode,
    selectedPixel,
    selectedContributorRays,
    selectedSourceBundleRays,
    showRays,
    showWavefronts,
    rayDisplayMode,
    toggleRays,
    toggleWavefronts,
  } = useLessonStore();
  const activeRayCount = rayDisplayMode === "source-bundle" ? selectedSourceBundleRays.length : selectedContributorRays.length;

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
              {rayDisplayModeLabels[rayDisplayMode]} / 表示光線 {activeRayCount} 本
            </>
          ) : (
            <>
              <Eye size={15} aria-hidden="true" />
              {rayDisplayModeLabels[rayDisplayMode]} / 右のセンサーをクリック
            </>
          )}
        </span>
      </div>
    </div>
  );
}
