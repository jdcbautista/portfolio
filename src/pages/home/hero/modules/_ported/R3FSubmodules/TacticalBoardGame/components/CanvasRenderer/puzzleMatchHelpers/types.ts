// types.ts
export interface UnitStats {
  level: number;
  experience: number;
  maxExperience: number;
  hitpoints: number;
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface UnitTypeData {
  id: string;
  name: string;
  color: string;
  tier: number;
  evolvesFromUnitId?: string | null;
  evolvesToUnitId: string;
  baseStats: UnitStats;
  clearedCount: number;
  combatDeaths: number;
}

export interface PieceData {
  id: string;
  name: string;
  color: string;
  tier: number;
  baseStats: UnitStats;
  clearedCount: number;
  combatDeaths: number;
}

export interface GridPiece {
  pieceData: PieceData;
  gridX: number;
  gridY: number;
  visualY: number;
  visualX?: number;
  animId: string;
}

export interface StagingPiece {
  pieceData: PieceData;
  index: number;
}

export interface MergeSpawnInfo {
  x: number;
  y: number;
  evolvedPiece: PieceData;
}
export type GamePhase = 'placement' | 'swap' | 'formation' | 'combat';

export interface ComboLinkScoreTracker {
  pieceClearCountPerType: { [pieceType: string]: number };
  piecesClearedCount: number;
  thisLinkClearScore: number;
  thisLinkClearBonus: number;
  thisLinkScoreTuple: [number, number];
  thisLinkScoreTotal: number;
}

export interface DropTurnScoreTracker {
  comboLinkScoreTracker: { [n: number]: ComboLinkScoreTracker };
  totalComboCount: number;
  totalComboChainScore: number;
}

export interface GameStateTracker {
  gameDropturnTracker: { [n: number]: DropTurnScoreTracker };
  cumulativeScore: number;
  pieceTypeClearTracker: { [pieceType: string]: number };
  highestCombo: number;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  score: number;
  elapsed: number;
  isComboTotal?: boolean;
  comboCount?: number;
}

export interface SpriteStateSheet {
  spriteEnabled: boolean;
  spriteDirection: 'down' | 'left' | 'up' | 'right';
  spriteAnimationState: 'idle' | 'frozen' | 'walking' | 'attacking' | 'takingDamage' | 'collapsing' | 'knockedOut' | 'critical' | 'celebrating' | 'stunLocked';
  spriteAnimationEffect: 'neutral' | 'fall' | 'formation' | 'shrink' | 'matchClear';
}

export interface GameState {
  activePieces: string[];
  phase: GamePhase;
  stagingPieces: StagingPiece[];
  cursorColumn: number;
  cursorRow: number;
  rotation: number;
  grid: (PieceData | null)[][];
  spriteStateSheet: SpriteStateSheet;
  animatingPieces: GridPiece[];
  shrinkingPieces: GridPiece[];
  nextPieces: StagingPiece[];
  score: number;
  shapeHeight: number;
  anchorIndex: number;
  gridCols: number;
  gridRows: number;
  selectedCell: [number, number] | null;
  swapRadius: number;
  cursorMovements: number;
  swapsMade: number;
  maxMovements: number;
  maxSwaps: number;
  minMatchCount: number;
  matchCount: number;
  isProcessingMatches: boolean;
  combatTimer: number;
  combatTimerMax: number;
  combatMessage: string | null;
  combatLog: string[];
  enemyCount: number;
  casualtyPercentage: number;
  formationPieces: GridPiece[];
  combatStep: number;
  enableMatchLogic: boolean;
  matchEffect: 'clear' | 'merge';
  combatTimerActive: boolean;
  gameStateTracker: GameStateTracker;
  currentDropTurn: DropTurnScoreTracker | null;
  currentComboLink: number;
  pieceClearValue: number;
  baseScalar: number;
  scorePopups: ScorePopup[];
  dropSpeed: number;
  gravitySpeed: number;
  scoreFloatSpeed: number;
  scoreScaleSpeed: number;
  scoreFadeStart: number;
  cellSize: number;
  cellGap: number;
  formationSpeed: number;
  shrinkDuration: number;
  matchClearDuration: number;
  scorePopupDuration: number;
  defaultGravitySpeed: number;
  mergeYPriority: 'low' | 'high';
  mergeXPriority: 'left' | 'right';
  mergeXYPriority: 'x' | 'y';
  pendingMergeSpawns: MergeSpawnInfo[];
}
