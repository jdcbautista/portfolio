// puzzleMatchHelpers/combatTypes.ts - Combat-related types and data

export interface CombatUnit {
    id: string;
    typeId: string;
    name: string;
    color: string;
    level: number;
    currentStats: {
        level: number;
        experience: number;
        maxExperience: number;
        hitpoints: number;
        maxHitpoints: number;
        strength: number;
        dexterity: number;
        intelligence: number;
        attackRange: number;
        attackSpeed: number;
    };
    position: { x: number; y: number };
    team: 'player' | 'enemy';
    lastAttackTime: number;
}

export interface AttackAction {
    id: string;
    attackerId: string;
    targetId: string;
    damage: number;
    attackType: 'melee' | 'ranged' | 'magic';
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    elapsed: number;
    duration: number;
}

export interface EnemyTypeData {
    id: string;
    name: string;
    color: string;
    tier: number;
    baseStats: {
        level: number;
        experience: number;
        maxExperience: number;
        hitpoints: number;
        maxHitpoints: number;
        strength: number;
        dexterity: number;
        intelligence: number;
        attackRange: number;
        attackSpeed: number;
    };
    scalingFormula: {
        hpPerLevel: number;
        strPerLevel: number;
        dexPerLevel: number;
        intPerLevel: number;
    };
}

export interface EnemySpawn {
    enemyTypeId: string;
    count: number;
    levelOverride?: number;
    statsOverride?: Partial<{
        hitpoints: number;
        strength: number;
        dexterity: number;
        intelligence: number;
    }>;
}

export interface WaveConfig {
    waveNumber: number;
    enemies: EnemySpawn[];
}

export interface CombatEncounter {
    waves: WaveConfig[];
    difficultyScaling: {
        countScalingPercent: number;
        levelScalingPercent: number;
    };
}

// BESTIARY - Source of truth for all enemy types
export const BESTIARY: { [key: string]: EnemyTypeData } = {
    bat: {
        id: 'bat',
        name: 'Bat',
        color: '#8B4789',
        tier: 0,
        baseStats: {
            level: 1,
            experience: 0,
            maxExperience: 100,
            hitpoints: 150,
            maxHitpoints: 150,
            strength: 5,
            dexterity: 12,
            intelligence: 3,
            attackRange: 1,
            attackSpeed: 1.5,
        },
        scalingFormula: {
            hpPerLevel: 15,
            strPerLevel: 0.5,
            dexPerLevel: 1.2,
            intPerLevel: 0.3,
        },
    },
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        color: '#6B8E23',
        tier: 0,
        baseStats: {
            level: 1,
            experience: 0,
            maxExperience: 100,
            hitpoints: 200,
            maxHitpoints: 200,
            strength: 8,
            dexterity: 6,
            intelligence: 4,
            attackRange: 1,
            attackSpeed: 1.0,
        },
        scalingFormula: {
            hpPerLevel: 20,
            strPerLevel: 0.8,
            dexPerLevel: 0.6,
            intPerLevel: 0.4,
        },
    },
    skeleton: {
        id: 'skeleton',
        name: 'Skeleton',
        color: '#D3D3D3',
        tier: 1,
        baseStats: {
            level: 1,
            experience: 0,
            maxExperience: 150,
            hitpoints: 250,
            maxHitpoints: 250,
            strength: 10,
            dexterity: 8,
            intelligence: 5,
            attackRange: 2,
            attackSpeed: 0.8,
        },
        scalingFormula: {
            hpPerLevel: 25,
            strPerLevel: 1.0,
            dexPerLevel: 0.8,
            intPerLevel: 0.5,
        },
    },
    orc: {
        id: 'orc',
        name: 'Orc',
        color: '#8B6914',
        tier: 1,
        baseStats: {
            level: 1,
            experience: 0,
            maxExperience: 150,
            hitpoints: 300,
            maxHitpoints: 300,
            strength: 15,
            dexterity: 5,
            intelligence: 3,
            attackRange: 1,
            attackSpeed: 0.7,
        },
        scalingFormula: {
            hpPerLevel: 30,
            strPerLevel: 1.5,
            dexPerLevel: 0.5,
            intPerLevel: 0.3,
        },
    },
};

// Default combat encounter configuration
export const DEFAULT_COMBAT_ENCOUNTER: CombatEncounter = {
    waves: [
        {
            waveNumber: 0,
            enemies: [
                { enemyTypeId: 'goblin', count: 3 }
            ]
        }
    ],
    difficultyScaling: {
        countScalingPercent: 25,
        levelScalingPercent: 25,
    }
};