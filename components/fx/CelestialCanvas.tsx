'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { useCalm, useMounted } from '@/lib/hooks';

/* The sky behind the whole story: a slowly twinkling starfield and a rising
   drift of golden dust, both leaning gently with the pointer. */

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const starFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, glow * glow * vTwinkle * uOpacity);
  }
`;

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vLife;
  void main() {
    vec3 p = position;
    float t = fract(uTime * 0.014 * aSpeed + aPhase);
    p.y = mix(-9.0, 9.0, t);
    p.x += sin(uTime * 0.3 * aSpeed + aPhase * 6.28) * 0.6;
    vLife = sin(t * 3.14159);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (120.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(uColor, glow * vLife * uOpacity);
  }
`;

function Stars({ progress }: { progress: MotionValue<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = 420;

  const { positions, sizes, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = -4 - Math.random() * 10;
      sizes[i] = 0.4 + Math.random() * 1.4;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.4;
    }
    return { positions, sizes, phases, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = clock.elapsedTime;
    // stars burn brightest in the prologue and the finale, and soften between
    const t = progress.get();
    const edge = Math.min(1, Math.max(0, 1 - Math.abs(t - 0.5) * 2));
    mat.current.uniforms.uOpacity.value = 1 - edge * 0.55;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={starVertex}
        fragmentShader={starFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
          uColor: { value: new THREE.Color('#fdf3dc') },
          uOpacity: { value: 1 },
        }}
      />
    </points>
  );
}

function Dust() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const count = 130;

  const { positions, sizes, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = -2 - Math.random() * 6;
      sizes[i] = 0.5 + Math.random() * 1.1;
      phases[i] = Math.random();
      speeds[i] = 0.5 + Math.random() * 1.2;
    }
    return { positions, sizes, phases, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
          uColor: { value: new THREE.Color('#f0d494') },
          uOpacity: { value: 0.5 },
        }}
      />
    </points>
  );
}

function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.55 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -6);
  });
  return null;
}

export function CelestialCanvas({ progress }: { progress: MotionValue<number> }) {
  const mounted = useMounted();
  const calm = useCalm();
  if (!mounted || calm) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 60 }}
      >
        <Stars progress={progress} />
        <Dust />
        <Rig />
      </Canvas>
    </div>
  );
}
