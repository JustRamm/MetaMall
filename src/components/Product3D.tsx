import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../lib/supabaseClient';

interface Product3DProps {
    product: Product;
    playerPosition: THREE.Vector3;
    onSelect: (product: Product) => void;
    isSelected: boolean;
}

const Product3D: React.FC<Product3DProps> = ({
    product,
    playerPosition,
    onSelect,
    isSelected,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isNearby, setIsNearby] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Product position from database
    const productPos = new THREE.Vector3(product.position_x, 1, product.position_y);

    // Load product image texture
    const texture = useMemo(() => {
        if (!product.image_url || imageError) return null;

        const loader = new THREE.TextureLoader();
        const tex = loader.load(
            product.image_url,
            undefined,
            undefined,
            () => setImageError(true) // On error, fall back to color
        );
        return tex;
    }, [product.image_url, imageError]);

    useFrame(() => {
        if (!meshRef.current) return;

        // Check distance to player
        const distance = playerPosition.distanceTo(productPos);
        const proximityThreshold = 5; // 5 units for better visibility

        setIsNearby(distance < proximityThreshold);

        // Gentle floating animation when nearby
        if (isNearby || isSelected) {
            meshRef.current.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.08;
        } else {
            meshRef.current.position.y = 1;
        }

        // Slow rotation when nearby
        if (isNearby) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    // Color based on product category or random
    const getProductColor = () => {
        const colors = ['#ff6b9d', '#4a90e2', '#50c878', '#ffd700', '#9b59b6', '#e74c3c'];
        const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const handleClick = () => {
        onSelect(product);
    };

    return (
        <group position={[product.position_x, 0, product.position_y]}>
            {/* Product mesh with image or color */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'default'}
            >
                <boxGeometry args={[0.7, 0.9, 0.4]} />
                {texture ? (
                    <meshStandardMaterial
                        map={texture}
                        emissive={isNearby || isSelected ? '#ffffff' : '#000000'}
                        emissiveIntensity={isNearby || isSelected ? 0.3 : 0}
                        roughness={0.5}
                        metalness={0.1}
                    />
                ) : (
                    <meshStandardMaterial
                        color={getProductColor()}
                        emissive={isNearby || isSelected ? getProductColor() : '#000000'}
                        emissiveIntensity={isNearby || isSelected ? 0.4 : 0}
                        roughness={0.6}
                        metalness={0.2}
                    />
                )}
            </mesh>

            {/* Highlight ring when nearby */}
            {isNearby && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.7, 0.85, 32]} />
                    <meshBasicMaterial
                        color="#4CAF50"
                        transparent
                        opacity={0.7}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Selected ring */}
            {isSelected && (
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.9, 1.05, 32]} />
                    <meshBasicMaterial
                        color="#FFD700"
                        transparent
                        opacity={0.9}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Product name - ALWAYS visible */}
            <Text
                position={[0, 1.7, 0]}
                fontSize={0.13}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                maxWidth={2.5}
            >
                {product.name}
            </Text>

            {/* Price tag - ALWAYS visible */}
            <Text
                position={[0, 1.45, 0]}
                fontSize={0.14}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                ${Number(product.price).toFixed(2)}
            </Text>

            {/* Interaction hint when nearby */}
            {isNearby && (
                <Text
                    position={[0, 1.2, 0]}
                    fontSize={0.1}
                    color="#4CAF50"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.015}
                    outlineColor="#000000"
                >
                    Click for Details
                </Text>
            )}
        </group>
    );
};

export default Product3D;
