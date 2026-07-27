import React, { useRef, useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './PuzzleMatchGame.module.css';

// Import types, constants, and utilities
import { PIECES, GAME_DEFAULTS, STYLES } from './puzzleMatchHelpers/constants';
import { getRandomPiece, generateShape, getPiecePositions, canPlaceAt, getSwapTargets, calculateComboMultiplier, findAllMatches, getUpgradedPiece, findMergeSpawnPosition, applyGravity, applyDeployment } from './puzzleMatchHelpers/utils';
import type { PieceData, UnitTypeData, GameState, GridPiece, StagingPiece, ScorePopup, SpriteStateSheet, MergeSpawnInfo } from './puzzleMatchHelpers/types';

// Create GameState Context
const GameStateContext = createContext<GameState | null>(null);

function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameStateProvider');
  return context;
}

// ============================================================================
// UNIFIED ANIMATION COMPONENT
// ============================================================================

interface UnifiedAnimatedPieceProps {
  piece: GridPiece;
  effect: 'fall' | 'formation' | 'shrink' | 'matchClear';
  onComplete: (animId: string, extraData?: any) => void;
}

function UnifiedAnimatedPiece({
  piece,
  effect,
  onComplete
}: UnifiedAnimatedPieceProps) {
  const gameState = useGameState();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const [currentPos, setCurrentPos] = useState({
    x: piece.visualX ?? piece.gridX,
    y: piece.visualY
  });
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);

  useFrame((state, delta) => {
    if (completed) return;

    switch (effect) {
      case 'fall': {
        const targetY = piece.gridY;
        const speed = gameState.defaultGravitySpeed;

        if (Math.abs(currentPos.y - targetY) < 0.01) {
          setCompleted(true);
          onComplete(piece.animId);
          break;
        }

        if (currentPos.y > targetY) {
          const newY = Math.max(targetY, currentPos.y - speed * delta);
          setCurrentPos(prev => ({ ...prev, y: newY }));

          if (meshRef.current) {
            meshRef.current.position.y = newY * (gameState.cellSize + gameState.cellGap);
          }

          if (newY === targetY) {
            setCompleted(true);
            onComplete(piece.animId);
          }
        }
        break;
      }

      case 'formation': {
        const targetX = piece.gridX;
        const targetY = piece.gridY;
        const speed = gameState.formationSpeed;

        let newX = currentPos.x;
        let newY = currentPos.y;

        if (Math.abs(currentPos.x - targetX) > 0.01) {
          const dir = targetX > currentPos.x ? 1 : -1;
          newX = currentPos.x + dir * speed * delta;
          if (dir > 0 && newX >= targetX) newX = targetX;
          if (dir < 0 && newX <= targetX) newX = targetX;
        } else if (Math.abs(currentPos.y - targetY) > 0.01) {
          const dir = targetY > currentPos.y ? 1 : -1;
          newY = currentPos.y + dir * speed * delta;
          if (dir > 0 && newY >= targetY) newY = targetY;
          if (dir < 0 && newY <= targetY) newY = targetY;
        }

        setCurrentPos({ x: newX, y: newY });

        if (meshRef.current) {
          meshRef.current.position.x = newX * (gameState.cellSize + gameState.cellGap);
          meshRef.current.position.y = newY * (gameState.cellSize + gameState.cellGap);
        }

        if (Math.abs(newX - targetX) < 0.01 && Math.abs(newY - targetY) < 0.01) {
          setCompleted(true);
          onComplete(piece.animId);
        }
        break;
      }

      case 'shrink': {
        const duration = gameState.shrinkDuration;
        const newElapsed = elapsed + delta;
        setElapsed(newElapsed);

        const progress = Math.min(newElapsed / duration, 1);
        const newScale = 1 - progress;
        setScale(newScale);

        if (groupRef.current) {
          groupRef.current.scale.set(newScale, newScale, 1);
        }

        if (progress >= 1) {
          setCompleted(true);
          onComplete(piece.animId);
        }
        break;
      }

      case 'matchClear': {
        const duration = gameState.matchClearDuration;
        const newElapsed = elapsed + delta;
        setElapsed(newElapsed);

        const progress = Math.min(newElapsed / duration, 1);
        const newScale = 1 + progress * 0.5;
        const newOpacity = 1 - progress;

        setScale(newScale);
        setOpacity(newOpacity);

        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).opacity = newOpacity;
        }

        if (groupRef.current) {
          groupRef.current.scale.set(newScale, newScale, 1);
        }

        if (progress >= 1) {
          setCompleted(true);
          onComplete(piece.animId);
        }
        break;
      }
    }
  });

  const isMatchClear = effect === 'matchClear';
  const useGroup = effect === 'shrink' || effect === 'matchClear';

  const meshContent = (
    <>
      <planeGeometry args={[gameState.cellSize * 0.9, gameState.cellSize * 0.9]} />
      <meshStandardMaterial
        color={isMatchClear ? '#ffff00' : piece.pieceData.color}
        emissive={isMatchClear ? '#ffff00' : undefined}
        emissiveIntensity={isMatchClear ? 2 : undefined}
        metalness={0.3}
        roughness={0.7}
        transparent={isMatchClear}
        opacity={isMatchClear ? opacity : 1}
      />
      <Text
        position={[0, 0, 0.01]}
        fontSize={gameState.cellSize * 0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {piece.pieceData.tier}
      </Text>
    </>
  );

  const spriteContent = (
    <AnimatedSprite
      x={useGroup ? 0 : currentPos.x}
      y={useGroup ? 0 : currentPos.y}
      pieceData={piece.pieceData}
      animationEffect={effect === 'matchClear' ? 'matchClear' : effect === 'shrink' ? 'shrink' : 'neutral'}
    />
  );

  if (useGroup) {
    return (
      <group
        ref={groupRef}
        position={[
          piece.gridX * (gameState.cellSize + gameState.cellGap),
          piece.gridY * (gameState.cellSize + gameState.cellGap),
          isMatchClear ? 0.02 : 0
        ]}
      >
        <mesh ref={meshRef}>{meshContent}</mesh>
        {spriteContent}
      </group>
    );
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[
          currentPos.x * (gameState.cellSize + gameState.cellGap),
          currentPos.y * (gameState.cellSize + gameState.cellGap),
          0
        ]}
      >
        {meshContent}
      </mesh>
      {spriteContent}
    </group>
  );
}

// ============================================================================
// DEBUG UI COMPONENTS
// ============================================================================

const DebugSection = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div style={STYLES.section}>
    <h4 style={{ margin: '0 0 8px 0', color, fontSize: '13px' }}>{title}</h4>
    {children}
  </div>
);

const DebugNumberInput = ({ label, value, onChange, min = 1, max = 100, step = 1, disabled = false }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; disabled?: boolean;
}) => (
  <div style={STYLES.inputRow}>
    <label style={STYLES.debugLabel}>{label}:</label>
    <input type="number" min={min} max={max} step={step} value={value} disabled={disabled} style={STYLES.debugInput}
      onChange={(e) => { const v = step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value); if (!isNaN(v) && v >= min) onChange(v); }} />
  </div>
);

const DebugCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div style={STYLES.inputRow}>
    <label style={{ ...STYLES.debugLabel, width: '110px' }}>{label}:</label>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
  </div>
);

const DebugSelect = ({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) => (
  <div style={STYLES.inputRow}>
    <label style={{ ...STYLES.debugLabel, width: '110px' }}>{label}:</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: '100px', padding: '4px', fontSize: '12px', color: '#000', background: '#fff' }}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// ============================================================================
// PHASE INFO COMPONENT
// ============================================================================

