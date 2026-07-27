// puzzleMatchHelpers/utils.ts

import { PIECES, GAME_DEFAULTS  } from './constants';
import type { PieceData, StagingPiece, GridPiece } from './types';

export function getRandomPiece(): PieceData {
  const activePieceIds = GAME_DEFAULTS.ACTIVE_PIECES.length > 0 ? GAME_DEFAULTS.ACTIVE_PIECES : Object.keys(PIECES);
  const randomId = activePieceIds[Math.floor(Math.random() * activePieceIds.length)];
  return PIECES[randomId];
}

export function generateShape(height: number): StagingPiece[] {
  const pieces: StagingPiece[] = [];
  for (let i = 0; i < height; i++) {
    pieces.push({
      pieceData: getRandomPiece(),
      index: 0
    });
  }
  return pieces;
}

export function getPiecePositions(
  cursorColumn: number,
  rotation: number,
  shapeHeight: number,
  anchorIndex: number,
  stagingRows: number
): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  const midRow = Math.floor(stagingRows / 2);

  for (let i = 0; i < shapeHeight; i++) {
    const offset = i - anchorIndex;
    let x = cursorColumn;
    let y = midRow;

    if (rotation === 0) {
      y = midRow + offset;
    } else if (rotation === 90) {
      x = cursorColumn + offset;
    } else if (rotation === 180) {
      y = midRow - offset;
    } else if (rotation === 270) {
      x = cursorColumn - offset;
    }

    positions.push([x, y]);
  }

  return positions;
}

export function canPlaceAt(
  cursorColumn: number,
  rotation: number,
  shapeHeight: number,
  anchorIndex: number,
  stagingRows: number,
  gridCols: number
): boolean {
  const positions = getPiecePositions(cursorColumn, rotation, shapeHeight, anchorIndex, stagingRows);

  for (const [x, y] of positions) {
    if (x < 0 || x >= gridCols || y < 0 || y >= stagingRows) {
      return false;
    }
  }

  return true;
}

export function getSwapTargets(
  x: number,
  y: number,
  radius: number,
  gridCols: number,
  gridRows: number
): Array<[number, number]> {
  const targets: Array<[number, number]> = [];

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < gridCols && ny >= 0 && ny < gridRows) {
        targets.push([nx, ny]);
      }
    }
  }

  return targets;
}

/**
 * Calculates combo bonus based on combo chain length and a base scalar.
 * The formula creates an exponential growth curve that starts fast for early combos
 * but naturally tapers off to prevent runaway scaling at high combo counts.
 * 
 * Two blended components shape the curve:
 * - baseGrowthCurve: drives exponential reward as combo chains increase
 * - balanceFactor: counteracts extreme growth for controlled, balanced scaling
 */

export function calculateComboMultiplier(comboLinkCount: number, baseScalar: number): number {

  let comboIndex = comboLinkCount -1
  let comboCountSquared = (Math.pow(comboLinkCount, 2))
  let baseScalarSquared = Math.pow(baseScalar, 2)

  // const baseGrowthCurve = (comboCountSquared / (comboLinkCount *2)) * (comboIndex)
  const baseGrowthCurve = 1 + (((comboCountSquared / baseScalar) / (comboLinkCount *2)) * (comboIndex))
  // const balanceFactor = (comboLinkCount * baseScalarSquared) - (comboCountSquared * baseScalar)
  // return baseGrowthCurve + balanceFactor;
  // return baseGrowthCurve + balanceFactor;
  console.log(`calculateComboMultiplier: (( comboCountSquared=${comboCountSquared} /  baseScalar=${baseScalar} / 2 * comboLinkCount=${comboLinkCount}) * comboIndex=${comboIndex})`);
  return baseGrowthCurve;
}

export function findAllMatches(
  grid: (PieceData | null)[][],
  gridCols: number,
  gridRows: number,
  minMatchCount: number
): Array<Array<[number, number]>> {
  const matches: Array<Array<[number, number]>> = [];
  const visited = new Set<string>();

  function dfs(x: number, y: number, pieceId: string, group: Array<[number, number]>) {
    const key = `${x},${y}`;
    if (visited.has(key)) return;
    if (x < 0 || x >= gridCols || y < 0 || y >= gridRows) return;

    const piece = grid[x][y];
    if (!piece || piece.id !== pieceId) return;

    visited.add(key);
    group.push([x, y]);

    dfs(x + 1, y, pieceId, group);
    dfs(x - 1, y, pieceId, group);
    dfs(x, y + 1, pieceId, group);
    dfs(x, y - 1, pieceId, group);
  }

  for (let x = 0; x < gridCols; x++) {
    for (let y = 0; y < gridRows; y++) {
      const piece = grid[x][y];
      if (!piece) continue;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const group: Array<[number, number]> = [];
      dfs(x, y, piece.id, group);

      if (group.length >= minMatchCount) {
        matches.push(group);
      }
    }
  }

  return matches;
}

