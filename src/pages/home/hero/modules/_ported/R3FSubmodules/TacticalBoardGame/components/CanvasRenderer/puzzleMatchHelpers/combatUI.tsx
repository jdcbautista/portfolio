// CombatUI.tsx - Combat configuration debug panel

import React, { useState, useEffect } from 'react';
import { BESTIARY } from './puzzleMatchHelpers/combatTypes';
import type { CombatEncounter, EnemySpawn } from './puzzleMatchHelpers/combatTypes';

const STYLES = {
  panel: { background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px' },
  debugInput: { width: '50px', padding: '4px', fontSize: '12px', color: '#000', background: '#fff' },
  debugLabel: { fontSize: '12px', width: '90px' },
  inputRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
};

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  waveConfig: EnemySpawn[];
  onUpdateWave: (config: EnemySpawn[]) => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  waveConfig,
  onUpdateWave
}) => {
  const [localConfig, setLocalConfig] = useState<EnemySpawn[]>(waveConfig);

  useEffect(() => {
    setLocalConfig(waveConfig);
  }, [waveConfig]);

  if (!isOpen) return null;

  const handleCountChange = (enemyId: string, count: number) => {
    const existing = localConfig.find(e => e.enemyTypeId === enemyId);
    if (existing) {
      setLocalConfig(localConfig.map(e =>
        e.enemyTypeId === enemyId ? { ...e, count } : e
      ));
    } else if (count > 0) {
      setLocalConfig([...localConfig, { enemyTypeId: enemyId, count }]);
    }
  };

  const handleSave = () => {
    onUpdateWave(localConfig.filter(e => e.count > 0));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1a2a', padding: '30px', borderRadius: '12px',
        border: '2px solid #ff6600', maxWidth: '600px', maxHeight: '80vh',
        overflow: 'auto', color: 'white', fontFamily: 'monospace'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#ff6600' }}>Configure Wave Enemies</h2>

        {Object.values(BESTIARY).map(enemy => {
          const config = localConfig.find(e => e.enemyTypeId === enemy.id);
          const count = config?.count || 0;

          return (
            <div key={enemy.id} style={{
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: '1px solid #444'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: enemy.color,
                  border: '2px solid #fff'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{enemy.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>Tier {enemy.tier}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    HP: {enemy.baseStats.hitpoints} | ATK: {enemy.baseStats.strength} |
                    Range: {enemy.baseStats.attackRange}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={count}
                  onChange={(e) => handleCountChange(enemy.id, parseInt(e.target.value) || 0)}
                  style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                />
                <button
                  style={{
                    padding: '4px 8px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Stats
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSave} style={{
            flex: 1,
            padding: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Save
          </button>
          <button onClick={onClose} style={{
            flex: 1,
            padding: '10px',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface CombatDebugPanelProps {
  encounter: CombatEncounter;
  onUpdateEncounter: (encounter: CombatEncounter) => void;
}

export const CombatDebugPanel: React.FC<CombatDebugPanelProps> = ({
  encounter,
  onUpdateEncounter
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWaveIndex, setEditingWaveIndex] = useState(0);

  const handleWaveCountChange = (count: number) => {
    const waves = [];
    for (let i = 0; i < count; i++) {
      waves.push({
        waveNumber: i,
        enemies: encounter.waves[i]?.enemies || []
      });
    }
    onUpdateEncounter({
      ...encounter,
      waves
    });
  };

  const handleWaveUpdate = (waveIndex: number, enemies: EnemySpawn[]) => {
    const newWaves = [...encounter.waves];
    newWaves[waveIndex] = {
      ...newWaves[waveIndex],
      enemies
    };
    onUpdateEncounter({
      ...encounter,
      waves: newWaves
    });
  };

  return (
    <div style={{ ...STYLES.panel, border: '2px solid #ff4444', marginTop: '15px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ff4444', fontSize: '16px' }}>
        Combat Configuration
      </h3>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Wave Count:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={encounter.waves.length}
          onChange={(e) => handleWaveCountChange(parseInt(e.target.value) || 1)}
          style={STYLES.debugInput}
        />
      </div>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Count Scale %:</label>
        <input
          type="number"
          min="0"
          max="200"
          value={encounter.difficultyScaling.countScalingPercent}
          onChange={(e) => onUpdateEncounter({
            ...encounter,
            difficultyScaling: {
              ...encounter.difficultyScaling,
              countScalingPercent: parseInt(e.target.value) || 0
            }
          })}
          style={STYLES.debugInput}
        />
      </div>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Level Scale %:</label>
        <input
          type="number"
          min="0"
          max="200"
          value={encounter.difficultyScaling.levelScalingPercent}
          onChange={(e) => onUpdateEncounter({
            ...encounter,
            difficultyScaling: {
              ...encounter.difficultyScaling,
              levelScalingPercent: parseInt(e.target.value) || 0
            }
          })}
          style={STYLES.debugInput}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#ffaa00', fontSize: '13px' }}>Waves</h4>
        {encounter.waves.map((wave, idx) => (
          <div key={idx} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => {
                setEditingWaveIndex(idx);
                setModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Wave {idx + 1} ({wave.enemies.reduce((sum, e) => sum + e.count, 0)} enemies)
            </button>
          </div>
        ))}
      </div>

      <BestiaryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        waveConfig={encounter.waves[editingWaveIndex]?.enemies || []}
        onUpdateWave={(enemies) => handleWaveUpdate(editingWaveIndex, enemies)}
      />
    </div>
  );
};

const STYLES = {
  panel: { background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px' },
  debugInput: { width: '50px', padding: '4px', fontSize: '12px', color: '#000', background: '#fff' },
  debugLabel: { fontSize: '12px', width: '90px' },
  inputRow: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
};

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  waveConfig: EnemySpawn[];
  onUpdateWave: (config: EnemySpawn[]) => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  isOpen,
  onClose,
  waveConfig,
  onUpdateWave
}) => {
  const [localConfig, setLocalConfig] = useState<EnemySpawn[]>(waveConfig);

  useEffect(() => {
    setLocalConfig(waveConfig);
  }, [waveConfig]);

  if (!isOpen) return null;

  const handleCountChange = (enemyId: string, count: number) => {
    const existing = localConfig.find(e => e.enemyTypeId === enemyId);
    if (existing) {
      setLocalConfig(localConfig.map(e =>
        e.enemyTypeId === enemyId ? { ...e, count } : e
      ));
    } else if (count > 0) {
      setLocalConfig([...localConfig, { enemyTypeId: enemyId, count }]);
    }
  };

  const handleSave = () => {
    onUpdateWave(localConfig.filter(e => e.count > 0));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1a2a', padding: '30px', borderRadius: '12px',
        border: '2px solid #ff6600', maxWidth: '600px', maxHeight: '80vh',
        overflow: 'auto', color: 'white', fontFamily: 'monospace'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#ff6600' }}>Configure Wave Enemies</h2>

        {Object.values(BESTIARY).map(enemy => {
          const config = localConfig.find(e => e.enemyTypeId === enemy.id);
          const count = config?.count || 0;

          return (
            <div key={enemy.id} style={{
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: '1px solid #444'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: enemy.color,
                  border: '2px solid #fff'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{enemy.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>Tier {enemy.tier}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>
                    HP: {enemy.baseStats.hitpoints} | ATK: {enemy.baseStats.strength} |
                    Range: {enemy.baseStats.attackRange}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={count}
                  onChange={(e) => handleCountChange(enemy.id, parseInt(e.target.value) || 0)}
                  style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                />
                <button
                  style={{
                    padding: '4px 8px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Stats
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSave} style={{
            flex: 1,
            padding: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Save
          </button>
          <button onClick={onClose} style={{
            flex: 1,
            padding: '10px',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface CombatDebugPanelProps {
  encounter: CombatEncounter;
  onUpdateEncounter: (encounter: CombatEncounter) => void;
}

export const CombatDebugPanel: React.FC<CombatDebugPanelProps> = ({
  encounter,
  onUpdateEncounter
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWaveIndex, setEditingWaveIndex] = useState(0);

  const handleWaveCountChange = (count: number) => {
    const waves = [];
    for (let i = 0; i < count; i++) {
      waves.push({
        waveNumber: i,
        enemies: encounter.waves[i]?.enemies || []
      });
    }
    onUpdateEncounter({
      ...encounter,
      waves
    });
  };

  const handleWaveUpdate = (waveIndex: number, enemies: EnemySpawn[]) => {
    const newWaves = [...encounter.waves];
    newWaves[waveIndex] = {
      ...newWaves[waveIndex],
      enemies
    };
    onUpdateEncounter({
      ...encounter,
      waves: newWaves
    });
  };

  return (
    <div style={{ ...STYLES.panel, border: '2px solid #ff4444', marginTop: '15px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ff4444', fontSize: '16px' }}>
        Combat Configuration
      </h3>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Wave Count:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={encounter.waves.length}
          onChange={(e) => handleWaveCountChange(parseInt(e.target.value) || 1)}
          style={STYLES.debugInput}
        />
      </div>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Count Scale %:</label>
        <input
          type="number"
          min="0"
          max="200"
          value={encounter.difficultyScaling.countScalingPercent}
          onChange={(e) => onUpdateEncounter({
            ...encounter,
            difficultyScaling: {
              ...encounter.difficultyScaling,
              countScalingPercent: parseInt(e.target.value) || 0
            }
          })}
          style={STYLES.debugInput}
        />
      </div>

      <div style={STYLES.inputRow}>
        <label style={{ ...STYLES.debugLabel, width: '110px' }}>Level Scale %:</label>
        <input
          type="number"
          min="0"
          max="200"
          value={encounter.difficultyScaling.levelScalingPercent}
          onChange={(e) => onUpdateEncounter({
            ...encounter,
            difficultyScaling: {
              ...encounter.difficultyScaling,
              levelScalingPercent: parseInt(e.target.value) || 0
            }
          })}
          style={STYLES.debugInput}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#ffaa00', fontSize: '13px' }}>Waves</h4>
        {encounter.waves.map((wave, idx) => (
          <div key={idx} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => {
                setEditingWaveIndex(idx);
                setModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Wave {idx + 1} ({wave.enemies.reduce((sum, e) => sum + e.count, 0)} enemies)
            </button>
          </div>
        ))}
      </div>

      <BestiaryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        waveConfig={encounter.waves[editingWaveIndex]?.enemies || []}
        onUpdateWave={(enemies) => handleWaveUpdate(editingWaveIndex, enemies)}
      />
    </div>
  );
};