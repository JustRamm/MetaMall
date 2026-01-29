import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import HumanAvatar from './HumanAvatar';

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

const OBSTACLES: Obstacle[] = [
    { x: 0, z: 15, w: 6.5, d: 4.5 },
    { x: -10, z: 1.37, w: 2.5, d: 13.75, climbable: true },
    { x: 10, z: 1.37, w: 2.5, d: 13.75, climbable: true },
    { x: 0, z: -0.25, w: 6.4, d: 10.5, climbable: true },
    { x: -29.5, z: 25, w: 1, d: 5 },
    { x: 22, z: 0, w: 4.5, d: 4.5 },
    { x: -15, z: 25, w: 2, d: 1.5 },
    { x: 15, z: 25, w: 2, d: 1.5 },
    { x: 27.9, z: 10, w: 2, d: 9 },
    { x: -15, z: 15, w: 2.6, d: 1.6 },
    { x: 15, z: 15, w: 2.6, d: 1.6 },
    { x: -15, z: 5, w: 2.5, d: 0.5 },
    { x: 15, z: 5, w: 2.5, d: 0.5 },
    { x: 0, z: -15, w: 1.6, d: 1.6 },
    { x: -25, z: 5, w: 2, d: 0.5 },
    { x: 25, z: 5, w: 2, d: 0.5 },
];

interface MultiplayerPlayerProps {
    username: string;
    avatarType: string;
    onPositionUpdate?: (x: number, y: number, direction: string, isMoving: boolean) => void;
}

const MultiplayerPlayer: React.FC<MultiplayerPlayerProps> = ({
    username,
    avatarType,
    onPositionUpdate,
}) => {
    const { camera } = useThree();
    const [, get] = useKeyboardControls<Controls>();
    const lastPositionRef = useRef({ x: 0, z: 0 });
    const lastDirectionRef = useRef('down');
    const updateIntervalRef = useRef(0);

    // Smooth avatar position and rotation
    const avatarPosRef = useRef(new THREE.Vector3(0, 0, -2));
    const avatarRotRef = useRef(0);
    const targetRotRef = useRef(0);

    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const direction = new THREE.Vector3();

    useFrame((state, delta) => {
        const { forward, back, left, right } = get();

        const speed = 4.2 * delta;

        frontVector.set(0, 0, Number(back) - Number(forward));
        sideVector.set(Number(left) - Number(right), 0, 0);

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyQuaternion(camera.quaternion);

        direction.y = 0;
        direction.normalize();

        const newPos = camera.position.clone();
        const isMoving = forward || back || left || right;

        if (isMoving) {
            newPos.addScaledVector(direction, speed);
        }

        let directionString = lastDirectionRef.current;
        if (isMoving) {
            const angle = Math.atan2(direction.x, direction.z);
            if (angle > -Math.PI / 4 && angle <= Math.PI / 4) {
                directionString = 'down';
            } else if (angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
                directionString = 'right';
            } else if (angle > (3 * Math.PI) / 4 || angle <= -(3 * Math.PI) / 4) {
                directionString = 'up';
            } else {
                directionString = 'left';
            }
            lastDirectionRef.current = directionString;

            // Smooth rotation target
            targetRotRef.current = Math.atan2(direction.x, direction.z);
        }

        let canMove = true;
        const buffer = 0.5;

        for (const obs of OBSTACLES) {
            const isOnMezzanine = camera.position.y > 5.0;
            if (isOnMezzanine && !obs.climbable) continue;

            if (
                newPos.x > obs.x - obs.w / 2 - buffer &&
                newPos.x < obs.x + obs.w / 2 + buffer &&
                newPos.z > obs.z - obs.d / 2 - buffer &&
                newPos.z < obs.z + obs.d / 2 + buffer
            ) {
                if (!obs.climbable) {
                    canMove = false;
                    break;
                }
            }
        }

        let targetY = 1.7;

        if (Math.abs(newPos.x) < 3.2 && newPos.z < 5.2 && newPos.z > -5.7) {
            const t = THREE.MathUtils.clamp((5.0 - newPos.z) / 10.5, 0, 1);
            targetY = 1.7 + t * 6.0;
        }
        else if (Math.abs(Math.abs(newPos.x) - 10) < 1.4 && newPos.z < 8.45 && newPos.z > -5.7) {
            const t = THREE.MathUtils.clamp((8.25 - newPos.z) / 13.75, 0, 1);
            targetY = 1.7 + t * 6.0;
        }
        else if (newPos.z < -5.7 && camera.position.y > 5.0) {
            targetY = 1.7 + 6.0;
        }

        if (canMove) {
            camera.position.x = newPos.x;
            camera.position.z = newPos.z;
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.2);
        }

        camera.position.x = Math.max(-28.5, Math.min(28.5, camera.position.x));
        camera.position.z = Math.max(-38.5, Math.min(38.5, camera.position.z));

        // Smooth avatar position update (positioned in front of camera)
        const avatarOffset = new THREE.Vector3(0, -1.7, -2);
        const targetAvatarPos = avatarOffset.clone().applyQuaternion(camera.quaternion).add(camera.position);

        // Smooth interpolation for position
        avatarPosRef.current.lerp(targetAvatarPos, 0.15);

        // Smooth interpolation for rotation
        avatarRotRef.current = THREE.MathUtils.lerp(avatarRotRef.current, targetRotRef.current, 0.2);

        updateIntervalRef.current += delta;
        if (updateIntervalRef.current > 0.1) {
            updateIntervalRef.current = 0;

            const posChanged =
                Math.abs(camera.position.x - lastPositionRef.current.x) > 0.1 ||
                Math.abs(camera.position.z - lastPositionRef.current.z) > 0.1;

            if (posChanged || isMoving) {
                lastPositionRef.current = { x: camera.position.x, z: camera.position.z };
                onPositionUpdate?.(camera.position.x, camera.position.z, directionString, isMoving);
            }
        }
    });

    return (
        <HumanAvatar
            position={[avatarPosRef.current.x, camera.position.y - 1.7, avatarPosRef.current.z]}
            rotation={[0, avatarRotRef.current, 0]}
            avatarType={avatarType}
            isMoving={get().forward || get().back || get().left || get().right}
            direction={lastDirectionRef.current}
            username={username}
            isCurrentUser={true}
        />
    );
};

export default MultiplayerPlayer;