export function getUpgradedPiece(matchedPieces: PieceData[]): PieceData {
  if (matchedPieces.length === 0) {
    return getRandomPiece();
  }

  const firstPiece = matchedPieces[0];
  const unitData = PIECES[firstPiece.id];

  if (unitData && unitData.evolvesToUnitId && PIECES[unitData.evolvesToUnitId]) {
    return PIECES[unitData.evolvesToUnitId];
  }

  return firstPiece;
}

export function findMergeSpawnPosition(
  matchGroup: Array<[number, number]>,
  yPriority: 'low' | 'high',
  xPriority: 'left' | 'right',
  xyPriority: 'x' | 'y'
): { x: number; y: number } {
  if (matchGroup.length === 0) {
    return { x: 0, y: 0 };
  }

  let bestPos = matchGroup[0];

  for (const pos of matchGroup) {
    const [x, y] = pos;
    const [bestX, bestY] = bestPos;

    if (xyPriority === 'y') {
      // Y takes priority
      if (yPriority === 'low') {
        if (y < bestY || (y === bestY && shouldReplaceX(x, bestX, xPriority))) {
          bestPos = pos;
        }
      } else {
        // yPriority === 'high'
        if (y > bestY || (y === bestY && shouldReplaceX(x, bestX, xPriority))) {
          bestPos = pos;
        }
      }
    } else {
      // X takes priority
      if (xPriority === 'left') {
        if (x < bestX || (x === bestX && shouldReplaceY(y, bestY, yPriority))) {
          bestPos = pos;
        }
      } else {
        // xPriority === 'right'
        if (x > bestX || (x === bestX && shouldReplaceY(y, bestY, yPriority))) {
          bestPos = pos;
        }
      }
    }
  }

  return { x: bestPos[0], y: bestPos[1] };
}

function shouldReplaceX(x: number, bestX: number, xPriority: 'left' | 'right'): boolean {
  if (xPriority === 'left') {
    return x < bestX;
  } else {
    return x > bestX;
  }
}

function shouldReplaceY(y: number, bestY: number, yPriority: 'low' | 'high'): boolean {
  if (yPriority === 'low') {
    return y < bestY;
  } else {
    return y > bestY;
  }
}

export function applyGravity(
  grid: (PieceData | null)[][],
  gridCols: number,
  gridRows: number,
  reservedPositions: Set<string> = new Set()
): { newGrid: (PieceData | null)[][]; fallingPieces: GridPiece[] } {
  const newGrid = grid.map(col => [...col]);
  const fallingPieces: GridPiece[] = [];

  for (let x = 0; x < gridCols; x++) {
    const column = newGrid[x];
    const nonNullPieces: { piece: PieceData; originalY: number }[] = [];

    for (let y = 0; y < gridRows; y++) {
      const piece = column[y];
      if (piece !== null) {
        nonNullPieces.push({ piece, originalY: y });
      }
    }

    // Clear the column
    for (let y = 0; y < gridRows; y++) {
      column[y] = null;
    }

    // Place pieces from bottom up, skipping reserved positions
    let targetY = 0;
    for (const { piece, originalY } of nonNullPieces) {
      // Find the next available target position
      while (targetY < gridRows && reservedPositions.has(`${x},${targetY}`)) {
        targetY++;
      }

      if (targetY < gridRows) {
        column[targetY] = piece;

        if (targetY !== originalY) {
          fallingPieces.push({
            pieceData: piece,
            gridX: x,
            gridY: targetY,
            visualY: originalY,
            animId: `gravity-${Date.now()}-${x}-${originalY}-${targetY}-${Math.random()}`,
          });
        }

        targetY++;
      }
    }
  }

  return { newGrid, fallingPieces };
}

// THIS IS WHAT applyDeployment SHOULD BE DOING
// It compacts all pieces toward the RIGHT side of the grid

