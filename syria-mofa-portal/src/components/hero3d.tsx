"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** 8-point khatam star outline. */
function starShape(r1: number, r2: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const p = [Math.cos(a) * r, Math.sin(a) * r] as const;
    if (i) s.lineTo(...p); else s.moveTo(...p);
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, r2 * 0.55, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

/** Horseshoe arch frame (Umayyad style) as an extruded ring segment. */
function archShape(w: number, h: number, t: number) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r - t, 0); s.lineTo(-r - t, h - r);
  s.absarc(0, h - r, r + t, Math.PI + 0.35, -0.35, true);
  s.lineTo(r + t, 0); s.lineTo(r, 0); s.lineTo(r, h - r);
  s.absarc(0, h - r, r, -0.35, Math.PI + 0.35, false);
  s.lineTo(-r, 0); s.closePath();
  return s;
}

function Star({ reduced }: { reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(() => new THREE.ExtrudeGeometry(starShape(2.2, 1.55), { depth: 0.35, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.08, bevelSegments: 3 }), []);
  const inner = useMemo(() => new THREE.ExtrudeGeometry(starShape(1.0, 0.72), { depth: 0.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.05 }), []);
  useFrame((s, dt) => {
    if (!g.current || reduced) return;
    g.current.rotation.z += dt * 0.08;
    g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.35;
    g.current.position.y = 0.3 + Math.sin(s.clock.elapsedTime * 0.6) * 0.08;
  });
  return (
    <group ref={g} position={[0, 0.3, 0]}>
      <mesh geometry={geo} position={[0, 0, -0.17]}><meshStandardMaterial color="#C9A14A" metalness={0.95} roughness={0.22} /></mesh>
      <mesh geometry={inner} position={[0, 0, -0.1]} rotation={[0, 0, Math.PI / 8]}><meshStandardMaterial color="#0A6B47" metalness={0.6} roughness={0.3} emissive="#06452E" emissiveIntensity={0.4} /></mesh>
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} position={[x, 0, 0.32]}><icosahedronGeometry args={[0.09, 1]} /><meshStandardMaterial color="#CE1126" emissive="#CE1126" emissiveIntensity={1.2} /></mesh>
      ))}
    </group>
  );
}

function Arches() {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(archShape(2.4, 4.2, 0.22), { depth: 0.3, bevelEnabled: false }), []);
  const items = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ z: -2 - i * 2.2, x: (i % 2 ? 1 : -1) * 0.02 })), []);
  return (
    <group position={[0, -2.6, 0]}>
      {items.map((a, i) => (
        <mesh key={i} geometry={geo} position={[a.x, 0, a.z]} scale={1 + i * 0.12}>
          <meshStandardMaterial color={i % 3 === 0 ? "#C9A14A" : "#16294A"} metalness={0.7} roughness={0.4} transparent opacity={Math.max(0.12, 0.9 - i * 0.06)} />
        </mesh>
      ))}
    </group>
  );
}

function Tiles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = 260;
  const geo = useMemo(() => new THREE.ShapeGeometry(starShape(0.22, 0.16)), []);
  const data = useMemo(() => Array.from({ length: n }, () => ({
    p: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -4 - Math.random() * 22),
    s: 0.3 + Math.random() * 1.2, r: Math.random() * Math.PI, v: 0.1 + Math.random() * 0.3,
  })), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    data.forEach((d, i) => {
      m.position.set(d.p.x, d.p.y + Math.sin(t * d.v + i) * 0.3, d.p.z);
      m.rotation.set(0, 0, d.r + t * d.v * 0.3);
      m.scale.setScalar(d.s);
      m.updateMatrix();
      ref.current!.setMatrixAt(i, m.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, undefined, n]}><meshBasicMaterial color="#DEC07D" transparent opacity={0.35} side={THREE.DoubleSide} /></instancedMesh>;
}

function Rig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    if (reduced) return;
    const sy = typeof window !== "undefined" ? Math.min(window.scrollY / window.innerHeight, 1.2) : 0;
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.6 + 0.2 - camera.position.y) * 0.04;
    camera.position.z += (8 - sy * 4 - camera.position.z) * 0.08;
    camera.lookAt(0, 0, -4);
  });
  return null;
}

export default function Hero3D({ reduced, rtl = false }: { reduced: boolean; rtl?: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.2, 8], fov: 45 }} frameloop={reduced ? "demand" : "always"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <fog attach="fog" args={["#0B1B33", 8, 34]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} color="#FFE7B3" />
      <pointLight position={[-5, -2, 3]} intensity={30} color="#0A6B47" />
      <pointLight position={[0, 2, 4]} intensity={12} color="#C9A14A" />
      <Tiles />
      {/* Composition sits opposite the headline: right in LTR, left in RTL (desktop) */}
      <group position={[typeof window !== "undefined" && window.innerWidth < 900 ? 0 : rtl ? -3.2 : 3.2, 0, 0]} scale={0.82}>
        <Arches />
        <Star reduced={reduced} />
      </group>
      <Rig reduced={reduced} />
    </Canvas>
  );
}
