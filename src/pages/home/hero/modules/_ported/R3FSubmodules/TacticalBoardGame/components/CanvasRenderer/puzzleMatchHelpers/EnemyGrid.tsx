// EnemyGrid.tsx - Enemy grid and unit rendering

import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import type { CombatUnit } from './puzzleMatchHelpers/combatTypes';

interface CombatUnitMeshProps {
    unit: CombatUnit;
    cellSize: number;
    cellGap: number;
}

export const CombatUnitMesh: React.FC<CombatUnitMeshProps> = ({ unit, cellSize, cellGap }) => {
    const hpPercent = unit.currentStats.hitpoints / unit.currentStats.maxHitpoints;
    const barColor = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';

    return (
        <group position={[
            unit.position.x * (cellSize + cellGap),
            unit.position.y * (cellSize + cellGap),
            0
        ]}>
            <mesh>
                <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
                <meshStandardMaterial color={unit.color} metalness={0.3} roughness={0.7} />
            </mesh>

            <Text
                position={[0, 0, 0.01]}
                fontSize={cellSize * 0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {unit.name.substring(0, 3)}
            </Text>

            {/* HP Bar */}
            <mesh position={[0, cellSize * 0.5, 0.01]}>
                <planeGeometry args={[cellSize * 0.8 * hpPercent, cellSize * 0.1]} />
                <meshBasicMaterial color={barColor} />
            </mesh>

            {/* HP Bar Background */}
            <mesh position={[0, cellSize * 0.5, 0.005]}>
                <planeGeometry args={[cellSize * 0.8, cellSize * 0.1]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Level indicator */}
            <Text
                position={[0, -cellSize * 0.4, 0.01]}
                fontSize={cellSize * 0.15}
                color="#ffff00"
                anchorX="center"
                anchorY="middle"
            >
                Lv{unit.level}
            </Text>
        </group>
    );
};

interface EnemyGridProps {
    enemyUnits: CombatUnit[];
    gridCols: number;
    gridRows: number;
    cellSize: number;
    cellGap: number;
    xOffset: number;
}

export const EnemyGrid: React.FC<EnemyGridProps> = ({
    enemyUnits,
    gridCols,
    gridRows,
    cellSize,
    cellGap,
    xOffset
}) => {
    const gridCells = useMemo(() => {
        const cells = [];
        for (let x = 0; x < gridCols; x++) {
            for (let y = 0; y < gridRows; y++) {
                cells.push(
                    <mesh
                        key={`enemy-cell-${x}-${y}`}
                        position={[
                            x * (cellSize + cellGap),
                            y * (cellSize + cellGap),
                            -0.01
                        ]}
                    >
                        <planeGeometry args={[cellSize, cellSize]} />
                        <meshStandardMaterial color="#2a1a1a" />
                    </mesh>
                );
            }
        }
        return cells;
    }, [gridCols, gridRows, cellSize, cellGap]);

    return (
        <group position={[xOffset, 0, 0]}>
            {gridCells}
            {enemyUnits.map(unit => (
                <CombatUnitMesh
                    key={unit.id}
                    unit={unit}
                    cellSize={cellSize}
                    cellGap={cellGap}
                />
            ))}
        </group>
    );
};

interface CombatUnitMeshProps {
    unit: CombatUnit;
    cellSize: number;
    cellGap: number;
}

export const CombatUnitMesh: React.FC<CombatUnitMeshProps> = ({ unit, cellSize, cellGap }) => {
    const hpPercent = unit.currentStats.hitpoints / unit.currentStats.maxHitpoints;
    const barColor = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffaa00' : '#ff0000';

    return (
        <group position={[
            unit.position.x * (cellSize + cellGap),
            unit.position.y * (cellSize + cellGap),
            0
        ]}>
            <mesh>
                <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
                <meshStandardMaterial color={unit.color} metalness={0.3} roughness={0.7} />
            </mesh>

            <Text
                position={[0, 0, 0.01]}
                fontSize={cellSize * 0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {unit.name.substring(0, 3)}
            </Text>

            {/* HP Bar */}
            <mesh position={[0, cellSize * 0.5, 0.01]}>
                <planeGeometry args={[cellSize * 0.8 * hpPercent, cellSize * 0.1]} />
                <meshBasicMaterial color={barColor} />
            </mesh>

            {/* HP Bar Background */}
            <mesh position={[0, cellSize * 0.5, 0.005]}>
                <planeGeometry args={[cellSize * 0.8, cellSize * 0.1]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Level indicator */}
            <Text
                position={[0, -cellSize * 0.4, 0.01]}
                fontSize={cellSize * 0.15}
                color="#ffff00"
                anchorX="center"
                anchorY="middle"
            >
                Lv{unit.level}
            </Text>
        </group>
    );
};

interface EnemyGridProps {
    enemyUnits: CombatUnit[];
    gridCols: number;
    gridRows: number;
    cellSize: number;
    cellGap: number;
    xOffset: number;
}

export const EnemyGrid: React.FC<EnemyGridProps> = ({
    enemyUnits,
    gridCols,
    gridRows,
    cellSize,
    cellGap,
    xOffset
}) => {
    const gridCells = useMemo(() => {
        const cells = [];
        for (let x = 0; x < gridCols; x++) {
            for (let y = 0; y < gridRows; y++) {
                cells.push(
                    <mesh
                        key={`enemy-cell-${x}-${y}`}
                        position={[
                            x * (cellSize + cellGap),
                            y * (cellSize + cellGap),
                            -0.01
                        ]}
                    >
                        <planeGeometry args={[cellSize, cellSize]} />
                        <meshStandardMaterial color="#2a1a1a" />
                    </mesh>
                );
            }
        }
        return cells;
    }, [gridCols, gridRows, cellSize, cellGap]);

    return (
        <group position={[xOffset, 0, 0]}>
            {gridCells}
            {enemyUnits.map(unit => (
                <CombatUnitMesh
                    key={unit.id}
                    unit={unit}
                    cellSize={cellSize}
                    cellGap={cellGap}
                />
            ))}
        </group>
    );
};