export function applyDeployment(
  grid: (PieceData | null)[][],
  gridCols: number,
  gridRows: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'right'
): {
  newGrid: (PieceData | null)[][];
  allMovements: Array<{ piece: PieceData; fromX: number; fromY: number; toX: number; toY: number }>;
} {
  const newGrid = Array(gridCols).fill(null).map(() => Array(gridRows).fill(null));
  const allMovements: Array<{ piece: PieceData; fromX: number; fromY: number; toX: number; toY: number }> = [];

  if (direction === 'right') {
    // For each row, compact pieces to the right
    for (let y = 0; y < gridRows; y++) {
      const piecesInRow: Array<{ piece: PieceData; fromX: number }> = [];
      
      // Collect all pieces in this row
      for (let x = 0; x < gridCols; x++) {
        if (grid[x][y] !== null) {
          piecesInRow.push({ piece: grid[x][y]!, fromX: x });
        }
      }

      // Place them starting from the rightmost column
      let targetX = gridCols - 1;
      for (let i = piecesInRow.length - 1; i >= 0; i--) {
        const { piece, fromX } = piecesInRow[i];
        newGrid[targetX][y] = piece;

        // Record movement if position changed
        if (fromX !== targetX) {
          allMovements.push({
            piece,
            fromX,
            fromY: y,
            toX: targetX,
            toY: y
          });
        }

        targetX--;
      }
    }
  } else if (direction === 'left') {
    // For each row, compact pieces to the left
    for (let y = 0; y < gridRows; y++) {
      const piecesInRow: Array<{ piece: PieceData; fromX: number }> = [];
      
      for (let x = 0; x < gridCols; x++) {
        if (grid[x][y] !== null) {
          piecesInRow.push({ piece: grid[x][y]!, fromX: x });
        }
      }

      let targetX = 0;
      for (let i = 0; i < piecesInRow.length; i++) {
        const { piece, fromX } = piecesInRow[i];
        newGrid[targetX][y] = piece;

        if (fromX !== targetX) {
          allMovements.push({
            piece,
            fromX,
            fromY: y,
            toX: targetX,
            toY: y
          });
        }

        targetX++;
      }
    }
  } else if (direction === 'down') {
    // For each column, compact pieces to the bottom
    for (let x = 0; x < gridCols; x++) {
      const piecesInCol: Array<{ piece: PieceData; fromY: number }> = [];
      
      for (let y = 0; y < gridRows; y++) {
        if (grid[x][y] !== null) {
          piecesInCol.push({ piece: grid[x][y]!, fromY: y });
        }
      }

      let targetY = 0;
      for (let i = 0; i < piecesInCol.length; i++) {
        const { piece, fromY } = piecesInCol[i];
        newGrid[x][targetY] = piece;

        if (fromY !== targetY) {
          allMovements.push({
            piece,
            fromX: x,
            fromY,
            toX: x,
            toY: targetY
          });
        }

        targetY++;
      }
    }
  } else if (direction === 'up') {
    // For each column, compact pieces to the top
    for (let x = 0; x < gridCols; x++) {
      const piecesInCol: Array<{ piece: PieceData; fromY: number }> = [];
      
      for (let y = 0; y < gridRows; y++) {
        if (grid[x][y] !== null) {
          piecesInCol.push({ piece: grid[x][y]!, fromY: y });
        }
      }

      let targetY = gridRows - 1;
      for (let i = piecesInCol.length - 1; i >= 0; i--) {
        const { piece, fromY } = piecesInCol[i];
        newGrid[x][targetY] = piece;

        if (fromY !== targetY) {
          allMovements.push({
            piece,
            fromX: x,
            fromY,
            toX: x,
            toY: targetY
          });
        }

        targetY--;
      }
    }
  }

  return { newGrid, allMovements };
}


function updateSpriteState(
    phase: 'placement' | 'formation' | 'combat',
    transition: 'active' | 'ending' | null,
    customOverride?: Partial<SpriteStateSheet>
): SpriteStateSheet {
    const phaseDefaults: Record<string, SpriteStateSheet> = {
        placement: {
            spriteEnabled: true,
            spriteDirection: transition === 'ending' ? 'right' : 'down',
            spriteAnimationState: 'walking',
            spriteAnimationEffect: 'neutral',
        },
        formation: {
            spriteEnabled: true,
            spriteDirection: transition === 'ending' ? 'right' : 'down',
            spriteAnimationState: 'walking',
            spriteAnimationEffect: 'neutral',
        },
        combat: {
            spriteEnabled: true,
            spriteDirection: transition === 'ending' ? 'down' : 'right',
            spriteAnimationState: 'attacking',
            spriteAnimationEffect: 'neutral',
        },
    };

    return {
        ...phaseDefaults[phase],
        ...customOverride,
    };
}

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