const PhaseInfo = ({ gameState }: { gameState: GameState }) => {
  const phaseColors = { placement: '#4CAF50', swap: '#9C27B0', formation: '#FF9800', combat: '#F44336' };
  const phaseNames = { placement: 'PLACEMENT PHASE', swap: 'SWAP PHASE', formation: 'FORMATION PHASE', combat: 'COMBAT PHASE' };

  return (
    <div style={{ ...STYLES.panel, border: `2px solid ${phaseColors[gameState.phase]}`, marginBottom: '15px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: phaseColors[gameState.phase], fontSize: '16px' }}>{phaseNames[gameState.phase]}</h3>
      {gameState.phase === 'placement' && (
        <>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Shape: 1x{gameState.shapeHeight}</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Rotation: {gameState.rotation}°</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Anchor: Piece {gameState.anchorIndex}</p>
          <p style={{ margin: '10px 0 5px 0', fontSize: '12px', color: '#aaa' }}>Current:</p>
          {gameState.stagingPieces.map((sp, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
              <div style={{ width: '20px', height: '20px', background: sp.pieceData.color, border: '1px solid #fff' }} />
              <span style={{ fontSize: '14px' }}>{sp.pieceData.name}</span>
              {idx === gameState.anchorIndex && <span style={{ fontSize: '12px', color: '#ffff00' }}>⚓</span>}
            </div>
          ))}
        </>
      )}
      {(gameState.phase === 'swap' || gameState.phase === 'combat') && (
        <>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Cursor: [{gameState.cursorColumn}, {gameState.cursorRow}]</p>
          {gameState.phase === 'swap' && (
            <>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>Radius: {gameState.swapRadius}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>Moves: {gameState.cursorMovements} / {gameState.maxMovements}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>Swaps: {gameState.swapsMade} / {gameState.maxSwaps}</p>
            </>
          )}
          {gameState.phase === 'combat' && (
            <>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>Enemies: {gameState.enemyCount}</p>
              <p style={{ margin: '5px 0', fontSize: '18px', color: gameState.combatTimer <= 3 ? '#ff0000' : '#ffaa00' }}>Timer: {gameState.combatTimer}s</p>
            </>
          )}
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#ffaa00' }}>Matches: {gameState.matchCount}</p>
          {gameState.selectedCell && <p style={{ margin: '10px 0 5px 0', fontSize: '13px', color: '#00ff00' }}>Selected: [{gameState.selectedCell[0]}, {gameState.selectedCell[1]}]</p>}
        </>
      )}
      {gameState.phase === 'formation' && <p style={{ margin: '5px 0', fontSize: '14px' }}>Organizing formation...</p>}
    </div>
  );
};

// ============================================================================
// MESSAGE OVERLAY COMPONENT
// ============================================================================

const MessageOverlay = ({ message, onDismiss, color = '#ffaa00', showButton = false }: {
  message: string; onDismiss?: () => void; color?: string; showButton?: boolean;
}) => (
  <div style={{
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.95)', padding: showButton ? '40px 60px' : '50px 80px', borderRadius: '16px',
    border: `4px solid ${color}`, zIndex: showButton ? 2000 : 10000, color: 'white',
    fontSize: showButton ? '28px' : '36px', fontFamily: 'monospace', fontWeight: 'bold',
    textAlign: 'center', whiteSpace: 'pre-line', boxShadow: `0 0 30px rgba(${color === '#ff0000' ? '255,0,0' : '255,170,0'},0.5)`
  }}>
    {message}
    {showButton && onDismiss && (
      <button onClick={onDismiss} style={{
        marginTop: '20px', padding: '15px 40px', background: color,
        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '20px',
        fontWeight: 'bold', display: 'block', marginLeft: 'auto', marginRight: 'auto'
      }}>OK</button>
    )}
  </div>
);

// ============================================================================
// GRID CELL COMPONENT
// ============================================================================

const GridCell = ({ x, y, isStaging, isCursor, gridRows, stagingRows }: {
  x: number; y: number; isStaging: boolean; isCursor: boolean; gridRows: number; stagingRows: number;
}) => {
  const gameState = useGameState();
  const yPos = isStaging ? (gridRows + y) * (gameState.cellSize + gameState.cellGap) : y * (gameState.cellSize + gameState.cellGap);
  const baseColor = isStaging
    ? (y === Math.floor(stagingRows / 2) ? '#4a4a5a' : '#3a3a4a')
    : (isCursor ? '#2a2a4a' : '#1a1a2a');

  return (
    <group>
      <mesh position={[x * (gameState.cellSize + gameState.cellGap), yPos, -0.01]}>
        <planeGeometry args={[gameState.cellSize, gameState.cellSize]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>
      {isCursor && (
        <mesh position={[x * (gameState.cellSize + gameState.cellGap), yPos, 0.01]}>
          <planeGeometry args={[gameState.cellSize * 1.1, gameState.cellSize * 1.1]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0} depthTest={false} />
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(gameState.cellSize * 1.1, gameState.cellSize * 1.1)]} />
            <lineBasicMaterial color="#ffff00" linewidth={3} />
          </lineSegments>
        </mesh>
      )}
    </group>
  );
};

// ============================================================================
// UNIT CARD COMPONENT
// ============================================================================

const UnitCard = ({ unit, onPowerUp, onUseItem, inGameCount }: {
  unit: UnitTypeData; onPowerUp: (id: string) => void; onUseItem: (id: string) => void; inGameCount: number;
}) => (
  <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #444' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
      <div style={{
        width: '50px', height: '50px', background: unit.color, border: '2px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
        fontWeight: 'bold', color: 'white', flexShrink: 0
      }}>{unit.tier}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff00', marginBottom: '4px' }}>{unit.name}</div>
        <div style={{ fontSize: '11px', color: '#aaa' }}>Tier {unit.tier}</div>
        <div style={{ fontSize: '12px', color: '#ffaa00', marginTop: '4px' }}>In Game: {inGameCount}</div>
      </div>
    </div>
    <div style={{ fontSize: '11px', marginBottom: '8px', paddingLeft: '5px' }}>
      <div style={{ marginBottom: '3px' }}>
        <span style={{ color: '#ffaa00' }}>Lvl:</span> {unit.baseStats.level} |
        <span style={{ color: '#ffaa00' }}> XP:</span> {unit.baseStats.experience}/{unit.baseStats.maxExperience}
      </div>
      <div style={{ marginBottom: '3px' }}>
        <span style={{ color: '#ff6666' }}>HP:</span> {unit.baseStats.hitpoints} |
        <span style={{ color: '#ff6666' }}> STR:</span> {unit.baseStats.strength} |
        <span style={{ color: '#ff6666' }}> DEX:</span> {unit.baseStats.dexterity} |
        <span style={{ color: '#ff6666' }}> INT:</span> {unit.baseStats.intelligence}
      </div>
      <div><span style={{ color: '#66ff66' }}>Cleared:</span> {unit.clearedCount} | <span style={{ color: '#ff4444' }}>Deaths:</span> {unit.combatDeaths}</div>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => onPowerUp(unit.id)} style={{
        flex: 1, padding: '6px 10px', background: '#4CAF50',
        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
      }}>Power Up</button>
      <button onClick={() => onUseItem(unit.id)} style={{
        flex: 1, padding: '6px 10px', background: '#2196F3',
        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
      }}>Use Item</button>
    </div>
  </div>
);

// ============================================================================
// SCORE POPUP COMPONENT
// ============================================================================

function ScorePopupComponent({ popup, onComplete }: {
  popup: ScorePopup;
  onComplete: (id: string) => void;
}) {
  const gameState = useGameState();
  const textRef = useRef<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);

  useFrame((state, delta) => {
    if (completed) return;

    const newElapsed = elapsed + delta;
    setElapsed(newElapsed);

    const progress = Math.min(newElapsed / gameState.scorePopupDuration, 1);

    const moveUp = progress * gameState.scoreFloatSpeed;
    const moveOutX = Math.sin(progress * Math.PI) * 0.5;

    let opacity: number;
    if (progress < gameState.scoreFadeStart) {
      opacity = 1;
    } else {
      opacity = 1 - ((progress - gameState.scoreFadeStart) / (1 - gameState.scoreFadeStart));
    }

    const scale = 0.8 + (Math.min(progress / gameState.scoreScaleSpeed, 1) * 0.4);

    if (textRef.current) {
      textRef.current.position.x = popup.x * (gameState.cellSize + gameState.cellGap) + moveOutX;
      textRef.current.position.y = popup.y * (gameState.cellSize + gameState.cellGap) + moveUp;
      textRef.current.scale.set(scale, scale, 1);
      textRef.current.fillOpacity = opacity;
      textRef.current.outlineOpacity = opacity;
    }

    if (progress >= 1) {
      setCompleted(true);
      onComplete(popup.id);
    }
  });

  const displayText = popup.isComboTotal
    ? `${popup.score}\n${popup.comboCount}x Combo!`
    : `${popup.score}`;

  const color = popup.isComboTotal ? '#ffaa00' : '#00ff00';
  const fontSize = popup.isComboTotal ? gameState.cellSize * 0.5 : gameState.cellSize * 0.4;

  return (
    <Text
      ref={textRef}
      position={[popup.x * (gameState.cellSize + gameState.cellGap), popup.y * (gameState.cellSize + gameState.cellGap), 0.5]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="#000000"
      fontWeight="bold"
    >
      {displayText}
    </Text>
  );
}

// ============================================================================
// ANIMATED SPRITE COMPONENT - USING SPRITESTATETESHEET
// ============================================================================

function AnimatedSprite({ x, y, pieceData, animationEffect = 'neutral' }: {
  x: number;
  y: number;
  pieceData: PieceData;
  animationEffect?: 'neutral' | 'healing' | 'takingDamage' | 'shrink' | 'matchClear';
}) {
  const gameState = useGameState();
  const { spriteEnabled, spriteDirection, spriteAnimationState } = gameState.spriteStateSheet;

  if (!spriteEnabled) return null;

  const getBaseClass = () => {
    switch (pieceData.id) {
      case 'farmer': return styles.spriteFarmer;
      case 'scholar': return styles.spriteScholar;
      case 'rogue': return styles.spriteRogue;
      default: return styles.spriteFarmer;
    }
  };

  const getAnimationClass = () => {
    const dir = spriteDirection;
    const state = spriteAnimationState;
    const effect = animationEffect;

    // Animation effects override normal animation states
    if (effect === 'shrink' || effect === 'matchClear') {
      const prefix = effect === 'matchClear' ? 'matchClear' : 'clear';
      const dirCap = dir.charAt(0).toUpperCase() + dir.slice(1);
      const className = `${prefix}${dirCap}`;
      return styles[className] || '';
    }

    if (state === 'frozen') return styles.frozen;

    const dirCap = dir.charAt(0).toUpperCase() + dir.slice(1);

    if (state === 'idle') {
      const className = `idle${dirCap}`;
      return styles[className] || styles.idleDown;
    }
    if (state === 'walking') {
      const className = `walk${dirCap}`;
      return styles[className] || styles.walkDown;
    }
    if (state === 'attacking') {
      const className = `attack${dirCap}`;
      return styles[className] || styles.attackDown;
    }

    // Default fallback
    return styles[`walking${dirCap}` as keyof typeof styles] || styles.walkDown;
  };

  const spriteScale = (gameState.cellSize * 0.9) / 130;
  const baseClass = getBaseClass();
  const animClass = getAnimationClass();
console.log('AnimatedSprite rendering:', {
  x, y,
  baseClass,
  animClass,
  pieceId: pieceData.id,
  calculatedPosition: [x * (gameState.cellSize + gameState.cellGap), y * (gameState.cellSize + gameState.cellGap), 0.02]
});
  return (
    <Html
      position={[x * (gameState.cellSize + gameState.cellGap), y * (gameState.cellSize + gameState.cellGap), 0.02]}
      center
      style={{ pointerEvents: 'none', scale: .5 }}
      zIndexRange={[0, 0]}
    >
      <div
        className={`${baseClass} ${animClass}`.trim()}
        style={{
          scale: spriteScale,
          transformOrigin: 'center',
          position: 'relative',
          display: 'block',
          visibility: 'visible'
        }}
      />
    </Html>
  );
}

