// puzzleMatchHelpers/combatUtils.ts - Combat calculation and spawning logic

import { BESTIARY } from './combatTypes';
import type {
    EnemyTypeData,
    CombatUnit,
    WaveConfig,
    EnemySpawn
} from './combatTypes';
import type { PieceData } from './types';

/**
 * Calculate enemy stats based on level and optional overrides
 */
export function calculateEnemyStats(
    baseEnemy: EnemyTypeData,
    level: number,
    overrides?: Partial<{
        hitpoints: number;
        strength: number;
        dexterity: number;
        intelligence: number;
    }>
): typeof baseEnemy.baseStats {
    const scaled = {
        level,
        experience: 0,
        maxExperience: baseEnemy.baseStats.maxExperience,
        hitpoints: baseEnemy.baseStats.hitpoints + (level - 1) * baseEnemy.scalingFormula.hpPerLevel,
        maxHitpoints: baseEnemy.baseStats.hitpoints + (level - 1) * baseEnemy.scalingFormula.hpPerLevel,
        strength: baseEnemy.baseStats.strength + (level - 1) * baseEnemy.scalingFormula.strPerLevel,
        dexterity: baseEnemy.baseStats.dexterity + (level - 1) * baseEnemy.scalingFormula.dexPerLevel,
        intelligence: baseEnemy.baseStats.intelligence + (level - 1) * baseEnemy.scalingFormula.intPerLevel,
        attackRange: baseEnemy.baseStats.attackRange,
        attackSpeed: baseEnemy.baseStats.attackSpeed,
    };

    // Apply any manual overrides
    return { ...scaled, ...overrides };
}

/**
 * Spawn enemies for a wave with difficulty scaling
 */
export function spawnEnemyWave(
    waveConfig: WaveConfig,
    gridCols: number,
    gridRows: number,
    scaling: { countScalingPercent: number; levelScalingPercent: number }
): CombatUnit[] {
    const enemies: CombatUnit[] = [];
    const waveScaling = 1 + (waveConfig.waveNumber * scaling.countScalingPercent / 100);
    const levelScaling = 1 + (waveConfig.waveNumber * scaling.levelScalingPercent / 100);

    waveConfig.enemies.forEach((spawn: EnemySpawn) => {
        const enemyType = BESTIARY[spawn.enemyTypeId];
        if (!enemyType) return;

        const scaledCount = Math.ceil(spawn.count * waveScaling);
        const scaledLevel = Math.floor((spawn.levelOverride || enemyType.baseStats.level) * levelScaling);

        for (let i = 0; i < scaledCount; i++) {
            const stats = calculateEnemyStats(enemyType, scaledLevel, spawn.statsOverride);

            // Place enemies from left side of their grid
            const x = i % gridCols;
            const y = Math.floor(i / gridCols) % gridRows;

            enemies.push({
                id: `enemy-${waveConfig.waveNumber}-${spawn.enemyTypeId}-${i}`,
                typeId: enemyType.id,
                name: enemyType.name,
                color: enemyType.color,
                level: scaledLevel,
                currentStats: stats,
                position: { x, y },
                team: 'enemy',
                lastAttackTime: 0,
            });
        }
    });

    return enemies;
}

/**
 * Convert player grid pieces into combat units
 */
export function convertPlayerUnitsFromGrid(
    grid: (PieceData | null)[][],
    gridCols: number,
    gridRows: number
): CombatUnit[] {
    const units: CombatUnit[] = [];

    for (let x = 0; x < gridCols; x++) {
        for (let y = 0; y < gridRows; y++) {
            const piece = grid[x][y];
            if (piece) {
                units.push({
                    id: `player-${x}-${y}`,
                    typeId: piece.id,
                    name: piece.name,
                    color: piece.color,
                    level: piece.baseStats.level,
                    currentStats: { ...piece.baseStats },
                    position: { x, y },
                    team: 'player',
                    lastAttackTime: 0,
                });
            }
        }
    }

    return units;
}

/**
 * Check if attacker is in range of target
 */
export function isInRange(
    attacker: CombatUnit,
    target: CombatUnit,
    gridGap: number
): boolean {
    // Calculate actual distance including the gap between grids
    const actualDistance = attacker.team === 'player'
        ? gridGap + (target.position.x - attacker.position.x)
        : gridGap + (attacker.position.x - target.position.x);

    return actualDistance <= attacker.currentStats.attackRange;
}

/**
 * Find the best target for a unit
 * Prioritizes: closest by column, then closest by row
 */
export function findTarget(
    unit: CombatUnit,
    playerUnits: CombatUnit[],
    enemyUnits: CombatUnit[],
    gridGap: number
): CombatUnit | null {
    const enemies = unit.team === 'player' ? enemyUnits : playerUnits;

    return enemies
        .filter(e => isInRange(unit, e, gridGap) && e.currentStats.hitpoints > 0)
        .sort((a, b) => {
            const distA = Math.abs(unit.position.x - a.position.x);
            const distB = Math.abs(unit.position.x - b.position.x);
            if (distA !== distB) return distA - distB;
            return Math.abs(unit.position.y - a.position.y) - Math.abs(unit.position.y - b.position.y);
        })[0] || null;
}

/**
 * Calculate damage based on unit stats
 */
export function calculateDamage(attacker: CombatUnit): number {
    const { strength, intelligence, dexterity } = attacker.currentStats;
    // Simple formula: weighted average of stats
    return Math.floor(strength * 0.5 + intelligence * 0.3 + dexterity * 0.2);
}

/**
 * Determine attack type based on unit stats
 */
export function getAttackType(unit: CombatUnit): 'melee' | 'ranged' | 'magic' {
    if (unit.currentStats.attackRange === 1) return 'melee';
    if (unit.currentStats.intelligence > unit.currentStats.strength) return 'magic';
    return 'ranged';
}