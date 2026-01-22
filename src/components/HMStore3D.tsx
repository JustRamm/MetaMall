import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text, ContactShadows, useTexture } from '@react-three/drei';
import hmLogo from '../assets/hm_logo.png';

const COLORS = {
    building: "#EEEEEE", // Very light off-white like the image
    roof: "#E0E0E0",
    windowFrame: "#121212", // Deeper black
    glass: "#88ccee",
    logoRed: "#7a0b15",
    canopy: "#1A1A1A"
};

interface WindowGridProps {
    width: number;
    height: number;
    rows?: number;
    cols?: number;
}

const WindowGrid: React.FC<WindowGridProps> = ({ width, height, rows = 2, cols = 2 }) => {
    return (
        <group>
            {/* Dark glass surface */}
            <mesh>
                <boxGeometry args={[width, height, 0.05]} />
                <meshStandardMaterial
                    color={COLORS.glass}
                    roughness={0.05}
                    metalness={0.9}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Mullions (vertical lines) */}
            {Array.from({ length: cols + 1 }).map((_, i) => (
                <mesh key={`v-${i}`} position={[(i - cols / 2) * (width / cols), 0, 0.03]}>
                    <boxGeometry args={[0.04, height, 0.04]} />
                    <meshStandardMaterial color={COLORS.windowFrame} />
                </mesh>
            ))}

            {/* Transoms (horizontal lines) */}
            {Array.from({ length: rows + 1 }).map((_, i) => (
                <mesh key={`h-${i}`} position={[0, (i - rows / 2) * (height / rows), 0.03]}>
                    <boxGeometry args={[width, 0.04, 0.04]} />
                    <meshStandardMaterial color={COLORS.windowFrame} />
                </mesh>
            ))}
        </group>
    );
};

const Building = () => {
    const leftDoor = useRef<THREE.Mesh>(null);
    const rightDoor = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Slow sine wave for opening/closing
        const openFactor = (Math.sin(time * 1.5) + 1) / 2; // 0 to 1
        const slideDistance = 0.35;

        if (leftDoor.current) {
            leftDoor.current.position.x = 0.3 - (openFactor * slideDistance);
        }
        if (rightDoor.current) {
            rightDoor.current.position.x = 0.7 + (openFactor * slideDistance);
        }
    });

    return (
        <group position={[0, -1, 0]}>
            {/* LEFT BLOCK */}
            <mesh position={[-1.2, 1, 0]}>
                <boxGeometry args={[2.4, 2, 2.2]} />
                <meshStandardMaterial color={COLORS.building} roughness={0.6} />
            </mesh>
            {/* Left Block Windows (Front) */}
            <group position={[-1.2, 1, 1.11]}>
                <WindowGrid width={2.0} height={1.6} cols={2} rows={2} />
            </group>
            {/* Left Block Windows (Side) */}
            <group position={[-2.41, 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <WindowGrid width={1.8} height={1.6} cols={2} rows={2} />
            </group>

            {/* CENTRAL ENTRANCE MODULE (White) */}
            <mesh position={[0.5, 1.2, 0.6]}>
                <boxGeometry args={[1.2, 2.4, 1.4]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>

            {/* Logo Display Panel using Image Texture */}
            <mesh position={[0.5, 1.7, 1.35]}>
                <planeGeometry args={[1.0, 0.7]} />
                <meshStandardMaterial map={useTexture(hmLogo)} transparent color={COLORS.logoRed} />
            </mesh>

            {/* Entrance Detail */}
            <mesh position={[0.5, 0.5, 1.4]}>
                <boxGeometry args={[1.0, 0.08, 0.5]} />
                <meshStandardMaterial color={COLORS.canopy} />
            </mesh>
            <mesh ref={leftDoor} position={[0.3, 0.25, 1.31]}>
                <boxGeometry args={[0.4, 0.5, 0.05]} />
                <meshStandardMaterial color={COLORS.glass} roughness={0.05} metalness={0.9} transparent opacity={0.7} />
            </mesh>
            <mesh ref={rightDoor} position={[0.7, 0.25, 1.31]}>
                <boxGeometry args={[0.4, 0.5, 0.05]} />
                <meshStandardMaterial color={COLORS.glass} roughness={0.05} metalness={0.9} transparent opacity={0.7} />
            </mesh>

            {/* RIGHT BLOCK */}
            <mesh position={[2, 1, -0.2]}>
                <boxGeometry args={[1.8, 2, 1.8]} />
                <meshStandardMaterial color={COLORS.building} roughness={0.6} />
            </mesh>
            {/* Right Block Windows (Front) */}
            <group position={[2, 1, 0.71]}>
                <WindowGrid width={1.5} height={1.6} cols={2} rows={2} />
            </group>

            {/* ROOF PARAPET / TRIM */}
            <mesh position={[-1.2, 2.05, 0]}>
                <boxGeometry args={[2.42, 0.1, 2.22]} />
                <meshStandardMaterial color={COLORS.roof} />
            </mesh>
            <mesh position={[0.5, 2.41, 0.6]}>
                <boxGeometry args={[1.22, 0.1, 1.42]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[2, 2.05, -0.2]}>
                <boxGeometry args={[1.82, 0.1, 1.82]} />
                <meshStandardMaterial color={COLORS.roof} />
            </mesh>

            {/* Left Roof Top Cuboid */}
            <mesh position={[-1.7, 2.2, -0.2]}>
                <boxGeometry args={[0.8, 0.3, 0.8]} />
                <meshStandardMaterial color={COLORS.roof} />
            </mesh>

            {/* Foundation/Shadow base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

const HMStore3D = () => {
    return (
        <div style={{ width: '100%', height: '500px', cursor: 'grab' }}>
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[0.5, 1.5, 11]} fov={25} />
                <OrbitControls
                    enableZoom={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.8}
                    enablePan={false}
                />

                <ambientLight intensity={1.2} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                <pointLight position={[0.5, 1.7, 2]} intensity={0.8} color="#FFFFFF" />

                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
                    <group rotation={[0, Math.PI / 6, 0]}>
                        <React.Suspense fallback={null}>
                            <Building />
                        </React.Suspense>
                    </group>
                </Float>

                <ContactShadows
                    position={[0, -1, 0]}
                    opacity={0.3}
                    scale={20}
                    blur={3}
                    far={4}
                    color={COLORS.logoRed}
                />

                <Environment preset="studio" />
            </Canvas>
        </div>
    );
};

export default HMStore3D;