// ============================================================================
// STATIC PIECE COMPONENT
// ============================================================================

function StaticPiece({ x, y, pieceData }: {
  x: number;
  y: number;
  pieceData: PieceData;
}) {
  const gameState = useGameState();
  
  return (
    <group>
      <mesh position={[x * (gameState.cellSize + gameState.cellGap), y * (gameState.cellSize + gameState.cellGap), 0]}>
        <planeGeometry args={[gameState.cellSize * 0.9, gameState.cellSize * 0.9]} />
        <meshStandardMaterial color={pieceData.color} metalness={0.3} roughness={0.7} />
        <Text position={[0, 0, 0.01]} fontSize={gameState.cellSize * 0.3} color="white" anchorX="center" anchorY="middle">
          {pieceData.tier}
        </Text>
      </mesh>

      <AnimatedSprite x={x} y={y} pieceData={pieceData} animationEffect="neutral" />
    </group>
  );
}

// ============================================================================
// GAMEBOARD COMPONENT
// ============================================================================

function GameBoard({ gameState, onAnimationComplete, onShrinkComplete, onGravityComplete, onMatchClearComplete, onFormationComplete, onScorePopupComplete, stagingRows, verticalPan, gravityPieces, matchClearPieces }: {
  gameState: GameState;
  onAnimationComplete: (animId: string, shouldShrink: boolean) => void;
  onShrinkComplete: (animId: string) => void;
  onGravityComplete: (animId: string) => void;
  onMatchClearComplete: (animId: string) => void;
  onFormationComplete: (animId: string) => void;
  onScorePopupComplete: (id: string) => void;
  stagingRows: number;
  verticalPan: number;
  gravityPieces: GridPiece[];
  matchClearPieces: GridPiece[];
}) {
  const gridOffset = {
    x: -gameState.gridCols * (gameState.cellSize + gameState.cellGap) / 2,
    y: -(gameState.gridRows + stagingRows) * (gameState.cellSize + gameState.cellGap) / 2 + verticalPan
  };

  const gridCells = useMemo(() => {
    const cells = [];
    for (let x = 0; x < gameState.gridCols; x++) {
      for (let y = 0; y < stagingRows; y++) {
        const isCursor = gameState.phase === 'placement' && x === gameState.cursorColumn && y === Math.floor(stagingRows / 2);
        cells.push(<GridCell key={`staging-${x}-${y}`} x={x} y={y} isStaging={true} isCursor={isCursor} gridRows={gameState.gridRows} stagingRows={stagingRows} />);
      }
      for (let y = 0; y < gameState.gridRows; y++) {
        const isCursor = (gameState.phase === 'swap' || gameState.phase === 'combat') && x === gameState.cursorColumn && y === gameState.cursorRow;
        cells.push(<GridCell key={`cell-${x}-${y}`} x={x} y={y} isStaging={false} isCursor={isCursor} gridRows={gameState.gridRows} stagingRows={stagingRows} />);
      }
    }
    return cells;
  }, [gameState.gridCols, gameState.gridRows, gameState.phase, gameState.cursorColumn, gameState.cursorRow, stagingRows]);

  const stagingPieces = useMemo(() => {
    if (gameState.phase !== 'placement' || gameState.stagingPieces.length === 0) return [];

    const positions = getPiecePositions(
      gameState.cursorColumn,
      gameState.rotation,
      gameState.shapeHeight,
      gameState.anchorIndex,
      stagingRows
    );

    const pieces = [];

    for (let idx = 0; idx < gameState.stagingPieces.length; idx++) {
      const stagingPiece = gameState.stagingPieces[idx];
      const [x, stagingY] = positions[idx];
      const y = gameState.gridRows + stagingY;
      const isAnchor = idx === gameState.anchorIndex;

      pieces.push(
        <group key={`staging-piece-${idx}`}>
          <StaticPiece
            x={x}
            y={y}
            pieceData={stagingPiece.pieceData}
          />
          {isAnchor && (
            <mesh
              position={[x * (gameState.cellSize + gameState.cellGap), y * (gameState.cellSize + gameState.cellGap), -0.005]}
            >
              <planeGeometry args={[gameState.cellSize * 1.05, gameState.cellSize * 1.05]} />
              <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
              />
            </mesh>
          )}
        </group>
      );
    }

    return pieces;
  }, [gameState.phase, gameState.stagingPieces, gameState.cursorColumn, gameState.rotation, gameState.shapeHeight, gameState.anchorIndex, gameState.gridRows, stagingRows, gameState.cellSize, gameState.cellGap]);

  const placedPieces = useMemo(() => {
    const pieces = [];

    const animatingPositions = new Set<string>();
    gravityPieces.forEach(p => animatingPositions.add(`${p.gridX},${p.gridY}`));
    matchClearPieces.forEach(p => animatingPositions.add(`${p.gridX},${p.gridY}`));
    gameState.formationPieces.forEach(p => animatingPositions.add(`${p.gridX},${p.gridY}`));

    for (let x = 0; x < gameState.gridCols; x++) {
      for (let y = 0; y < gameState.gridRows; y++) {
        const piece = gameState.grid[x][y];
        if (piece && !animatingPositions.has(`${x},${y}`)) {
          pieces.push(<StaticPiece
            key={`placed-${x}-${y}`}
            x={x}
            y={y}
            pieceData={piece}
          />);
        }
      }
    }
    return pieces;
  }, [gameState.grid, gameState.gridCols, gameState.gridRows, gameState.formationPieces, gravityPieces, matchClearPieces]);

  const highlights = useMemo(() => {
    if (!gameState.selectedCell) return [];

    const overlays = [];
    const swapTargets = getSwapTargets(
      gameState.selectedCell[0],
      gameState.selectedCell[1],
      gameState.swapRadius,
      gameState.gridCols,
      gameState.gridRows
    );

    // Selected cell highlight
    overlays.push(
      <mesh
        key="selected-highlight"
        position={[
          gameState.selectedCell[0] * (gameState.cellSize + gameState.cellGap),
          gameState.selectedCell[1] * (gameState.cellSize + gameState.cellGap),
          -0.005
        ]}
      >
        <planeGeometry args={[gameState.cellSize * 1.05, gameState.cellSize * 1.05]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    );

    // Swap target brightening
    swapTargets.forEach(([tx, ty]) => {
      overlays.push(
        <mesh
          key={`brighten-${tx}-${ty}`}
          position={[
            tx * (gameState.cellSize + gameState.cellGap),
            ty * (gameState.cellSize + gameState.cellGap),
            -0.01
          ]}
        >
          <planeGeometry args={[gameState.cellSize * 1.1, gameState.cellSize * 1.1]} />
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      );
    });

    return overlays;
  }, [gameState.selectedCell, gameState.swapRadius, gameState.gridCols, gameState.gridRows, gameState.cellSize, gameState.cellGap]);

  return (
    <group position={[gridOffset.x, gridOffset.y, 0]}>
      {gridCells}
      {stagingPieces}
      {placedPieces}
      {highlights}

      {gameState.animatingPieces.map((piece) => (
        <UnifiedAnimatedPiece
          key={piece.animId}
          piece={piece}
          effect="fall"
          onComplete={onAnimationComplete}
        />
      ))}

      {gameState.shrinkingPieces.map((piece) => (
        <UnifiedAnimatedPiece
          key={piece.animId}
          piece={piece}
          effect="shrink"
          onComplete={onShrinkComplete}
        />
      ))}

      {gravityPieces.map((piece) => (
        <UnifiedAnimatedPiece
          key={piece.animId}
          piece={piece}
          effect="fall"
          onComplete={onGravityComplete}
        />
      ))}

      {matchClearPieces.map((piece) => (
        <UnifiedAnimatedPiece
          key={piece.animId}
          piece={piece}
          effect="matchClear"
          onComplete={onMatchClearComplete}
        />
      ))}

      {gameState.formationPieces.map((piece) => (
        <UnifiedAnimatedPiece
          key={piece.animId}
          piece={piece}
          effect="formation"
          onComplete={onFormationComplete}
        />
      ))}

      {gameState.scorePopups.map((popup) => (
        <ScorePopupComponent
          key={popup.id}
          popup={popup}
          onComplete={onScorePopupComplete}
        />
      ))}
    </group>
  );
}

// ============================================================================
// SPRITE STATE CONTROLLER
// ============================================================================

function updateSpriteState(
  phase: 'placement' | 'swap' | 'formation' | 'combat',
  customOverride?: Partial<SpriteStateSheet>
): SpriteStateSheet {
  // Default states for each phase
  const phaseDefaults: Record<string, SpriteStateSheet> = {
    placement: {
      spriteEnabled: true,
      spriteDirection: 'down',
      spriteAnimationState: 'walking',
      spriteAnimationEffect: 'neutral',
    },
    swap: {
      spriteEnabled: true,
      spriteDirection: 'down',
      spriteAnimationState: 'walking',
      spriteAnimationEffect: 'neutral',
    },
    formation: {
      spriteEnabled: true,
      spriteDirection: 'right',
      spriteAnimationState: 'walking',
      spriteAnimationEffect: 'neutral',
    },
    combat: {
      spriteEnabled: true,
      spriteDirection: 'right',
      spriteAnimationState: 'attacking',
      spriteAnimationEffect: 'neutral',
    },
  };

  return {
    ...phaseDefaults[phase],
    ...customOverride,
  };
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export function PuzzleMatchGame() {
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      phase: 'placement',
      stagingPieces: generateShape(GAME_DEFAULTS.SHAPE_HEIGHT),
      cursorColumn: Math.floor(GAME_DEFAULTS.GRID_COLS / 2),
      cursorRow: GAME_DEFAULTS.CURSOR_ROW,
      rotation: GAME_DEFAULTS.ROTATION,
      grid: Array(GAME_DEFAULTS.GRID_COLS).fill(null).map(() => Array(GAME_DEFAULTS.GRID_ROWS).fill(null)),
      animatingPieces: [],
      shrinkingPieces: [],
      nextPieces: generateShape(GAME_DEFAULTS.SHAPE_HEIGHT),
      score: 0,
      shapeHeight: GAME_DEFAULTS.SHAPE_HEIGHT,
      anchorIndex: 0,
      gridCols: GAME_DEFAULTS.GRID_COLS,
      gridRows: GAME_DEFAULTS.GRID_ROWS,
      selectedCell: null,
      swapRadius: GAME_DEFAULTS.SWAP_RADIUS,
      cursorMovements: 0,
      swapsMade: 0,
      maxMovements: GAME_DEFAULTS.MAX_MOVEMENTS,
      maxSwaps: GAME_DEFAULTS.MAX_SWAPS,
      minMatchCount: GAME_DEFAULTS.MIN_MATCH_COUNT,
      matchCount: 0,
      isProcessingMatches: false,
      combatTimer: GAME_DEFAULTS.COMBAT_TIMER,
      combatTimerMax: GAME_DEFAULTS.COMBAT_TIMER_MAX,
      combatMessage: null,
      combatLog: [],
      enemyCount: 0,
      casualtyPercentage: GAME_DEFAULTS.CASUALTY_PERCENTAGE,
      formationPieces: [],
      combatStep: 0,
      enableMatchLogic: GAME_DEFAULTS.ENABLE_MATCH_LOGIC,
      matchEffect: GAME_DEFAULTS.MATCH_EFFECT,
      combatTimerActive: false,
      gameStateTracker: {
        gameDropturnTracker: {},
        cumulativeScore: 0,
        pieceTypeClearTracker: {},
        highestCombo: 0,
      },
      currentDropTurn: null,
      currentComboLink: 0,
      pieceClearValue: GAME_DEFAULTS.PIECE_CLEAR_VALUE,
      baseScalar: GAME_DEFAULTS.BASE_SCALAR,
      scorePopups: [],
      dropSpeed: GAME_DEFAULTS.DROP_SPEED,
      gravitySpeed: GAME_DEFAULTS.GRAVITY_SPEED,
      scoreFloatSpeed: GAME_DEFAULTS.SCORE_FLOAT_SPEED,
      scoreScaleSpeed: GAME_DEFAULTS.SCORE_SCALE_SPEED,
      scoreFadeStart: GAME_DEFAULTS.SCORE_FADE_START,
      spriteStateSheet: updateSpriteState('placement'),
      mergeYPriority: GAME_DEFAULTS.MERGE_Y_PRIORITY,
      mergeXPriority: GAME_DEFAULTS.MERGE_X_PRIORITY,
      mergeXYPriority: GAME_DEFAULTS.MERGE_XY_PRIORITY,
      formationDirection: GAME_DEFAULTS.FORMATION_DIRECTION,
      pendingMergeSpawns: [],
      // NEW ANIMATION CONSTANTS
      cellSize: GAME_DEFAULTS.CELL_SIZE,
      cellGap: GAME_DEFAULTS.CELL_GAP,
      formationSpeed: GAME_DEFAULTS.FORMATION_SPEED,
      shrinkDuration: GAME_DEFAULTS.SHRINK_DURATION,
      matchClearDuration: GAME_DEFAULTS.MATCH_CLEAR_DURATION,
      scorePopupDuration: GAME_DEFAULTS.SCORE_POPUP_DURATION,
      defaultGravitySpeed: GAME_DEFAULTS.GRAVITY_SPEED,
      activePieces: GAME_DEFAULTS.ACTIVE_PIECES || Object.keys(PIECES),
    };
  });
  
  const [isDropping, setIsDropping] = useState(false);
  const [phaseTransitionText, setPhaseTransitionText] = useState<string | null>(null);
  const [zoomMultiplier, setZoomMultiplier] = useState(0.66);
  const [verticalPan, setVerticalPan] = useState(0.75);
  const [gravityPieces, setGravityPieces] = useState<GridPiece[]>([]);
  const [matchClearPieces, setMatchClearPieces] = useState<GridPiece[]>([]);
  const [previousDropTurn, setPreviousDropTurn] = useState<any>(null);
  const [unitTypes, setUnitTypes] = useState<{ [key: string]: UnitTypeData }>(PIECES);

  const stagingRows = 2 * (gameState.shapeHeight - 1) + 1;
  const totalRows = gameState.gridRows + stagingRows;

  const totalHeight = totalRows * (gameState.cellSize + gameState.cellGap);
  const fov = 10;
  const fovRadians = (fov * Math.PI) / 180;
  const cameraDistance = totalHeight / (1 * Math.tan(fovRadians / 2));
  const adjustedCameraDistance = cameraDistance * zoomMultiplier;

  // Calculate unit counts in game
  const unitCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (let x = 0; x < gameState.gridCols; x++) {
      for (let y = 0; y < gameState.gridRows; y++) {
        const piece = gameState.grid[x][y];
        if (piece) {
          counts[piece.id] = (counts[piece.id] || 0) + 1;
        }
      }
    }
    return counts;
  }, [gameState.grid, gameState.gridCols, gameState.gridRows]);

  const handleScorePopupComplete = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      scorePopups: prev.scorePopups.filter(p => p.id !== id),
    }));
  }, []);

  const handlePowerUp = useCallback((unitId: string) => {
    setUnitTypes(prev => {
      const unit = prev[unitId];
      const newExp = unit.baseStats.experience + 50;
      const newLevel = Math.floor(newExp / unit.baseStats.maxExperience) + 1;

      return {
        ...prev,
        [unitId]: {
          ...unit,
          baseStats: {
            ...unit.baseStats,
            level: newLevel,
            experience: newExp % unit.baseStats.maxExperience,
            hitpoints: unit.baseStats.hitpoints + (newLevel - unit.baseStats.level) * 20,
            strength: unit.baseStats.strength + (newLevel - unit.baseStats.level) * 2,
            dexterity: unit.baseStats.dexterity + (newLevel - unit.baseStats.level) * 2,
            intelligence: unit.baseStats.intelligence + (newLevel - unit.baseStats.level) * 2,
          },
        },
      };
    });
  }, []);

  const handleUseItem = useCallback((unitId: string) => {
    console.log(`Use item on ${unitId}`);
  }, []);

  const toggleActivePiece = useCallback((pieceId: string) => {
    setGameState(prev => {
      const newActivePieces = [...prev.activePieces];
      const index = newActivePieces.indexOf(pieceId);
      if (index > -1) {
        newActivePieces.splice(index, 1);
      } else {
        newActivePieces.push(pieceId);
      }
      return { ...prev, activePieces: newActivePieces };
    });
  }, []);

  const processMatches = useCallback(() => {
    setGameState(prev => {
      const matches = findAllMatches(prev.grid, prev.gridCols, prev.gridRows, prev.minMatchCount);

      if (matches.length === 0) {
        if (prev.currentDropTurn) {
          const dropTurnId = Object.keys(prev.gameStateTracker.gameDropturnTracker).length;
          const newGameDropturnTracker = {
            ...prev.gameStateTracker.gameDropturnTracker,
            [dropTurnId]: prev.currentDropTurn,
          };

          const newCumulativeScore = prev.gameStateTracker.cumulativeScore + prev.currentDropTurn.totalComboChainScore;
          const newHighestCombo = Math.max(prev.gameStateTracker.highestCombo, prev.currentDropTurn.totalComboCount);

          setPreviousDropTurn(prev.currentDropTurn);

          return {
            ...prev,
            isProcessingMatches: false,
            currentDropTurn: null,
            currentComboLink: 0,
            score: newCumulativeScore,
            gameStateTracker: {
              ...prev.gameStateTracker,
              gameDropturnTracker: newGameDropturnTracker,
              cumulativeScore: newCumulativeScore,
              highestCombo: newHighestCombo,
            },
          };
        }

        return { ...prev, isProcessingMatches: false };
      }

      let dropTurn = prev.currentDropTurn;
      let comboLink = prev.currentComboLink + 1;

      if (!dropTurn) {
        dropTurn = {
          comboLinkScoreTracker: {},
          totalComboCount: 0,
          totalComboChainScore: 0,
        };
      }

      const clearPieces: GridPiece[] = [];
      const newGrid = prev.grid.map(col => [...col]);
      const newScorePopups: ScorePopup[] = [...prev.scorePopups];
      const mergeSpawns: MergeSpawnInfo[] = [];

      const pieceClearCountPerType: { [key: string]: number } = {};
      let piecesClearedCount = 0;

      matches.forEach((group) => {
        piecesClearedCount += group.length;

        const firstPiecePos = group[0];
        const firstPiece = prev.grid[firstPiecePos[0]][firstPiecePos[1]];

        // HANDLE MERGE SPAWNS - calculate where evolved unit will go
        if (prev.matchEffect === 'merge' && firstPiece) {
          const spawnPos = findMergeSpawnPosition(
            group,
            prev.mergeYPriority,
            prev.mergeXPriority,
            prev.mergeXYPriority
          );

          const allMatchedPieces = group.map(([x, y]) => prev.grid[x][y]!).filter(p => p !== null);
          const upgradedPiece = getUpgradedPiece(allMatchedPieces);

          mergeSpawns.push({
            x: spawnPos.x,
            y: spawnPos.y,
            evolvedPiece: upgradedPiece,
          });
        }

        // Clear matched pieces
        group.forEach(([x, y]) => {
          const piece = prev.grid[x][y];
          if (piece) {
            pieceClearCountPerType[piece.id] = (pieceClearCountPerType[piece.id] || 0) + 1;

            setUnitTypes(prevUnits => ({
              ...prevUnits,
              [piece.id]: {
                ...prevUnits[piece.id],
                clearedCount: prevUnits[piece.id].clearedCount + 1,
              },
            }));

            clearPieces.push({
              pieceData: piece,
              gridX: x,
              gridY: y,
              visualY: y,
              animId: `match-clear-${Date.now()}-${x}-${y}-${Math.random()}`,
            });
          }
          newGrid[x][y] = null;
        });
      });
      const debug = prev.baseScalar
      const thisLinkClearScore = prev.pieceClearValue * piecesClearedCount;
      const x = (calculateComboMultiplier(comboLink, prev.baseScalar))
      const thisLinkClearBonus = Math.floor((thisLinkClearScore * x ) - thisLinkClearScore);

      // const thisLinkClearBonus = Math.floor((1+));
      const thisLinkScoreTuple: [number, number] = [thisLinkClearScore, thisLinkClearBonus];
      const thisLinkScoreTotal = thisLinkClearScore + thisLinkClearBonus;
      console.log('bonus:', ` ${thisLinkClearScore}, " + ", ${debug} , ${thisLinkClearBonus} `);

      const comboLinkTracker = {
        pieceClearCountPerType,
        piecesClearedCount,
        thisLinkClearScore,
        thisLinkClearBonus,
        thisLinkScoreTuple,
        thisLinkScoreTotal,
      };

      dropTurn.comboLinkScoreTracker[comboLink] = comboLinkTracker;
      dropTurn.totalComboCount = comboLink;
      dropTurn.totalComboChainScore = 0;
      for (const linkTracker of Object.values(dropTurn.comboLinkScoreTracker)) {
        dropTurn.totalComboChainScore += (linkTracker as { thisLinkScoreTotal: number }).thisLinkScoreTotal;
      }

      let maxX = -1;
      let maxY = -1;
      clearPieces.forEach(p => {
        if (p.gridX > maxX || (p.gridX === maxX && p.gridY > maxY)) {
          maxX = p.gridX;
          maxY = p.gridY;
        }
      });

      newScorePopups.push({
        id: `score-${Date.now()}-${Math.random()}`,
        x: maxX,
        y: maxY,
        score: thisLinkScoreTotal,
        elapsed: 0,
      });

      const newPieceTypeClearTracker = { ...prev.gameStateTracker.pieceTypeClearTracker };
      Object.entries(pieceClearCountPerType).forEach(([pieceType, count]) => {
        newPieceTypeClearTracker[pieceType] = (newPieceTypeClearTracker[pieceType] || 0) + count;
      });

      setMatchClearPieces(clearPieces);

      const newMatchCount = prev.matchCount + matches.length;

      return {
        ...prev,
        grid: newGrid,
        matchCount: newMatchCount,
        isProcessingMatches: true,
        currentDropTurn: dropTurn,
        currentComboLink: comboLink,
        scorePopups: newScorePopups,
        pendingMergeSpawns: mergeSpawns,
        gameStateTracker: {
          ...prev.gameStateTracker,
          pieceTypeClearTracker: newPieceTypeClearTracker,
        },
      };
    });
  }, []);

  const handleMatchClearComplete = useCallback((animId: string) => {
    setMatchClearPieces(prev => {
      const remaining = prev.filter(p => p.animId !== animId);

      if (remaining.length === 0) {
        setGameState(gameState => {
          // FIRST: Place all evolved units immediately
          const gridWithSpawns = gameState.grid.map(col => [...col]);
          gameState.pendingMergeSpawns.forEach(spawn => {
            gridWithSpawns[spawn.x][spawn.y] = spawn.evolvedPiece;
          });

          // SECOND: Apply gravity (evolved units are already in place)
          const { newGrid, fallingPieces } = applyGravity(
            gridWithSpawns,
            gameState.gridCols,
            gameState.gridRows
          );

          if (fallingPieces.length === 0) {
            // No gravity needed
            if (gameState.currentDropTurn && gameState.currentDropTurn.totalComboCount > 1) {
              const avgX = gameState.gridCols / 2;
              const avgY = gameState.gridRows / 2;

              const comboPopup: ScorePopup = {
                id: `combo-total-${Date.now()}-${Math.random()}`,
                x: avgX,
                y: avgY,
                score: gameState.currentDropTurn.totalComboChainScore,
                elapsed: 0,
                isComboTotal: true,
                comboCount: gameState.currentDropTurn.totalComboCount,
              };

              setGameState(s => ({
                ...s,
                scorePopups: [...s.scorePopups, comboPopup],
              }));
            }

            setTimeout(() => processMatches(), 100);

            return {
              ...gameState,
              grid: newGrid,
              pendingMergeSpawns: [],
            };
          } else {
            // Gravity in progress
            setGravityPieces(fallingPieces);
            return {
              ...gameState,
              grid: newGrid,
              pendingMergeSpawns: [],
            };
          }
        });
      }

      return remaining;
    });
  }, [processMatches]);

  const handleGravityComplete = useCallback((animId: string) => {
    setGravityPieces(prev => {
      const remaining = prev.filter(p => p.animId !== animId);

      if (remaining.length === 0) {
        // All gravity complete, check for new matches
        setTimeout(() => processMatches(), 300);
      }

      return remaining;
    });
  }, [processMatches]);

  const handleFormationComplete = useCallback((animId: string) => {
    setGameState(prev => {
      const remaining = prev.formationPieces.filter(p => p.animId !== animId);

      if (remaining.length === 0) {
        const enemyCount = Math.floor(Math.random() * 10) + 1;
        setPhaseTransitionText('Formation Complete!\n\nCombat Phase Beginning...');

        setTimeout(() => {
          setPhaseTransitionText(null);
          setGameState(state => ({
            ...state,
            combatMessage: `${enemyCount} enemies encountered!`,
          }));
        }, 2000);

        return {
          ...prev,
          formationPieces: [],
          phase: 'combat',
          spriteStateSheet: updateSpriteState('combat'),
          enemyCount,
          combatMessage: null,
          combatStep: 0,
          combatTimer: prev.combatTimerMax,
          combatTimerActive: false,
        };
      }

      return {
        ...prev,
        formationPieces: remaining,
      };
    });
  }, []);

  // Phase transition effect to ensure staging pieces are refreshed
  useEffect(() => {
    if (
      gameState.phase === 'placement' &&
      !isDropping &&
      gameState.animatingPieces.length === 0 &&
      gameState.shrinkingPieces.length === 0 &&
      gameState.stagingPieces.length === 0 &&
      !gameState.isProcessingMatches
    ) {
      let hasPlacedPieces = false;
      for (let x = 0; x < gameState.gridCols; x++) {
        for (let y = 0; y < gameState.gridRows; y++) {
          if (gameState.grid[x][y] !== null) {
            hasPlacedPieces = true;
            break;
          }
        }
        if (hasPlacedPieces) break;
      }

      if (hasPlacedPieces) {
        setPhaseTransitionText('Placement Phase Over!\n\nSwap Phase Beginning...');

        setTimeout(() => {
          setPhaseTransitionText(null);
          setGameState(state => ({
            ...state,
            phase: 'swap',
            spriteStateSheet: updateSpriteState('swap'),
            cursorColumn: Math.floor(state.gridCols / 2),
            cursorRow: 0,
            cursorMovements: 0,
            swapsMade: 0,
            selectedCell: null,
          }));
        }, 2000);
      }
    }
  }, [
    gameState.phase,
    isDropping,
    gameState.animatingPieces.length,
    gameState.shrinkingPieces.length,
    gameState.stagingPieces.length,
    gameState.isProcessingMatches,
    gameState.grid,
    gameState.gridCols,
    gameState.gridRows,
  ]);

  useEffect(() => {
    if (gameState.phase !== 'combat' || !gameState.combatTimerActive) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.combatTimer > 0) {
          return { ...prev, combatTimer: prev.combatTimer - 1 };
        } else {
          return advanceCombatStep(prev);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.phase, gameState.combatTimerActive]);

  const advanceCombatStep = (prev: GameState): GameState => {
    let nextStep = prev.combatStep + 1;
    let nextMessage: string | null = null;
    let newPhase = prev.phase;
    let newGrid = prev.grid;
    const newShrinkingPieces: GridPiece[] = [];

    if (nextStep === 1) {
      nextMessage = "Player team attacks!";
    } else if (nextStep === 2) {
      nextMessage = "Enemy team attacks!";
    } else if (nextStep === 3) {
      const allPieces: Array<{ x: number; y: number; piece: PieceData }> = [];
      for (let x = 0; x < prev.gridCols; x++) {
        for (let y = 0; y < prev.gridRows; y++) {
          if (prev.grid[x][y]) {
            allPieces.push({ x, y, piece: prev.grid[x][y]! });
          }
        }
      }

      const casualtyCount = Math.max(1, Math.floor(allPieces.length * (prev.casualtyPercentage / 100)));
      const casualties = allPieces.sort(() => Math.random() - 0.5).slice(0, casualtyCount);

      casualties.forEach(({ x, y, piece }) => {
        setUnitTypes(prevUnits => ({
          ...prevUnits,
          [piece.id]: {
            ...prevUnits[piece.id],
            combatDeaths: prevUnits[piece.id].combatDeaths + 1,
          },
        }));

        newShrinkingPieces.push({
          pieceData: piece,
          gridX: x,
          gridY: y,
          visualY: y,
          animId: `casualty-${Date.now()}-${x}-${y}-${Math.random()}`,
        });
      });

      newGrid = prev.grid.map(col => [...col]);
      casualties.forEach(({ x, y }) => {
        newGrid[x][y] = null;
      });

      nextMessage = `${casualtyCount} casualties suffered!`;
    } else if (nextStep === 4) {
      nextMessage = "Player team attacks!";
    } else if (nextStep === 5) {
      nextMessage = "Enemies have been defeated!";
    } else {
      newPhase = 'placement';
      setPhaseTransitionText(null);

      const { newGrid: gravityGrid, fallingPieces } = applyGravity(prev.grid, prev.gridCols, prev.gridRows);
      newGrid = gravityGrid;

      if (fallingPieces.length > 0) {
        setGravityPieces(fallingPieces);
      }

      return {
        ...prev,
        phase: newPhase,
        spriteStateSheet: updateSpriteState('placement'),
        grid: newGrid,
        combatMessage: null,
        combatLog: [],
        combatStep: 0,
        combatTimer: prev.combatTimerMax,
        combatTimerActive: false,
        stagingPieces: prev.nextPieces,
        nextPieces: generateShape(prev.shapeHeight),
        cursorColumn: Math.floor(prev.gridCols / 2),
        rotation: 0,
        anchorIndex: 0,
        cursorMovements: 0,
        swapsMade: 0,
        selectedCell: null,
      };
    }

    return {
      ...prev,
      grid: newGrid,
      shrinkingPieces: [...prev.shrinkingPieces, ...newShrinkingPieces],
      combatMessage: nextMessage,
      combatStep: nextStep,
      combatTimer: prev.combatTimerMax,
      combatTimerActive: false,
    };
  };

  const dismissCombatMessage = useCallback(() => {
    setGameState(prev => {
      if (!prev.combatMessage) return prev;

      const newLog = [...prev.combatLog, prev.combatMessage];

      if (prev.combatStep === 5) {
        return advanceCombatStep({
          ...prev,
          combatMessage: null,
          combatLog: newLog,
        });
      }

      return {
        ...prev,
        combatMessage: null,
        combatLog: newLog,
        combatTimerActive: true,
      };
    });
    setPhaseTransitionText(null);
  }, []);

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameState.isProcessingMatches) return;

    if (gameState.phase === 'placement') {
      if (isDropping) return;

      setGameState(prev => {
        if (direction === 'left' || direction === 'right') {
          const delta = direction === 'left' ? -1 : 1;
          const newColumn = prev.cursorColumn + delta;
          if (canPlaceAt(newColumn, prev.rotation, prev.shapeHeight, prev.anchorIndex, stagingRows, prev.gridCols)) {
            return { ...prev, cursorColumn: newColumn };
          }
        } else if (direction === 'up' || direction === 'down') {
          const delta = direction === 'up' ? 1 : -1;
          const newAnchor = prev.anchorIndex + delta;
          if (newAnchor >= 0 && newAnchor < prev.shapeHeight) {
            if (canPlaceAt(prev.cursorColumn, prev.rotation, prev.shapeHeight, newAnchor, stagingRows, prev.gridCols)) {
              return { ...prev, anchorIndex: newAnchor };
            }
          }
        }
        return prev;
      });
    } else if (gameState.phase === 'swap' || gameState.phase === 'combat') {
      setGameState(prev => {
        if (direction === 'left' || direction === 'right') {
          const delta = direction === 'left' ? -1 : 1;
          const newColumn = prev.cursorColumn + delta;
          if (newColumn >= 0 && newColumn < prev.gridCols) {
            const newMovements = prev.phase === 'swap' ? prev.cursorMovements + 1 : prev.cursorMovements;
            return { ...prev, cursorColumn: newColumn, cursorMovements: newMovements };
          }
        } else if (direction === 'up' || direction === 'down') {
          const delta = direction === 'up' ? 1 : -1;
          const newRow = prev.cursorRow + delta;
          if (newRow >= 0 && newRow < prev.gridRows) {
            const newMovements = prev.phase === 'swap' ? prev.cursorMovements + 1 : prev.cursorMovements;
            return { ...prev, cursorRow: newRow, cursorMovements: newMovements };
          }
        }
        return prev;
      });
    }
  }, [gameState.phase, gameState.isProcessingMatches, isDropping, stagingRows]);

  const rotate = useCallback((clockwise: boolean) => {
    if (gameState.phase !== 'placement' || isDropping || gameState.isProcessingMatches) return;

    setGameState(prev => {
      const newRotation = clockwise
        ? (prev.rotation + 90) % 360
        : (prev.rotation - 90 + 360) % 360;

      if (canPlaceAt(prev.cursorColumn, newRotation, prev.shapeHeight, prev.anchorIndex, stagingRows, prev.gridCols)) {
        return { ...prev, rotation: newRotation };
      }
      return prev;
    });
  }, [gameState.phase, gameState.isProcessingMatches, isDropping, stagingRows]);

  const selectOrSwap = useCallback(() => {
    if ((gameState.phase !== 'swap' && gameState.phase !== 'combat') || gameState.isProcessingMatches) return;

    setGameState(prev => {
      if (!prev.selectedCell) {
        return { ...prev, selectedCell: [prev.cursorColumn, prev.cursorRow] };
      }

      const [selX, selY] = prev.selectedCell;
      const targets = getSwapTargets(selX, selY, prev.swapRadius, prev.gridCols, prev.gridRows);
      const isValidTarget = targets.some(([x, y]) => x === prev.cursorColumn && y === prev.cursorRow);

      if (isValidTarget) {
        const newGrid = prev.grid.map(col => [...col]);
        const temp = newGrid[selX][selY];
        newGrid[selX][selY] = newGrid[prev.cursorColumn][prev.cursorRow];
        newGrid[prev.cursorColumn][prev.cursorRow] = temp;

        const newSwapsMade = prev.phase === 'swap' ? prev.swapsMade + 1 : prev.swapsMade;

        const newState = {
          ...prev,
          grid: newGrid,
          selectedCell: null,
          swapsMade: newSwapsMade,
        };

        if (prev.phase === 'swap' && newSwapsMade >= newState.maxSwaps) {
          setPhaseTransitionText('Swap Phase Complete!\n\nFormation Phase Beginning...');

          setTimeout(() => {
            setPhaseTransitionText(null);
            setGameState(state => {
              const { newGrid: formationGrid, allMovements } = applyDeployment(state.grid, state.gridCols, state.gridRows);

              const formationPieces: GridPiece[] = allMovements.map(m => ({
                pieceData: m.piece,
                gridX: m.toX,
                gridY: m.toY,
                visualX: m.fromX,
                visualY: m.fromY,
                animId: `formation-${Date.now()}-${m.fromX}-${m.fromY}-${m.toX}-${m.toY}-${Math.random()}`,
              }));

              if (formationPieces.length === 0) {
                const enemyCount = Math.floor(Math.random() * 10) + 1;
                setPhaseTransitionText('Swap Phase Complete!\n\nCombat Phase Beginning...');

                setTimeout(() => {
                  setPhaseTransitionText(null);
                  setGameState(s => ({
                    ...s,
                    combatMessage: `${enemyCount} enemies encountered!`,
                  }));
                }, 2000);

                return {
                  ...state,
                  grid: formationGrid,
                  phase: 'combat',
                  spriteStateSheet: updateSpriteState('combat'),
                  enemyCount,
                  combatMessage: null,
                  combatStep: 0,
                  combatTimer: state.combatTimerMax,
                  combatTimerActive: false,
                };
              }

              return {
                ...state,
                grid: formationGrid,
                phase: 'formation',
                spriteStateSheet: updateSpriteState('formation'),
                formationPieces,
              };
            });
          }, 2000);

          return newState;
        }

        if (prev.phase === 'combat') {
          return newState;
        }

        const { newGrid: gravityGrid, fallingPieces } = applyGravity(newGrid, prev.gridCols, prev.gridRows);

        if (fallingPieces.length > 0) {
          setGravityPieces(fallingPieces);
        }

        if (prev.enableMatchLogic) {
          setTimeout(() => processMatches(), 300);
        }

        return {
          ...newState,
          grid: gravityGrid,
        };
      }

      return { ...prev, selectedCell: [prev.cursorColumn, prev.cursorRow] };
    });
  }, [gameState.phase, gameState.isProcessingMatches, processMatches]);

  const drop = useCallback(() => {
    if (gameState.phase !== 'placement' || isDropping || gameState.isProcessingMatches) return;

    setGameState(prev => {
      const positions = getPiecePositions(
        prev.cursorColumn,
        prev.rotation,
        prev.shapeHeight,
        prev.anchorIndex,
        stagingRows
      );
      const newAnimatingPieces: GridPiece[] = [];

      const piecesByColumn: Map<number, Array<{ piece: StagingPiece; stagingY: number; index: number }>> = new Map();

      for (let i = 0; i < prev.stagingPieces.length; i++) {
        const [x, stagingY] = positions[i];
        if (!piecesByColumn.has(x)) {
          piecesByColumn.set(x, []);
        }
        piecesByColumn.get(x)!.push({
          piece: prev.stagingPieces[i],
          stagingY: stagingY,
          index: i
        });
      }

      for (const [columnX, piecesInColumn] of piecesByColumn.entries()) {
        piecesInColumn.sort((a, b) => a.stagingY - b.stagingY);

        const availableCells: number[] = [];
        for (let y = 0; y < prev.gridRows; y++) {
          if (prev.grid[columnX][y] === null) {
            availableCells.push(y);
          }
        }

        for (let i = 0; i < piecesInColumn.length; i++) {
          const { piece, stagingY, index } = piecesInColumn[i];

          let finalY: number;
          if (i < availableCells.length) {
            finalY = availableCells[i];
          } else {
            const overflowIndex = i - availableCells.length;
            finalY = prev.gridRows + overflowIndex;
          }

          newAnimatingPieces.push({
            pieceData: piece.pieceData,
            gridX: columnX,
            gridY: finalY,
            visualY: prev.gridRows + stagingY,
            animId: `anim-${Date.now()}-${index}-${columnX}-${finalY}-${Math.random()}`,
          });
        }
      }

      setIsDropping(true);

      return {
        ...prev,
        animatingPieces: newAnimatingPieces,
        stagingPieces: [],
      };
    });
  }, [gameState.phase, gameState.isProcessingMatches, isDropping, stagingRows]);

  const handleAnimationComplete = useCallback((animId: string, shouldShrink: boolean) => {
    setGameState(prev => {
      const completedPiece = prev.animatingPieces.find(p => p.animId === animId);
      if (!completedPiece) return prev;

      const remainingAnimating = prev.animatingPieces.filter(p => p.animId !== animId);

      if (completedPiece.gridY >= prev.gridRows) {
        return {
          ...prev,
          animatingPieces: remainingAnimating,
          shrinkingPieces: [...prev.shrinkingPieces, completedPiece],
        };
      } else {
        const newGrid = prev.grid.map(col => [...col]);
        newGrid[completedPiece.gridX][completedPiece.gridY] = completedPiece.pieceData;

        if (remainingAnimating.length === 0 && prev.shrinkingPieces.length === 0) {
          setIsDropping(false);

          if (prev.enableMatchLogic) {
            setTimeout(() => processMatches(), 300);
          }

          return {
            ...prev,
            grid: newGrid,
            animatingPieces: [],
            stagingPieces: prev.nextPieces,
            nextPieces: generateShape(prev.shapeHeight),
            cursorColumn: Math.floor(prev.gridCols / 2),
            rotation: 0,
            anchorIndex: 0,
          };
        }

        return {
          ...prev,
          grid: newGrid,
          animatingPieces: remainingAnimating,
        };
      }
    });
  }, [processMatches]);

  const handleShrinkComplete = useCallback((animId: string) => {
    setGameState(prev => {
      const remainingShrinking = prev.shrinkingPieces.filter(p => p.animId !== animId);

      if (remainingShrinking.length === 0 && prev.animatingPieces.length === 0) {
        setIsDropping(false);
      }

      return {
        ...prev,
        shrinkingPieces: remainingShrinking,
      };
    });
  }, []);

  const updateShapeHeight = useCallback((height: number) => {
    if (height >= gameState.gridCols || height < 1) return;

    setGameState(prev => ({
      ...prev,
      shapeHeight: height,
      anchorIndex: 0,
      stagingPieces: generateShape(height),
      nextPieces: generateShape(height),
      cursorColumn: Math.floor(prev.gridCols / 2),
      rotation: 0,
    }));
  }, [gameState.gridCols]);

  const updateGridSize = useCallback((cols: number, rows: number) => {
    if (cols < 3 || rows < 3 || gameState.shapeHeight >= cols) return;

    setGameState(prev => ({
      ...prev,
      gridCols: cols,
      gridRows: rows,
      grid: Array(cols).fill(null).map(() => Array(rows).fill(null)),
      cursorColumn: Math.floor(cols / 2),
      cursorRow: 0,
      rotation: 0,
      phase: 'placement',
      spriteStateSheet: updateSpriteState('placement'),
    }));
  }, [gameState.shapeHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotate(false);
          break;
        case 'x':
        case 'X':
          e.preventDefault();
          rotate(true);
          break;
        case ' ':
          e.preventDefault();
          if (gameState.phase === 'placement') {
            drop();
          } else if (gameState.phase === 'swap' || gameState.phase === 'combat') {
            selectOrSwap();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, rotate, drop, selectOrSwap, gameState.phase]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0a1a' }}>
      {phaseTransitionText && <MessageOverlay message={phaseTransitionText} />}
      {gameState.combatMessage && <MessageOverlay message={gameState.combatMessage} onDismiss={dismissCombatMessage} color="#ff0000" showButton />}

      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace', zIndex: 1000, maxWidth: '250px' }}>
        <PhaseInfo gameState={gameState} />

        {gameState.phase === 'placement' && (
          <div style={{ ...STYLES.panel, border: '2px solid #2196F3' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2196F3', fontSize: '16px' }}>Next Shape</h3>
            {gameState.nextPieces.map((sp: { pieceData: { color: any; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; }, idx: React.Key | null | undefined) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                <div style={{ width: '20px', height: '20px', background: sp.pieceData.color, border: '1px solid #fff' }} />
                <span style={{ fontSize: '14px' }}>{sp.pieceData.name}</span>
              </div>
            ))}
          </div>
        )}

        {gameState.phase === 'combat' && gameState.combatLog.length > 0 && (
          <div style={{ ...STYLES.panel, border: '2px solid #666', maxHeight: '200px', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '14px' }}>Combat Log</h3>
            {gameState.combatLog.map((msg: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, idx: React.Key | null | undefined) => <p key={idx} style={{ margin: '5px 0', fontSize: '12px', color: '#ccc' }}>• {msg}</p>)}
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: '120px', left: '20px', color: 'white', fontFamily: 'monospace', zIndex: 1000, maxWidth: '350px' }}>
        <div style={{ ...STYLES.panel, border: '2px solid #00ff00', maxHeight: '400px', overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ff00', fontSize: '16px' }}>Unit Debug Key</h3>
          {Object.values(unitTypes).map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onPowerUp={handlePowerUp}
              onUseItem={handleUseItem}
              inGameCount={unitCounts[unit.id] || 0}
            />
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '380px', color: 'white', fontFamily: 'monospace', zIndex: 1000, maxWidth: '240px' }}>
        <div style={{ ...STYLES.panel, border: '2px solid #00ffff', minWidth: '240px', maxHeight: '80vh', overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#00ffff', fontSize: '16px' }}>Debug Reader</h3>
          <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #666' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#00aaff', fontSize: '13px' }}>Game State gameStateTracker</h4>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify({
                cumulativeScore: gameState.gameStateTracker.cumulativeScore, highestCombo: gameState.gameStateTracker.highestCombo,
                totalDropTurns: Object.keys(gameState.gameStateTracker.gameDropturnTracker).length,
                pieceTypeClearTracker: gameState.gameStateTracker.pieceTypeClearTracker
              }, null, 2)}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#00aaff', fontSize: '13px' }}>Previous Drop Turn</h4>
            {previousDropTurn ? (
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify({
                  totalComboCount: previousDropTurn.totalComboCount, totalComboChainScore: previousDropTurn.totalComboChainScore,
                  links: Object.entries(previousDropTurn.comboLinkScoreTracker).map(([linkNum, linkData]: [string, any]) => ({
                    link: parseInt(linkNum), piecesClearedCount: linkData.piecesClearedCount, clearScore: linkData.thisLinkClearScore,
                    bonus: linkData.thisLinkClearBonus, total: linkData.thisLinkScoreTotal, pieceTypes: linkData.pieceClearCountPerType
                  }))
                }, null, 2)}
              </div>
            ) : <p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>No completed turn yet</p>}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '120px', color: 'white', fontFamily: 'monospace', zIndex: 1000 }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px', border: '2px solid #ffaa00', minWidth: '240px', maxHeight: '80vh', overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffaa00', fontSize: '16px' }}>Debug Console</h3>
          <p style={{ margin: '5px 0', fontSize: '13px' }}>Phase: {gameState.phase}</p>
          <p style={{ margin: '5px 0', fontSize: '13px' }}>Processing: {gameState.isProcessingMatches ? 'Yes' : 'No'}</p>
          <p style={{ margin: '5px 0', fontSize: '13px' }}>Combo Link: {gameState.currentComboLink}</p>

          <DebugSection title="Scoring" color="#ff6600">
            {[
              { label: 'Piece Value', key: 'pieceClearValue', min: 1, max: 1000 },
              { label: 'Base Scalar', key: 'baseScalar', min: 1, max: 100, step: 0.5 }
            ].map(cfg => <DebugNumberInput key={cfg.key} label={cfg.label} value={gameState[cfg.key as keyof GameState] as number}
              onChange={(val) => setGameState(prev => ({ ...prev, [cfg.key]: val }))} min={cfg.min} max={cfg.max} step={cfg.step} />)}
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#888' }}>Highest Combo: {gameState.gameStateTracker.highestCombo}</p>
          </DebugSection>

          <DebugSection title="Animation Speeds" color="#ff6600">
            {[
              { label: 'Drop Speed', key: 'dropSpeed', min: 1, max: 20, step: 0.5 },
              { label: 'Gravity Speed', key: 'gravitySpeed', min: 1, max: 20, step: 0.5 },
              { label: 'Score Float', key: 'scoreFloatSpeed', min: 0.5, max: 10, step: 0.5 },
              { label: 'Score Scale', key: 'scoreScaleSpeed', min: 0.1, max: 2, step: 0.1 },
              { label: 'Score Fade @', key: 'scoreFadeStart', min: 0.1, max: 0.9, step: 0.1 }
            ].map(cfg => <DebugNumberInput key={cfg.key} label={cfg.label} value={gameState[cfg.key as keyof GameState] as number}
              onChange={(val) => setGameState(prev => ({ ...prev, [cfg.key]: val }))} min={cfg.min} max={cfg.max} step={cfg.step} />)}
          </DebugSection>

          <DebugSection title="Sprites" color="#ff6600">
            <DebugCheckbox 
              label="Enable Sprites" 
              checked={gameState.spriteStateSheet.spriteEnabled} 
              onChange={(v) => setGameState(p => ({ ...p, spriteStateSheet: { ...p.spriteStateSheet, spriteEnabled: v } }))} 
            />
            <DebugSelect 
              label="Direction" 
              value={gameState.spriteStateSheet.spriteDirection} 
              onChange={(v) => setGameState(p => ({ ...p, spriteStateSheet: { ...p.spriteStateSheet, spriteDirection: v as any } }))}
              options={[
                { value: 'down', label: 'Down' }, 
                { value: 'left', label: 'Left' }, 
                { value: 'up', label: 'Up' }, 
                { value: 'right', label: 'Right' }
              ]} 
            />
            <DebugSelect 
              label="Animation" 
              value={gameState.spriteStateSheet.spriteAnimationState} 
              onChange={(v) => setGameState(p => ({ ...p, spriteStateSheet: { ...p.spriteStateSheet, spriteAnimationState: v as any } }))}
              options={[
                { value: 'idle', label: 'Idle' },
                { value: 'frozen', label: 'Frozen' },
                { value: 'walking', label: 'Walking' },
                { value: 'attacking', label: 'Attacking' },
                { value: 'takingDamage', label: 'Taking Damage' },
                { value: 'collapsing', label: 'Collapsing' },
                { value: 'knockedOut', label: 'Knocked Out' },
                { value: 'critical', label: 'Critical' },
                { value: 'celebrating', label: 'Celebrating' },
                { value: 'stunLocked', label: 'Stun Locked' }
              ]} 
            />
            <DebugSelect 
              label="Effect" 
              value={gameState.spriteStateSheet.spriteAnimationEffect} 
              onChange={(v) => setGameState(p => ({ ...p, spriteStateSheet: { ...p.spriteStateSheet, spriteAnimationEffect: v as any } }))}
              options={[
                { value: 'neutral', label: 'Neutral' },
                { value: 'healing', label: 'Healing' },
                { value: 'takingDamage', label: 'Taking Damage' },
                { value: 'shrink', label: 'Shrink' },
                { value: 'matchClear', label: 'Match Clear' }
              ]} 
            />
          </DebugSection>

          <DebugSection title="Match Settings" color="#ff6600">
            <DebugNumberInput label="Min Match" value={gameState.minMatchCount} onChange={(v) => setGameState(p => ({ ...p, minMatchCount: v }))} min={2} max={10} />
            <DebugCheckbox label="Enable Logic" checked={gameState.enableMatchLogic} onChange={(v) => setGameState(p => ({ ...p, enableMatchLogic: v }))} />
            <DebugSelect label="Effect" value={gameState.matchEffect} onChange={(v) => setGameState(p => ({ ...p, matchEffect: v as any }))}
              options={[{ value: 'clear', label: 'Clear' }, { value: 'merge', label: 'Merge' }]} />
          </DebugSection>

          <DebugSection title="Merge Priorities" color="#ff6600">
            <DebugSelect 
              label="Y Priority" 
              value={gameState.mergeYPriority} 
              onChange={(v) => setGameState(p => ({ ...p, mergeYPriority: v as 'low' | 'high' }))}
              options={[
                { value: 'low', label: 'Low (Bottom)' },
                { value: 'high', label: 'High (Top)' }
              ]} 
            />
            <DebugSelect 
              label="X Priority" 
              value={gameState.mergeXPriority} 
              onChange={(v) => setGameState(p => ({ ...p, mergeXPriority: v as 'left' | 'right' }))}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' }
              ]} 
            />
            <DebugSelect 
              label="XY Priority" 
              value={gameState.mergeXYPriority} 
              onChange={(v) => setGameState(p => ({ ...p, mergeXYPriority: v as 'x' | 'y' }))}
              options={[
                { value: 'x', label: 'X First' },
                { value: 'y', label: 'Y First' }
              ]} 
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#888' }}>
              Current: {gameState.mergeXYPriority === 'x' ? 
                `${gameState.mergeXPriority} then ${gameState.mergeYPriority}` :
                `${gameState.mergeYPriority} then ${gameState.mergeXPriority}`}
            </p>
          </DebugSection>

          <DebugSection title="Shape Height" color="#4CAF50">
            <DebugNumberInput label="Height" value={gameState.shapeHeight} onChange={updateShapeHeight} min={1} max={gameState.gridCols - 1} disabled={isDropping} />
          </DebugSection>

          <DebugSection title="Grid Size" color="#2196F3">
            {[
              { label: 'Columns', val: gameState.gridCols, fn: (v: number) => updateGridSize(v, gameState.gridRows), min: 3, max: 12 },
              { label: 'Rows', val: gameState.gridRows, fn: (v: number) => updateGridSize(gameState.gridCols, v), min: 3, max: 12 }
            ].map((cfg, i) => <DebugNumberInput key={i} label={cfg.label} value={cfg.val} onChange={cfg.fn} min={cfg.min} max={cfg.max} disabled={isDropping} />)}
          </DebugSection>

          <DebugSection title="Swap Limits" color="#9C27B0">
            {[
              { label: 'Radius', key: 'swapRadius', min: 1, max: 5 },
              { label: 'Max Moves', key: 'maxMovements', min: 1, max: 50 },
              { label: 'Max Swaps', key: 'maxSwaps', min: 1, max: 20 }
            ].map(cfg => <DebugNumberInput key={cfg.key} label={cfg.label} value={gameState[cfg.key as keyof GameState] as number}
              onChange={(val) => setGameState(prev => ({ ...prev, [cfg.key]: val }))} min={cfg.min} max={cfg.max} />)}
          </DebugSection>

