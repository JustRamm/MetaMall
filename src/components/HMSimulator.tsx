import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    PerspectiveCamera,
    Environment,
    Text,
    useKeyboardControls,
    KeyboardControls,
    PointerLockControls,
} from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Move, MousePointer } from 'lucide-react';
import * as THREE from 'three';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import styles from './HMSimulator.module.css';

// --- Types & Constants ---
enum Controls {
    forward = 'forward',
    back = 'back',
    left = 'left',
    right = 'right',
    interact = 'interact',
}

interface Obstacle {
    x: number;
    z: number;
    w: number;
    d: number;
    climbable?: boolean;
}

// Global obstacles for collision and climbing detection
const OBSTACLES: Obstacle[] = [
    { x: 0, z: 15, w: 6.5, d: 4.5 }, // Central Table 1
    { x: -10, z: 1.37, w: 2.5, d: 13.75, climbable: true }, // Escalator Left (Aligned to gap)
    { x: 10, z: 1.37, w: 2.5, d: 13.75, climbable: true }, // Escalator Right (Aligned to gap)
    { x: 0, z: -0.25, w: 6.5, d: 10.5, climbable: true }, // Central Stairs
    { x: -15, z: 25, w: 2, d: 4 }, // Sofa Left
    { x: 15, z: 25, w: 2, d: 4 }, // Sofa Right
    // Fitting Rooms (rotated 90 degrees, side by side along right wall)
    // After rotation and parent group transforms, approximate positions:
    { x: 26.8, z: 11.1, w: 2.2, d: 2.2 }, // Room 1
    { x: 26.8, z: 8.9, w: 2.2, d: 2.2 },  // Room 2
    { x: 26.8, z: 4.5, w: 2.2, d: 2.2 },  // Room 4
    { x: -27.0, z: 25, w: 1.5, d: 8 },    // Billing Area Counter (Fixed with gap)
    // New Merchandising Obstacles
    { x: -20, z: -38, w: 8, d: 2 },        // Window Display Left
    { x: 20, z: -38, w: 8, d: 2 },         // Window Display Right
    { x: -15, z: 15, w: 2.5, d: 1.5 },     // Clothes Table 1
    { x: 15, z: 15, w: 2.5, d: 1.5 },      // Clothes Table 2
    { x: -15, z: 5, w: 2.5, d: 0.5 },      // Hanging Rack 1
    { x: 15, z: 5, w: 2.5, d: 0.5 },       // Hanging Rack 2
    { x: 0, z: -15, w: 1.6, d: 1.6 },      // Circular Rack 1
    { x: -25, z: 5, w: 2, d: 0.5 },        // Accessory Rack 1
    { x: 25, z: 5, w: 2, d: 0.5 },         // Accessory Rack 2
];

// --- Sub-components ---

const Sofa = ({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) => (
    <group position={position} rotation={rotation}>
        <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2, 0.5, 1]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.6, -0.4]}>
            <boxGeometry args={[2, 0.7, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[-0.9, 0.5, 0]}>
            <boxGeometry args={[0.2, 0.6, 1]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0.9, 0.5, 0]}>
            <boxGeometry args={[0.2, 0.6, 1]} />
            <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
    </group>
);

