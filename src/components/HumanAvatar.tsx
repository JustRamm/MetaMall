import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HumanAvatarProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    avatarType?: string;
    isMoving?: boolean;
    direction?: string;
    username?: string;
    isCurrentUser?: boolean;
}

// Avatar type configurations
const AVATAR_CONFIGS = {
    default: {
        skinColor: '#ffdbac',
        hairColor: '#2c1810',
        shirtColor: '#4a90e2',
        pantsColor: '#2c3e50',
    },
    sporty: {
        skinColor: '#f4c2a0',
        hairColor: '#1a0f08',
        shirtColor: '#e74c3c',
        pantsColor: '#34495e',
    },
    elegant: {
        skinColor: '#ffe0bd',
        hairColor: '#5d4037',
        shirtColor: '#9b59b6',
        pantsColor: '#2c2c2c',
    },
    casual: {
        skinColor: '#ffd5b5',
        hairColor: '#8b4513',
        shirtColor: '#27ae60',
        pantsColor: '#3498db',
    },
    professional: {
        skinColor: '#f5d0a9',
        hairColor: '#1c1c1c',
        shirtColor: '#ffffff',
        pantsColor: '#1a1a1a',
    },
    vibrant: {
        skinColor: '#ffcba4',
        hairColor: '#ff6b9d',
        shirtColor: '#ffd700',
        pantsColor: '#ff1493',
    },
};

const HumanAvatar: React.FC<HumanAvatarProps> = ({
    position,
    rotation = [0, 0, 0],
    avatarType = 'default',
    isMoving = false,
    direction = 'down',
    username = '',
    isCurrentUser = false,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Mesh>(null);
    const rightLegRef = useRef<THREE.Mesh>(null);
    const leftArmRef = useRef<THREE.Mesh>(null);
    const rightArmRef = useRef<THREE.Mesh>(null);

    const config = AVATAR_CONFIGS[avatarType as keyof typeof AVATAR_CONFIGS] || AVATAR_CONFIGS.default;

    // Animation for walking
    useFrame((state) => {
        if (isMoving && leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            const time = state.clock.getElapsedTime();
            const walkSpeed = 4;
            const walkAngle = Math.sin(time * walkSpeed) * 0.3;

            // Leg animation
            leftLegRef.current.rotation.x = walkAngle;
            rightLegRef.current.rotation.x = -walkAngle;

            // Arm animation (opposite to legs)
            leftArmRef.current.rotation.x = -walkAngle * 0.5;
            rightArmRef.current.rotation.x = walkAngle * 0.5;

            // Slight body bob
            if (groupRef.current) {
                groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * walkSpeed * 2)) * 0.05;
            }
        } else if (groupRef.current) {
            groupRef.current.position.y = position[1];
        }
    });

    // Calculate rotation based on direction
    const getRotationY = () => {
        switch (direction) {
            case 'up': return Math.PI;
            case 'down': return 0;
            case 'left': return Math.PI / 2;
            case 'right': return -Math.PI / 2;
            default: return 0;
        }
    };

    return (
        <group ref={groupRef} position={position} rotation={[rotation[0], getRotationY(), rotation[2]]} scale={0.35}>
            {/* Username label */}
            {username && (
                <mesh position={[0, 2.2, 0]}>
                    <planeGeometry args={[1.5, 0.3]} />
                    <meshBasicMaterial color={isCurrentUser ? '#4CAF50' : '#2196F3'} transparent opacity={0.8} />
                </mesh>
            )}

            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={config.skinColor} />
            </mesh>

            {/* Hair */}
            <mesh position={[0, 1.85, 0]} castShadow>
                <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={config.hairColor} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.08, 1.75, 0.18]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[-0.08, 1.75, 0.18]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
                <meshStandardMaterial color={config.skinColor} />
            </mesh>

            {/* Torso (Shirt) */}
            <mesh position={[0, 1.15, 0]} castShadow>
                <boxGeometry args={[0.5, 0.7, 0.3]} />
                <meshStandardMaterial color={config.shirtColor} />
            </mesh>

            {/* Left Arm */}
            <group position={[0.3, 1.3, 0]}>
                <mesh ref={leftArmRef} position={[0, -0.25, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
                    <meshStandardMaterial color={config.shirtColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshStandardMaterial color={config.skinColor} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group position={[-0.3, 1.3, 0]}>
                <mesh ref={rightArmRef} position={[0, -0.25, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
                    <meshStandardMaterial color={config.shirtColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.55, 0]} castShadow>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshStandardMaterial color={config.skinColor} />
                </mesh>
            </group>

            {/* Pelvis */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.4, 0.2, 0.25]} />
                <meshStandardMaterial color={config.pantsColor} />
            </mesh>

            {/* Left Leg */}
            <group position={[0.12, 0.65, 0]}>
                <mesh ref={leftLegRef} position={[0, -0.3, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.09, 0.6, 8]} />
                    <meshStandardMaterial color={config.pantsColor} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.65, 0.08]} castShadow>
                    <boxGeometry args={[0.12, 0.08, 0.25]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </group>

            {/* Right Leg */}
            <group position={[-0.12, 0.65, 0]}>
                <mesh ref={rightLegRef} position={[0, -0.3, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.09, 0.6, 8]} />
                    <meshStandardMaterial color={config.pantsColor} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.65, 0.08]} castShadow>
                    <boxGeometry args={[0.12, 0.08, 0.25]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </group>

            {/* Highlight for current user */}
            {isCurrentUser && (
                <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.6, 32]} />
                    <meshBasicMaterial color="#4CAF50" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
};

export default HumanAvatar;
export { AVATAR_CONFIGS };