<DebugSection title="Combat Settings" color="#F44336">
  {[
    { label: 'Timer (s)', key: 'combatTimerMax', min: 1, max: 60 },
    { label: 'Casualty %', key: 'casualtyPercentage', min: 1, max: 100 }
  ].map(cfg => <DebugNumberInput key={cfg.key} label={cfg.label} value={gameState[cfg.key as keyof GameState] as number}
    onChange={(val) => setGameState(prev => ({ ...prev, [cfg.key]: val }))} min={cfg.min} max={cfg.max} />)}
</DebugSection>

          <DebugSection title="Camera" color="#00ff00">
            <DebugNumberInput label="Zoom" value={zoomMultiplier} onChange={setZoomMultiplier} min={0.5} max={5} step={0.1} />
            <DebugNumberInput label="V-Pan" value={verticalPan} onChange={setVerticalPan} min={-50} max={50} step={1} />
          </DebugSection>

          <DebugSection title="Active Pieces" color="#ff00ff">
            {Object.values(unitTypes).map((unit, idx) => (
              <div key={unit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <input
                  type="checkbox"
                  checked={gameState.activePieces.includes(unit.id)}
                  onChange={() => toggleActivePiece(unit.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ width: '20px', height: '20px', background: unit.color, border: '1px solid #fff' }} />
                <span style={{ fontSize: '12px' }}>{String(idx + 1).padStart(2, '0')}. {unit.name}</span>
              </div>
            ))}
          </DebugSection>

          <button
            onClick={() => setGameState(prev => ({ ...prev, stagingPieces: generateShape(prev.shapeHeight) }))}
            disabled={isDropping || gameState.phase !== 'placement'}
            style={{
              marginTop: '15px',
              padding: '8px',
              background: (isDropping || gameState.phase !== 'placement') ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isDropping || gameState.phase !== 'placement') ? 'not-allowed' : 'pointer',
              width: '100%',
              fontSize: '12px'
            }}
          >
            Randomize Pieces
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '100px', right: '120px', color: 'white', fontFamily: 'monospace', fontSize: '24px', zIndex: 1000, textAlign: 'right' }}>
        <div>Score: {gameState.gameStateTracker.cumulativeScore}</div>
        <div style={{ fontSize: '16px', color: '#ffaa00', marginTop: '5px' }}>Matches: {gameState.matchCount}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: 'white',
        fontSize: '15px', zIndex: 1000, ...STYLES.panel, border: '2px solid #666'
      }}>
        <strong>Controls:</strong> {gameState.phase === 'placement' ? 'Arrows: Move/Anchor | Z/X: Rotate | Space: Drop' :
          gameState.phase === 'formation' ? 'Watch formation organizing...' : 'Arrows: Move | Space: Select/Swap'}
      </div>

      <Canvas
        key={`${adjustedCameraDistance}-${verticalPan}`}
        camera={{ position: [0, 0, adjustedCameraDistance], fov: fov }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <GameStateContext.Provider value={gameState}>
          <GameBoard
            gameState={gameState}
            onAnimationComplete={handleAnimationComplete}
            onShrinkComplete={handleShrinkComplete}
            onGravityComplete={handleGravityComplete}
            onMatchClearComplete={handleMatchClearComplete}
            onFormationComplete={handleFormationComplete}
            onScorePopupComplete={handleScorePopupComplete}
            stagingRows={stagingRows}
            verticalPan={verticalPan}
            gravityPieces={gravityPieces}
            matchClearPieces={matchClearPieces}
          />
        </GameStateContext.Provider>
      </Canvas>
    </div>
  );
}

export default PuzzleMatchGame;