const FittingRoom = ({ position, index }: { position: [number, number, number], index: number }) => {
    const [doorOpen, setDoorOpen] = useState(false);
    const doorRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const [, get] = useKeyboardControls<Controls>();
    const lastInteract = useRef(false);

    useFrame(() => {
        const { interact } = get();

        // Check if player is near this fitting room
        const distance = camera.position.distanceTo(new THREE.Vector3(position[0], camera.position.y, position[2]));

        if (interact && !lastInteract.current && distance < 3) {
            setDoorOpen(!doorOpen);
        }
        lastInteract.current = interact;

        // Animate door
        if (doorRef.current) {
            const targetRotation = doorOpen ? -Math.PI / 2 : 0;
            doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetRotation, 0.1);
        }
    });

    return (
        <group position={position}>
            {/* Floor */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.2, 2.2]} />
                <meshStandardMaterial color="#d4a373" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 1.5, -1.1]}>
                <boxGeometry args={[2.2, 3, 0.1]} />
                <meshStandardMaterial color="#f5f5dc" />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-1.1, 1.5, 0]}>
                <boxGeometry args={[0.1, 3, 2.2]} />
                <meshStandardMaterial color="#f5f5dc" />
            </mesh>

            {/* Right Wall */}
            <mesh position={[1.1, 1.5, 0]}>
                <boxGeometry args={[0.1, 3, 2.2]} />
                <meshStandardMaterial color="#f5f5dc" />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.2, 2.2]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Door Frame */}
            <mesh position={[-1.1, 1.5, 1.1]}>
                <boxGeometry args={[0.1, 3, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[1.1, 1.5, 1.1]}>
                <boxGeometry args={[0.1, 3, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 3, 1.1]}>
                <boxGeometry args={[2.2, 0.1, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Interactive Door */}
            <group ref={doorRef} position={[-1.1, 0, 1.1]}>
                <mesh position={[1.1, 1.5, 0]}>
                    <boxGeometry args={[2.2, 3, 0.08]} />
                    <meshStandardMaterial color="#d4a373" />
                </mesh>
                {/* Door Handle */}
                <mesh position={[2, 1.2, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.15]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>

            {/* Mirror on back wall - Premium reflective finish */}
            <mesh position={[0, 1.8, -1.05]}>
                <planeGeometry args={[0.9, 2.0]} />
                <meshStandardMaterial color="#ffffff" metalness={1.0} roughness={0.0} envMapIntensity={1} />
                {/* Thin frame for mirror */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[0.95, 2.05]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </mesh>

            {/* Bench */}
            <mesh position={[0.6, 0.3, -0.7]}>
                <boxGeometry args={[1, 0.6, 0.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Hooks on side wall */}
            {[0, 0.4, 0.8].map((offset, i) => (
                <group key={i} position={[-1.05, 2.2 - offset, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.15]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            ))}

            {/* Room Number Sign */}
            <Text
                position={[0, 2.6, 1.15]}
                fontSize={0.2}
                color="#333"
                anchorX="center"
                anchorY="middle"
            >
                {index + 1}
            </Text>

            {/* Ceiling Light */}
            <pointLight position={[0, 2.8, 0]} intensity={0.5} color="#fffef0" />
        </group>
    );
};

const DetailedDress = ({ position, rotation, color }: { position: [number, number, number], rotation: [number, number, number], color: string }) => (
    <group position={position} rotation={rotation}>
        <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.05, 0.005, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.25, 0.8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.15]} />
            <meshStandardMaterial color={color} />
        </mesh>
    </group>
);

const WallDisplay = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
    const rows = 4;
    const cols = 15;
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];

    return (
        <group position={position} rotation={rotation}>
            <mesh position={[cols * 0.6 / 2, rows * 1.2 / 2, -0.1]}>
                <boxGeometry args={[cols * 0.6 + 1, rows * 1.2 + 1, 0.1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {Array.from({ length: rows }).map((_, r) => (
                Array.from({ length: cols }).map((_, c) => (
                    <DetailedDress
                        key={`${r}-${c}`}
                        position={[c * 0.6 + 0.3, r * 1.2 + 0.6, 0.1]}
                        rotation={[0, 0, 0]}
                        color={colors[(r + c) % colors.length]}
                    />
                ))
            ))}
        </group>
    );
};

const CentralStairs = () => {
    const stepCount = 30;
    const stepWidth = 6;
    const stepHeight = 0.2;
    const stepDepth = 0.35;

    // Calculate the angle of the stairs
    const stairAngle = Math.atan(stepHeight / stepDepth);
    const railingLength = Math.sqrt((stepCount * stepHeight) ** 3 + (stepCount * stepDepth) ** 2) + 3.7; // Extended by 2 units
    const railingHeight = 1.5; // Half of the original 3
    const railingBaseHeight = 0.5; // Raise the glass a bit from the ground

    return (
        <group position={[0, 0, 5]}>
            {/* Angled Glass Railings following stair slope, matching stair length */}
            <mesh
                position={[-stepWidth / 2 - 0.1, railingHeight / 2 + railingBaseHeight, -stepCount * stepDepth / 2 + 4.5]}
                rotation={[stairAngle, 0, 0]}
            >
                <boxGeometry args={[0.05, railingHeight, railingLength]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
            </mesh>
            <mesh
                position={[stepWidth / 2 + 0.1, railingHeight / 2 + railingBaseHeight, -stepCount * stepDepth / 2 + 4.5]}
                rotation={[stairAngle, 0, 0]}
            >
                <boxGeometry args={[0.05, railingHeight, railingLength]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
            </mesh>
            {/* Steps */}
            {Array.from({ length: stepCount }).map((_, i) => (
                <mesh key={i} position={[0, i * stepHeight + stepHeight / 2, -i * stepDepth]}>
                    <boxGeometry args={[stepWidth, stepHeight, stepDepth + 0.05]} />
                    <meshStandardMaterial color="#d4a373" roughness={0.4} />
                </mesh>
            ))}
        </group>
    );
};

const Escalator = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh rotation={[Math.PI / 6.5, 0, 0]} position={[0, 3.2, -6.875]}>
            <boxGeometry args={[2, 0.5, 15]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[2.2, 0.2, 2]} />
            <meshStandardMaterial color="#111" />
        </mesh>
    </group>
);

const SlidingDoor = ({ position }: { position: [number, number, number] }) => {
    const doorWidth = 3.5; // Width of each door panel
    const doorHeight = 3.5; // Height of the door
    const frameThickness = 0.15;

    return (
        <group position={position}>
            {/* Door Frame - Top */}
            <mesh position={[0, doorHeight, 0]}>
                <boxGeometry args={[doorWidth * 2 + frameThickness * 2, frameThickness, frameThickness]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Door Frame - Left */}
            <mesh position={[-doorWidth - frameThickness / 2, doorHeight / 2, 0]}>
                <boxGeometry args={[frameThickness, doorHeight, frameThickness]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Door Frame - Right */}
            <mesh position={[doorWidth + frameThickness / 2, doorHeight / 2, 0]}>
                <boxGeometry args={[frameThickness, doorHeight, frameThickness]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Door Frame - Bottom Track */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[doorWidth * 2 + frameThickness * 2, 0.05, frameThickness]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Left Door Panel - Closed Position */}
            <group position={[-doorWidth / 2, doorHeight / 2, 0]}>
                {/* Glass Panel */}
                <mesh>
                    <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
                    <meshStandardMaterial
                        color="#88ccff"
                        transparent
                        opacity={0.7}
                        metalness={0.1}
                        roughness={0.1}
                    />
                </mesh>

                {/* Left Panel Frame - Vertical Left */}
                <mesh position={[-doorWidth / 2 + 0.05, 0, 0.05]}>
                    <boxGeometry args={[0.1, doorHeight, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Left Panel Frame - Vertical Right */}
                <mesh position={[doorWidth / 2 - 0.05, 0, 0.05]}>
                    <boxGeometry args={[0.1, doorHeight, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Left Panel Frame - Horizontal Top */}
                <mesh position={[0, doorHeight / 2 - 0.05, 0.05]}>
                    <boxGeometry args={[doorWidth, 0.1, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Left Panel Frame - Horizontal Bottom */}
                <mesh position={[0, -doorHeight / 2 + 0.05, 0.05]}>
                    <boxGeometry args={[doorWidth, 0.1, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Handle - Left Panel */}
                <mesh position={[doorWidth / 2 - 0.3, 0, 0.1]}>
                    <boxGeometry args={[0.05, 0.6, 0.08]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>

            {/* Right Door Panel - Closed Position */}
            <group position={[doorWidth / 2, doorHeight / 2, 0]}>
                {/* Glass Panel */}
                <mesh>
                    <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
                    <meshStandardMaterial
                        color="#88ccff"
                        transparent
                        opacity={0.7}
                        metalness={0.1}
                        roughness={0.1}
                    />
                </mesh>

                {/* Right Panel Frame - Vertical Left */}
                <mesh position={[-doorWidth / 2 + 0.05, 0, 0.05]}>
                    <boxGeometry args={[0.1, doorHeight, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Right Panel Frame - Vertical Right */}
                <mesh position={[doorWidth / 2 - 0.05, 0, 0.05]}>
                    <boxGeometry args={[0.1, doorHeight, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Right Panel Frame - Horizontal Top */}
                <mesh position={[0, doorHeight / 2 - 0.05, 0.05]}>
                    <boxGeometry args={[doorWidth, 0.1, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Right Panel Frame - Horizontal Bottom */}
                <mesh position={[0, -doorHeight / 2 + 0.05, 0.05]}>
                    <boxGeometry args={[doorWidth, 0.1, 0.05]} />
                    <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Handle - Right Panel */}
                <mesh position={[-doorWidth / 2 + 0.3, 0, 0.1]}>
                    <boxGeometry args={[0.05, 0.6, 0.08]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>
        </group>
    );
};

const AirConditioner = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            {/* Main AC Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.5, 0.6, 0.35]} />
                <meshStandardMaterial color="#f5f5f5" metalness={0.3} roughness={0.4} />
            </mesh>

            {/* Front Vent Panel */}
            <mesh position={[0, -0.15, 0.18]}>
                <boxGeometry args={[2.3, 0.25, 0.02]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.6} />
            </mesh>

            {/* Vent Slats */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} position={[-1 + i * 0.28, -0.15, 0.19]}>
                    <boxGeometry args={[0.02, 0.2, 0.01]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.5} />
                </mesh>
            ))}

            {/* Display Panel */}
            <mesh position={[0.9, 0.15, 0.18]}>
                <boxGeometry args={[0.4, 0.15, 0.02]} />
                <meshStandardMaterial color="#1a1a1a" emissive="#00ff00" emissiveIntensity={0.3} />
            </mesh>

            {/* Brand Logo Area */}
            <mesh position={[-0.9, 0.15, 0.18]}>
                <boxGeometry args={[0.5, 0.1, 0.01]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Side Vents */}
            <mesh position={[-1.25, 0, 0]}>
                <boxGeometry args={[0.02, 0.4, 0.3]} />
                <meshStandardMaterial color="#d0d0d0" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[1.25, 0, 0]}>
                <boxGeometry args={[0.02, 0.4, 0.3]} />
                <meshStandardMaterial color="#d0d0d0" metalness={0.2} roughness={0.5} />
            </mesh>

            {/* Bottom Air Flow Indicator */}
            <mesh position={[0, -0.32, 0.1]} rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[2.2, 0.05, 0.15]} />
                <meshStandardMaterial color="#b0b0b0" metalness={0.3} roughness={0.5} />
            </mesh>
        </group>
    );
};

const BillingArea = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Checkout Counter (Moved forward to create walking gap) */}
            <mesh position={[2.5, 0.5, 0]}>
                <boxGeometry args={[1.5, 1, 8]} />
                <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
            </mesh>
            {/* Counter Top (Modern sleek finish) */}
            <mesh position={[2.5, 1.05, 0]}>
                <boxGeometry args={[1.6, 0.1, 8.2]} />
                <meshStandardMaterial color="#d4a373" roughness={0.3} />
            </mesh>

            {/* POS Terminals */}
            {[-2.5, 0, 2.5].map((zPos, i) => (
                <group key={i} position={[2.5, 1.1, zPos]}>
                    {/* Screen Stand */}
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    {/* Monitor */}
                    <mesh position={[0, 0.3, 0.1]} rotation={[-Math.PI / 8, 0, 0]}>
                        <boxGeometry args={[0.6, 0.4, 0.05]} />
                        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Card Reader */}
                    <mesh position={[0.4, 0.05, 0.2]}>
                        <boxGeometry args={[0.15, 0.1, 0.25]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                </group>
            ))}

            {/* Back Wall with Branding (Mounted to building wall) */}
            <mesh position={[0.1, 1.8, 0]}>
                <boxGeometry args={[0.2, 3.6, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </mesh>

            {/* H&M Logo on back wall */}
            <Text
                position={[0.22, 2.5, 0]}
                rotation={[0, Math.PI / 2, 0]}
                fontSize={1.2}
                color="#ff0000"
            >
                H&M
            </Text>
            <Text
                position={[0.22, 1.7, 0]}
                rotation={[0, Math.PI / 2, 0]}
                fontSize={0.25}
                color="#666"
                anchorY="top"
            >
                CHECKOUT
            </Text>

            {/* Accent Lighting overhead */}
            {[-3, 0, 3].map((zPos, i) => (
                <group key={i} position={[2.5, 4.5, zPos]}>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.15, 0.25, 0.2]} />
                        <meshStandardMaterial color="#222" emissive="#fff" emissiveIntensity={0.1} />
                    </mesh>
                    <pointLight intensity={0.6} distance={8} color="#fff" />
                </group>
            ))}
        </group>
    );
};

const DepartmentSign = ({ position, rotation, text }: { position: [number, number, number], rotation: [number, number, number], text: string }) => (
    <group position={position} rotation={rotation}>
        <Text
            fontSize={1.5}
            color="#333"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
            {text}
        </Text>
        <mesh position={[0, -0.1, -0.05]}>
            <boxGeometry args={[text.length * 0.8, 2, 0.1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
    </group>
);

const Mannequin = ({ position, rotation = [0, 0, 0], pose = 0 }: { position: [number, number, number], rotation?: [number, number, number], pose?: number }) => (
    <group position={position} rotation={rotation}>
        {/* Base */}
        <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
            <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Support Rod */}
        <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        {/* Body - stylized */}
        <group position={[0, 1.2, 0]}>
            <mesh position={[0, 0.2, 0]}>
                <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
            </mesh>
            {/* Arms */}
            <mesh position={[0.2, 0.3, 0]} rotation={[0, 0, pose === 1 ? -0.5 : 0.2]}>
                <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            <mesh position={[-0.2, 0.3, 0]} rotation={[0, 0, pose === 2 ? 0.5 : -0.2]}>
                <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>
        </group>
    </group>
);

const SecurityPedestals = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh position={[-2, 0.8, 0]}>
            <boxGeometry args={[0.1, 1.6, 0.3]} />
            <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} />
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.12, 0.1, 0.32]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} />
            </mesh>
        </mesh>
        <mesh position={[2, 0.8, 0]}>
            <boxGeometry args={[0.1, 1.6, 0.3]} />
            <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} />
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.12, 0.1, 0.32]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} />
            </mesh>
        </mesh>
    </group>
);

