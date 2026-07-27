// Projectile.tsx - Combat projectile animation

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AttackAction } from './combatTypes';

interface ProjectileProps {
    attack: AttackAction;
    onComplete: (id: string) => void;
    cellSize: number;
    cellGap: number;
}

export const Projectile: React.FC<ProjectileProps> = ({
    attack,
    onComplete,
    cellSize,
    cellGap
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [completed, setCompleted] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useFrame((state, delta) => {
        if (completed) return;

        const newElapsed = elapsed + delta;
        setElapsed(newElapsed);

        const progress = Math.min(newElapsed / attack.duration, 1);

        const x = attack.startPos.x + (attack.endPos.x - attack.startPos.x) * progress;
        const y = attack.startPos.y + (attack.endPos.y - attack.startPos.y) * progress;

        if (meshRef.current) {
            meshRef.current.position.x = x * (cellSize + cellGap);
            meshRef.current.position.y = y * (cellSize + cellGap);
        }

        if (progress >= 1) {
            setCompleted(true);
            onComplete(attack.id);
        }
    });

    const color = attack.attackType === 'melee' ? '#ff0000' :
        attack.attackType === 'magic' ? '#9370DB' : '#ffaa00';

    return (
        <mesh ref={meshRef} position={[0, 0, 0.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1}
            />
        </mesh>
    );
};