import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text, ContactShadows, useTexture, Html, useProgress } from '@react-three/drei';
import luluLogo from '../assets/lulu_logo.png';

const Loader = () => {
    const { progress } = useProgress()
    return (
        <Html center>
            <div style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                {progress.toFixed(0)}%
            </div>
        </Html>
    )
}

const COLORS = {
    wall: "#F5E6CC", // Warm light beige/sand
    wallDark: "#E6D0AA", // Slightly darker beige for contrast
    glass: "#1B264F", // Dark Navy Blue
    glassHighlight: "#2C3E75", // Lighter blue for variation
    trim: "#3E2723", // Dark brownish/grey for frames
    logoRed: "#D32F2F",
    logoYellow: "#FBC02D",
    white: "#FFFFFF",
    roof: "#E0E0E0",
    canopy: "#FFFFFF"
};

const LuLuBuilding = () => {
    // Logo texture
    const logoTexture = useTexture(luluLogo);

    return (
        <group position={[0, -0.5, 0]}> {/* Lowered slightly to sit better on floor */}

            {/* --- GROUND BASE (The "Blank/Plank") --- */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <boxGeometry args={[16, 0.2, 8]} />
                <meshStandardMaterial color="#4A4A4A" roughness={0.8} />
            </mesh>

            {/* --- MAIN STRUCTURE --- */}

            {/* CENTER BLOCK (Entrance) */}
            <group position={[0, 0, 0]}>
                {/* Main Body */}
                <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[4.2, 3, 2.5]} />
                    <meshStandardMaterial color={COLORS.wall} roughness={0.5} />
                </mesh>

                {/* Central Blue Dome/Feature */}
                <mesh position={[0, 3.1, 0.5]} castShadow>
                    <cylinderGeometry args={[1, 0.8, 1, 32]} />
                    <meshStandardMaterial color={COLORS.glass} roughness={0.2} metalness={0.6} />
                </mesh>

                {/* Entrance Canopy */}
                <mesh position={[0, 0.8, 1.8]} castShadow receiveShadow>
                    <boxGeometry args={[3, 0.2, 2]} />
                    <meshStandardMaterial color={COLORS.canopy} />
                </mesh>

                {/* Entrance Pillars */}
                <mesh position={[-1.3, 0.4, 2.6]} castShadow>
                    <boxGeometry args={[0.3, 0.8, 0.3]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>
                <mesh position={[1.3, 0.4, 2.6]} castShadow>
                    <boxGeometry args={[0.3, 0.8, 0.3]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>

                {/* Glass Entrance Area */}
                <mesh position={[0, 1.0, 1.26]}>
                    <planeGeometry args={[2.8, 2]} />
                    <meshStandardMaterial color={COLORS.glass} roughness={0.1} metalness={0.8} />
                </mesh>

                {/* "LULU MALL" Text on Canopy */}
                <Text
                    position={[0, 0.95, 2.81]}
                    fontSize={0.25}
                    color="#333"
                    anchorX="center"
                    anchorY="middle"
                >
                    LULU MALL
                </Text>
            </group>


            {/* --- RIGHT WING (Curved/Striped) --- */}
            <group position={[4.1, 0, 0.2]}>
                {/* Connection Segment */}
                <mesh position={[-1, 1.2, 0]} castShadow>
                    <boxGeometry args={[2, 2.4, 2]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>

                {/* Main Right Block with Logo */}
                <mesh position={[1.5, 1.4, 0.2]} castShadow receiveShadow>
                    <boxGeometry args={[3.5, 2.8, 2.2]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>

                {/* Logo on Wall */}
                <mesh position={[0.5, 2.0, 1.31]} rotation={[0, 0, 0]}>
                    <planeGeometry args={[1.8, 0.8]} />
                    <meshStandardMaterial map={logoTexture} transparent side={THREE.DoubleSide} />
                </mesh>

                {/* The Curved Corner Feature (Simulated with chamfered block) */}
                <group position={[3.3, 1.0, 1.3]}>
                    <mesh rotation={[0, -Math.PI / 4, 0]} position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[1.5, 2.8, 0.5]} />
                        <meshStandardMaterial color={COLORS.wall} />
                    </mesh>

                    {/* Horizontal Blue Stripes */}
                    {[0, 1, 2].map(i => (
                        <mesh key={i} rotation={[0, -Math.PI / 4, 0]} position={[0.05, -0.5 + (i * 0.6), 0.05]}>
                            <boxGeometry args={[1.4, 0.3, 0.55]} />
                            <meshStandardMaterial color={COLORS.glass} />
                        </mesh>
                    ))}
                </group>

                {/* Far Right Extension */}
                <mesh position={[5, 1.2, -0.5]} castShadow>
                    <boxGeometry args={[3, 2.4, 2]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>
                <mesh position={[6, 1.0, 0.6]} castShadow>
                    <boxGeometry args={[1, 2, 1]} />
                    <meshStandardMaterial color={COLORS.glass} roughness={0.2} metalness={0.8} />
                </mesh>
            </group>


            {/* --- LEFT WING (Long segmented) --- */}
            <group position={[-4.1, 0, 0.2]}>
                {/* Connection Segment */}
                <mesh position={[1, 1.2, 0]}>
                    <boxGeometry args={[2, 2.4, 2]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>

                {/* Main Left Block */}
                <mesh position={[-2, 1.4, 0.2]} castShadow receiveShadow>
                    <boxGeometry args={[4.5, 2.8, 2.2]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>

                {/* Large Dark Blue Windows */}
                {[-3, -2, -1].map((x, i) => (
                    <mesh key={i} position={[x, 1.4, 1.31]}>
                        <boxGeometry args={[0.8, 2.0, 0.1]} />
                        <meshStandardMaterial color={COLORS.glass} roughness={0.1} metalness={0.8} />
                    </mesh>
                ))}

                {/* Far Left End Feature */}
                <mesh position={[-5, 1.4, 0]} castShadow>
                    <boxGeometry args={[1.5, 3.2, 2.4]} />
                    <meshStandardMaterial color={COLORS.wallDark} />
                </mesh>
                {/* Vertical decoration on far left */}
                <mesh position={[-5.8, 1.5, 0.5]} castShadow>
                    <boxGeometry args={[0.2, 2.5, 1.5]} />
                    <meshStandardMaterial color={COLORS.wall} />
                </mesh>
            </group>

            {/* ROOF SLAB/TRIM */}
            <mesh position={[0, 3.01, 0]} receiveShadow>
                <boxGeometry args={[14, 0.15, 2.5]} />
                <meshStandardMaterial color={COLORS.wallDark} />
            </mesh>
            <mesh position={[0, 3.1, -0.5]} receiveShadow>
                <boxGeometry args={[12, 0.4, 2]} />
                <meshStandardMaterial color={COLORS.wall} />
            </mesh>

        </group>
    );
};

const LuLuStore3D = () => {
    return (
        <div style={{ width: '100%', height: '500px', cursor: 'grab' }}>
            <Canvas shadows gl={{ antialias: true }} camera={{ position: [0, 4, 20], fov: 30 }}>
                {/* Camera & Controls */}
                <PerspectiveCamera makeDefault position={[0, 4, 22]} fov={30} />
                <OrbitControls
                    enableZoom={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.9}
                    enablePan={false}
                    minAzimuthAngle={-Math.PI / 3}
                    maxAzimuthAngle={Math.PI / 3}
                />

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[-10, 10, 10]}
                    intensity={1.2}
                    color="#fff0dd"
                    castShadow
                    shadow-bias={-0.0001}
                />
                <directionalLight position={[10, 5, 5]} intensity={0.8} color="#dbeafe" />
                <pointLight position={[0, 4, 5]} intensity={0.6} color="#ffffff" />

                {/* Main Content */}
                <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.1}>
                    <group rotation={[0, -Math.PI / 16, 0]}>
                        <React.Suspense fallback={<Loader />}>
                            <LuLuBuilding />
                        </React.Suspense>
                    </group>
                </Float>

                <Environment preset="city" />

                <ContactShadows
                    position={[0, -2.5, 0]}
                    opacity={0.5}
                    scale={40}
                    blur={2}
                    far={10}
                    color="#000000"
                />
            </Canvas>
        </div>
    );
};

export default LuLuStore3D;