const CeilingDetails = () => (
    <group position={[0, 15.5, 0]}>
        {/* Main HVAC Ducts */}
        {[-15, 15].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 80, 16]} />
                <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
            </mesh>
        ))}
        {/* Track Lights */}
        {[-25, -10, 0, 10, 25].map((x, i) => (
            <group key={i} position={[x, -0.2, 0]}>
                <mesh>
                    <boxGeometry args={[0.1, 0.05, 80]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Individual light fixtures */}
                {Array.from({ length: 10 }).map((_, j) => (
                    <mesh key={j} position={[0, -0.1, -35 + j * 8]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
                        <meshStandardMaterial color="#333" emissive="#fff" emissiveIntensity={0.5} />
                    </mesh>
                ))}
            </group>
        ))}
    </group>
);

const Elevator = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Shaft Frame - More solid structure */}
        {[[-2.1, -2.1], [2.1, -2.1], [-2.1, 2.1], [2.1, 2.1]].map((p, i) => (
            <mesh key={i} position={[p[0], 8, p[1]]}>
                <boxGeometry args={[0.2, 16, 0.2]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>
        ))}

        {/* Steel Cables (Strings) */}
        {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map((p, i) => (
            <mesh key={i} position={[p[0], 8, p[1]]}>
                <cylinderGeometry args={[0.02, 0.02, 16, 8]} />
                <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
            </mesh>
        ))}

        {/* Mechanical Top Housing (Safe closed structure) */}
        <mesh position={[0, 16.2, 0]}>
            <boxGeometry args={[4.5, 0.5, 4.5]} />
            <meshStandardMaterial color="#333" metalness={0.7} />
        </mesh>

        {/* Glass Cabin */}
        <group position={[0, 1, 0]}>
            {/* Floors - Solid Plate */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.8, 0.2, 3.8]} />
                <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
            {/* Roof - Solid with recessed lighting */}
            <mesh position={[0, 3.1, 0]}>
                <boxGeometry args={[3.8, 0.2, 3.8]} />
                <meshStandardMaterial color="#222" metalness={0.9} />
                <pointLight position={[0, -0.2, 0]} intensity={0.5} distance={5} color="#fff" />
            </mesh>

            {/* Glass Walls - Thicker with slight tint */}
            <mesh position={[0, 1.5, 1.85]}>
                <boxGeometry args={[3.6, 3, 0.1]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.2} metalness={0.5} roughness={0} />
            </mesh>
            <mesh position={[0, 1.5, -1.85]}>
                <boxGeometry args={[3.6, 3, 0.1]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.2} metalness={0.5} roughness={0} />
            </mesh>
            <mesh position={[1.85, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[3.6, 3, 0.1]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.2} metalness={0.5} roughness={0} />
            </mesh>
            <mesh position={[-1.85, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[3.6, 3, 0.1]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.2} metalness={0.5} roughness={0} />
            </mesh>

            {/* Internal Railing */}
            <mesh position={[0, 1.1, 1.7]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 3.4]} />
                <meshStandardMaterial color="silver" metalness={1} />
            </mesh>
        </group>
    </group>
);

const FoldedClothes = ({ position, color }: { position: [number, number, number], color: string }) => (
    <group position={position}>
        {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, i * 0.06, 0]}>
                <boxGeometry args={[0.5, 0.05, 0.4]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
        ))}
    </group>
);

const ClothesTable = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.5, 0.9, 1.5]} />
            <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[2.6, 0.05, 1.6]} />
            <meshStandardMaterial color="#d4a373" />
        </mesh>
        {/* Stacks on table */}
        <FoldedClothes position={[-0.8, 0.95, -0.4]} color="#f87171" />
        <FoldedClothes position={[-0.2, 0.95, -0.4]} color="#60a5fa" />
        <FoldedClothes position={[0.4, 0.95, -0.4]} color="#34d399" />
        <FoldedClothes position={[-0.8, 0.95, 0.4]} color="#fbbf24" />
        <FoldedClothes position={[-0.2, 0.95, 0.4]} color="#a78bfa" />
        <FoldedClothes position={[0.4, 0.95, 0.4]} color="#f472b6" />
    </group>
);

const AccessoryRack = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2, 2.4, 0.1]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        {/* Shelves */}
        {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[0, 0.4 + i * 0.6, 0.2]}>
                <boxGeometry args={[1.8, 0.05, 0.4]} />
                <meshStandardMaterial color="#555" />
                {/* Random accessories (as small boxes) */}
                {Array.from({ length: 3 }).map((_, j) => (
                    <mesh key={j} position={[-0.5 + j * 0.5, 0.1, 0]}>
                        <boxGeometry args={[0.3, 0.2, 0.2]} />
                        <meshStandardMaterial color={['#000', '#fff', '#8B4513'][j % 3]} />
                    </mesh>
                ))}
            </mesh>
        ))}
    </group>
);

const ShoeSection = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        {/* Wall panel */}
        <mesh position={[0, 1.5, -0.05]}>
            <boxGeometry args={[4, 3, 0.1]} />
            <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Shoe shelves */}
        {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, 0.3 + i * 0.6, 0.2]}>
                <boxGeometry args={[3.8, 0.05, 0.4]} />
                <meshStandardMaterial color="#e5e5e5" />
                {/* Stylized shoes */}
                {Array.from({ length: 6 }).map((_, j) => (
                    <group key={j} position={[-1.6 + j * 0.6, 0.1, 0]}>
                        <mesh>
                            <boxGeometry args={[0.3, 0.1, 0.4]} />
                            <meshStandardMaterial color={['#000', '#fff', '#ef4444', '#3b82f6'][j % 4]} />
                        </mesh>
                        <mesh position={[0, 0.1, 0.1]}>
                            <boxGeometry args={[0.25, 0.15, 0.1]} />
                            <meshStandardMaterial color="#ddd" />
                        </mesh>
                    </group>
                ))}
            </mesh>
        ))}
    </group>
);

const HangingRack = ({ position, rotation, isCircular = false }: { position: [number, number, number], rotation: [number, number, number], isCircular?: boolean }) => (
    <group position={position} rotation={rotation}>
        {isCircular ? (
            <>
                <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.8, 0.03, 16, 100]} />
                    <meshStandardMaterial color="#ccc" metalness={1} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.7, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.4]} />
                    <meshStandardMaterial color="#ccc" metalness={1} />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.1]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Sideway clothes */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                        <group key={i} position={[Math.cos(angle) * 0.8, 0.6, Math.sin(angle) * 0.8]} rotation={[0, -angle, 0]}>
                            <mesh>
                                <boxGeometry args={[0.05, 1.0, 0.6]} />
                                <meshStandardMaterial color={['#f87171', '#60a5fa', '#34d399', '#fbbf24'][i % 4]} roughness={0.7} />
                            </mesh>
                        </group>
                    );
                })}
            </>
        ) : (
            <>
                <mesh position={[0, 1.4, 0]}>
                    <boxGeometry args={[2.5, 0.05, 0.05]} />
                    <meshStandardMaterial color="#ccc" metalness={1} roughness={0.1} />
                </mesh>
                <mesh position={[-1.2, 0.7, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.4]} />
                    <meshStandardMaterial color="#ccc" metalness={1} />
                </mesh>
                <mesh position={[1.2, 0.7, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1.4]} />
                    <meshStandardMaterial color="#ccc" metalness={1} />
                </mesh>
                <mesh position={[-1.2, 0.05, 0]}>
                    <boxGeometry args={[0.4, 0.1, 0.4]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[1.2, 0.05, 0]}>
                    <boxGeometry args={[0.4, 0.1, 0.4]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Sideway clothes */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <mesh key={i} position={[-1.1 + i * 0.15, 0.7, 0]}>
                        <boxGeometry args={[0.03, 1.2, 0.7]} />
                        <meshStandardMaterial color={['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'][i % 5]} roughness={0.7} />
                    </mesh>
                ))}
            </>
        )}
    </group>
);

const WindowDisplay = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        {/* Large Glass Window */}
        <mesh position={[0, 2.5, 0.1]}>
            <boxGeometry args={[8, 5, 0.1]} />
            <meshStandardMaterial color="#88ccff" transparent opacity={0.1} metalness={0.9} roughness={0} />
        </mesh>
        {/* Platform inside */}
        <mesh position={[0, 0.25, -1]}>
            <boxGeometry args={[8, 0.5, 2]} />
            <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Mannequins in window */}
        <Mannequin position={[-2, 0.5, -1]} pose={1} rotation={[0, Math.PI / 4, 0]} />
        <Mannequin position={[2, 0.5, -1]} pose={2} rotation={[0, -Math.PI / 4, 0]} />
        <Mannequin position={[0, 0.5, -0.5]} pose={0} />
    </group>
);

const NPC = ({ position, rotation = [0, 0, 0], type = 'staff' }: { position: [number, number, number], rotation?: [number, number, number], type?: 'staff' | 'guard' | 'cashier' }) => {
    const colors = {
        staff: '#333333',
        guard: '#1a365d',
        cashier: '#2d3748'
    };
    return (
        <group position={position} rotation={rotation}>
            {/* Body */}
            <mesh position={[0, 0.9, 0]}>
                <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
                <meshStandardMaterial color={colors[type]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.62, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#f6ad55" />
            </mesh>
            {/* Arms */}
            <mesh position={[0.25, 1.1, 0.05]} rotation={[-0.3, 0, 0]}>
                <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
                <meshStandardMaterial color={colors[type]} />
            </mesh>
            <mesh position={[-0.25, 1.1, 0.05]} rotation={[-0.3, 0, 0]}>
                <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
                <meshStandardMaterial color={colors[type]} />
            </mesh>
            {/* Accessories for type */}
            {type === 'guard' && (
                <mesh position={[0, 1.8, 0.05]}>
                    <boxGeometry args={[0.3, 0.05, 0.3]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
            )}
        </group>
    );
};

const CityBackground = () => (
    <group>
        {/* Sky */}
        <mesh scale={500}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
        </mesh>

        {/* Simple City Skyline */}
        {Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 2;
            const dist = 150 + Math.random() * 50;
            const h = 20 + Math.random() * 80;
            const w = 10 + Math.random() * 15;
            return (
                <mesh
                    key={i}
                    position={[Math.cos(angle) * dist, h / 2 - 10, Math.sin(angle) * dist]}
                >
                    <boxGeometry args={[w, h, w]} />
                    <meshStandardMaterial color="#444" roughness={0.5} />
                </mesh>
            );
        })}
        {/* Distant Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#333" />
        </mesh>
    </group>
);

const StaffDoor = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[2.2, 2.8, 0.1]} />
            <meshStandardMaterial color="#4a5568" metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.4, 0.06]}>
            <boxGeometry args={[1, 0.4, 0.01]} />
            <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text
            position={[0, 2.4, 0.07]}
            fontSize={0.15}
            color="#333"
            anchorX="center"
            anchorY="middle"
        >
            STAFF ONLY
        </Text>
        <mesh position={[0.9, 1.3, 0.06]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#silver" metalness={1} />
        </mesh>
    </group>
);

const ExitSign = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh>
            <boxGeometry args={[1, 0.4, 0.2]} />
            <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
            <planeGeometry args={[0.9, 0.3]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
        </mesh>
        <Text
            position={[0, 0, 0.12]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
        >
            EXIT
        </Text>
    </group>
);

const FireExtinguisher = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
            <meshStandardMaterial color="#e53e3e" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 16]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.85, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.15, 0.6, 0.1]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.03, 0.6, 0.03]} />
            <meshStandardMaterial color="#111" />
        </mesh>
    </group>
);

const Player = () => {
    const { camera } = useThree();
    const [, get] = useKeyboardControls<Controls>();

    // Movement vectors
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const direction = new THREE.Vector3();

    useFrame((state, delta) => {
        const { forward, back, left, right } = get();

        // Realistic walking speed
        const speed = 4.2 * delta;

        // Calculate direction based on camera orientation
        frontVector.set(0, 0, Number(back) - Number(forward));
        sideVector.set(Number(left) - Number(right), 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyQuaternion(camera.quaternion);

        direction.y = 0;
        direction.normalize();

        const newPos = camera.position.clone();
        if (forward || back || left || right) {
            newPos.addScaledVector(direction, speed);
        }

        // --- Collision Detection ---
        let canMove = true;
        const buffer = 0.5;

        for (const obs of OBSTACLES) {
            // Height-aware collision: Ground floor obstacles shouldn't block player on mezzanine
            const isOnMezzanine = camera.position.y > 5.0;
            // Most obstacles are on the ground floor. 
            // Only block if on ground floor, UNLESS it's a mezzanine-specific obstacle (if we add any)
            if (isOnMezzanine && !obs.climbable) continue;

            if (
                newPos.x > obs.x - obs.w / 2 - buffer &&
                newPos.x < obs.x + obs.w / 2 + buffer &&
                newPos.z > obs.z - obs.d / 2 - buffer &&
                newPos.z < obs.z + obs.d / 2 + buffer
            ) {
                // If it's a climbable object, we allow movement as the height logic handles it
                if (!obs.climbable) {
                    canMove = false;
                    break;
                }
            }
        }

        // --- Height Management (Climbing Logic) ---
        let targetY = 1.7; // Standard eye level

        // Central Stairs: Z from 5 down to -5.7, AND within stair width
        if (Math.abs(newPos.x) < 3.2 && newPos.z < 5.2 && newPos.z > -5.7) {
            const t = THREE.MathUtils.clamp((5.0 - newPos.z) / 10.5, 0, 1);
            targetY = 1.7 + (t * 6.0);
        }
        // Escalators: Z from 8.25 down to -5.5, AND within escalator width
        else if (Math.abs(Math.abs(newPos.x) - 10) < 1.4 && newPos.z < 8.45 && newPos.z > -5.7) {
            const t = THREE.MathUtils.clamp((8.25 - newPos.z) / 13.75, 0, 1);
            targetY = 1.7 + (t * 6.0);
        }
        // Mezzanine Level Floor - only if we're already elevated (came from stairs/escalators)
        else if (newPos.z < -5.7 && camera.position.y > 5.0) {
            targetY = 1.7 + 6.0;
        }

        if (canMove) {
            camera.position.x = newPos.x;
            camera.position.z = newPos.z;
            // Precise stair/floor vertical stickiness
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.2);
        }

        // Building Boundary
        camera.position.x = Math.max(-28.5, Math.min(28.5, camera.position.x));
        camera.position.z = Math.max(-38.5, Math.min(38.5, camera.position.z));
    });

    return null;
};

// --- Main Store Scene ---

export const RetailStoreLevel = () => {
    return (
        <group>
            {/* Outside Environment */}
            <CityBackground />

            {/* Ground Floor - Diverse Materials */}
            {/* Main Marble Walkway */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[10, 80]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.1} metalness={0.2} />
            </mesh>

            {/* Left Wing - Wood Flooring (Women's section) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, -0.01, 0]} receiveShadow>
                <planeGeometry args={[30, 80]} />
                <meshStandardMaterial color="#8B4513" roughness={0.4} />
            </mesh>

            {/* Right Wing - Polished Concrete/Marble (Men's section) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, -0.01, 0]} receiveShadow>
                <planeGeometry args={[30, 80]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Ground Grid overlay for visual scale */}
            <gridHelper args={[100, 50, "#e8e1d2", "#e8e1d2"]} position={[0, 0.01, 0]} />

            {/* Building Enclosure */}
            <mesh position={[0, 16, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[60, 80]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 8, -40]}>
                <boxGeometry args={[60, 16, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-30, 8, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[80, 16, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[30, 8, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <boxGeometry args={[80, 16, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 8, 40]}>
                <boxGeometry args={[60, 16, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Sliding Door - Entrance on back wall (opposite to sofas) */}
            <group>
                <group rotation={[0, Math.PI, 0]}>
                    <SlidingDoor position={[0, 0, -39.5]} />
                </group>
                {/* 2 AC Units above the door faced correct way */}
                <AirConditioner position={[-3, 4.2, -39.3]} />
                <AirConditioner position={[3, 4.2, -39.3]} />
            </group>

            {/* Mezzanine (Second Floor) */}
            <group position={[0, 6.0, -22.75]}>
                <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[60, 0.1, 34.5]} />
                    <meshStandardMaterial color="#f5f5dc" roughness={0.2} metalness={0.1} />
                </mesh>
                {/* Horizontal Tile Grid for Second Floor */}
                <gridHelper args={[34.5, 17, "#e8e1d2", "#e8e1d2"]} position={[0, 0.01, 0]} />
                <WallDisplay position={[-25, 0, -10]} rotation={[0, 0, 0]} />
                <WallDisplay position={[5, 0, -10]} rotation={[0, 0, 0]} />

                {/* Railing segments with gaps */}
                <group position={[0, 0.6, 17.25]}>
                    <mesh position={[-20.5, 0, 0]}>
                        <boxGeometry args={[19, 1.2, 0.05]} />
                        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[-6, 0, 0]}>
                        <boxGeometry args={[6, 1.2, 0.05]} />
                        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[6, 0, 0]}>
                        <boxGeometry args={[6, 1.2, 0.05]} />
                        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[20.5, 0, 0]}>
                        <boxGeometry args={[19, 1.2, 0.05]} />
                        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} />
                    </mesh>
                </group>

                {/* AC Units on Mezzanine Level */}
                {/* Back Wall ACs */}
                <AirConditioner position={[-10, 3.8, -17.1]} />
                <AirConditioner position={[10, 3.8, -17.1]} />

                {/* Left Wall ACs */}
                <group rotation={[0, Math.PI / 2, 0]} position={[-29.8, 3.8, -2.5]}>
                    <AirConditioner position={[0, 0, 0]} />
                    <AirConditioner position={[0, 0, 15]} />
                </group>

                {/* Right Wall ACs */}
                <group rotation={[0, -Math.PI / 2, 0]} position={[29.8, 3.8, -2.5]}>
                    <AirConditioner position={[0, 0, 0]} />
                    <AirConditioner position={[0, 0, 15]} />
                </group>

                {/* Front Railing ACs - facing inwards (-Z) */}
                <group rotation={[0, Math.PI, 0]}>
                    <AirConditioner position={[-15, 3.8, 17.1]} />
                    <AirConditioner position={[15, 3.8, 17.1]} />
                </group>
            </group>

            <CentralStairs />
            {/* Escalators shifted forward significantly to align with mezzanine gaps */}
            <Escalator position={[-10, 0, 8.25]} />
            <Escalator position={[10, 0, 8.25]} />

            <WallDisplay position={[-29.4, 0, -20]} rotation={[0, Math.PI / 2, 0]} />
            <WallDisplay position={[-29.4, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
            <WallDisplay position={[-29.4, 0, 10]} rotation={[0, Math.PI / 2, 0]} />

            {/* Billing Area on Left Wall - Fixed to building wall with walking gap */}
            <BillingArea position={[-29.5, 0, 25]} rotation={[0, 0, 0]} />

            <Sofa position={[-15, 0, 25]} rotation={[0, Math.PI / 6, 0]} color="#b22222" />
            <Sofa position={[15, 0, 25]} rotation={[0, -Math.PI / 6, 0]} color="#5d4037" />

            {/* Fitting Rooms - Right Side (Side-by-side along wall) */}
            <group position={[27.9, 0, 10]} rotation={[0, Math.PI, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                    <FittingRoom position={[-1.1, 0, 0]} index={0} />
                </group>
                <group rotation={[0, Math.PI / 2, 0]}>
                    <FittingRoom position={[1.1, 0, 0]} index={1} />
                </group>
                <group rotation={[0, Math.PI / 2, 0]}>
                    <FittingRoom position={[3.3, 0, 0]} index={2} />
                </group>
                <group rotation={[0, Math.PI / 2, 0]}>
                    <FittingRoom position={[5.5, 0, 0]} index={3} />
                </group>
            </group>

            <group position={[0, 0, 15]}>
                <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[6, 0.8, 4]} />
                    <meshStandardMaterial color="#fff" />
                </mesh>
                <DetailedDress position={[-1.5, 1, 0]} rotation={[0, Math.PI / 2, 0]} color="#ff7eb9" />
                <DetailedDress position={[1.5, 1, 0]} rotation={[0, -Math.PI / 2, 0]} color="#7afcff" />
            </group>

            <Text position={[29.4, 13, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={6} color="#ff0000">H&M</Text>

            {/* Ceiling Details (Ducts & Track Lights) */}
            <CeilingDetails />

            {/* Exit Signs */}
            <ExitSign position={[0, 4, -39.3]} rotation={[0, 0, 0]} /> {/* Above Front Door */}
            <ExitSign position={[-29.4, 3, 35]} rotation={[0, Math.PI / 2, 0]} /> {/* Above Ground Staff Door */}
            <ExitSign position={[0, 9.8, -39.3]} rotation={[0, 0, 0]} /> {/* Above Mezzanine Back Door */}

            {/* Staff Only Doors */}
            <StaffDoor position={[-29.9, 0, 35]} rotation={[0, Math.PI / 2, 0]} /> {/* Ground Floor Back */}
            <StaffDoor position={[0, 6.0, -39.9]} rotation={[0, 0, 0]} /> {/* Mezzanine Back Wall */}

            {/* Fire Safety Equipment */}
            <FireExtinguisher position={[-29.5, 0, 20]} /> {/* Near Billing */}
            <FireExtinguisher position={[29.5, 0, 15]} /> {/* Near Fitting Rooms */}
            <FireExtinguisher position={[-25, 6, -5]} />  {/* Mezzanine Left */}
            <FireExtinguisher position={[25, 6, -5]} />   {/* Mezzanine Right */}

            {/* Entrance Security Pedestals */}
            <SecurityPedestals position={[0, 0, -38.5]} />

            {/* Department Signage */}
            <DepartmentSign position={[-25, 12, -39.4]} rotation={[0, 0, 0]} text="WOMEN" />
            <DepartmentSign position={[25, 12, -39.4]} rotation={[0, 0, 0]} text="MEN" />
            <DepartmentSign position={[-29.4, 12, -10]} rotation={[0, Math.PI / 2, 0]} text="DIVIDED" />
            <DepartmentSign position={[29.4, 12, -15]} rotation={[0, -Math.PI / 2, 0]} text="HOME" />

            {/* Mannequin Groups */}
            <group position={[-5, 0, -35]}>
                <Mannequin position={[-1, 0, 0]} pose={1} />
                <Mannequin position={[1, 0, 0]} pose={2} />
                <Mannequin position={[0, 0, 1]} pose={0} />
            </group>
            <group position={[18, 0, -15]}>
                <Mannequin position={[-1, 0, 0]} pose={2} />
                <Mannequin position={[1, 0, 0]} pose={1} rotation={[0, -Math.PI / 4, 0]} />
            </group>
            <group position={[23, 6, -15]}>
                <Mannequin position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} pose={1} />
            </group>

            {/* Glass Elevator */}
            <Elevator position={[22, 0, 0]} />

            {/* Merchandising & Products Placement */}

            {/* Ground Floor - Central & Side Areas */}
            <ClothesTable position={[-15, 0, 15]} rotation={[0, 0, 0]} />
            <ClothesTable position={[15, 0, 15]} rotation={[0, 0, 0]} />

            <HangingRack position={[-15, 0, 5]} rotation={[0, 0, 0]} />
            <HangingRack position={[15, 0, 5]} rotation={[0, 0, 0]} />

            <HangingRack position={[0, 0, -15]} rotation={[0, 0, 0]} isCircular={true} />

            <AccessoryRack position={[-29, 0, 5]} rotation={[0, Math.PI / 2, 0]} />
            <AccessoryRack position={[29, 0, 5]} rotation={[0, -Math.PI / 2, 0]} />

            <ShoeSection position={[-29.4, 0, -12]} rotation={[0, Math.PI / 2, 0]} />
            <ShoeSection position={[29.4, 0, -12]} rotation={[0, -Math.PI / 2, 0]} />

            {/* Mezzanine Merchandising */}
            <group position={[0, 6.0, -22.75]}>
                <ClothesTable position={[-20, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
                <ClothesTable position={[20, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
                <HangingRack position={[0, 0, 5]} rotation={[0, Math.PI / 2, 0]} />
                <ShoeSection position={[-25, 0, 10]} rotation={[0, 0, 0]} />
                <ShoeSection position={[15, 0, 10]} rotation={[0, 0, 0]} />
            </group>

            {/* Front Window Displays */}
            <WindowDisplay position={[-20, 0, -38.5]} rotation={[0, 0, 0]} />
            <WindowDisplay position={[20, 0, -38.5]} rotation={[0, 0, 0]} />

            {/* NPCs Implementation */}
            {/* Watchman at the sliding door */}
            <NPC position={[0, 0, -37]} rotation={[0, 0, 0]} type="guard" />

            {/* Cashier at the billing desk */}
            <NPC position={[-28.5, 0, 25]} rotation={[0, Math.PI / 2, 0]} type="cashier" />

            {/* Store Associates - Scattered */}
            <NPC position={[-15, 0, 10]} rotation={[0, Math.PI / 4, 0]} type="staff" />
            <NPC position={[15, 0, -10]} rotation={[0, -Math.PI / 2, 0]} type="staff" />
            <NPC position={[-10, 6, -10]} rotation={[0, Math.PI, 0]} type="staff" />
            <NPC position={[20, 6, 5]} rotation={[0, -Math.PI / 4, 0]} type="staff" />

            <ambientLight intensity={0.7} />
            <directionalLight position={[20, 30, 20]} intensity={1.0} />
        </group>
    );
};

export default function HMSimulator() {
    const navigate = useNavigate();

    const map = useMemo(() => [
        { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
        { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
        { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
        { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
        { name: Controls.interact, keys: ['KeyZ'] },
    ], []);

    return (
        <KeyboardControls map={map}>
            <div className={styles.simulatorContainer}>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 1.7, 35]} fov={60} />
                    <PointerLockControls />
                    <Player />

                    <React.Suspense fallback={null}>
                        <RetailStoreLevel />
                        <Environment preset="city" />
                    </React.Suspense>

                    <EffectComposer>
                        <SSAO intensity={1.5} radius={0.4} luminanceInfluence={0.5} />
                        <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.9} intensity={0.5} />
                    </EffectComposer>
                </Canvas>

                <div className={styles.uiOverlay}>
                    <h1>H&M Flagship Store</h1>
                    <p>Press Z near fitting rooms to open doors</p>
                </div>

                <div className={styles.controlsHint}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Move size={18} />
                            <span>WASD / Arrows</span>
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <MousePointer size={18} />
                            <span>Mouse Look</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/home')}
                    className={styles.exitButton}
                >
                    <ArrowLeft size={18} />
                    Exit Simulator
                </button>
            </div>
        </KeyboardControls>
    );
}
