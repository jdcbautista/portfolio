import React, { useState } from 'react';

const DebugUIStageEditor: React.FC = () => {
  const [x, setX] = useState<string>('2');
  const [z, setZ] = useState<string>('2');
  const [grid, setGrid] = useState<any[]>([]);
  const [selectedCell, setSelectedCell] = useState<any | null>({
    coord: [0, 0],
    props: { type: 'grass', heightPos: 0, heightScale: 1, initEntity: 'none' },
  });

  const MAX_GRID_SIZE = 16;

  const generateGrid = () => {
    const width = parseInt(x, 10);
    const depth = parseInt(z, 10);

    if (
      isNaN(width) ||
      isNaN(depth) ||
      width < 1 ||
      depth < 1 ||
      width > MAX_GRID_SIZE ||
      depth > MAX_GRID_SIZE
    ) {
      alert(`Please enter valid numbers for Grid Width X and Grid Depth Z (1-${MAX_GRID_SIZE}).`);
      return;
    }

    const newGrid = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < depth; j++) {
        newGrid.push({
          coord: [i, j],
          props: {
            type: 'grass',
            heightPos: 0,
            heightScale: 1,
            initEntity: 'none',
          },
        });
      }
    }
    setGrid(newGrid);
    setSelectedCell(null);
  };

  const handleEditCell = (cell: any) => {
    setSelectedCell(cell);
  };

  const handleSaveProps = () => {
    if (!selectedCell) return;

    setGrid((prevGrid) =>
      prevGrid.map((cell) =>
        cell.coord[0] === selectedCell.coord[0] && cell.coord[1] === selectedCell.coord[1]
          ? { ...cell, props: { ...selectedCell.props } }
          : cell
      )
    );
  };

  const exportGrid = () => {
    if (grid.length === 0) {
      alert("Grid is empty. Nothing to export!");
      return;
    }
  
    try {
      const json = JSON.stringify(grid, null, 2); // Format JSON
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'grid.json';
      link.click();
      URL.revokeObjectURL(link.href); // Clean up
    } catch (error) {
      console.error("Failed to export grid:", error);
    }
  };
  

  return (
    <div
      style={{
        maxWidth: '40vw',
        minWidth: '40vw',
        // width: '1200px', // Explicitly increase width for better layout
        maxHeight: '90vh',
        margin: '0 auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ textAlign: 'center' }}>Stage Editor Debugger</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label>
            Grid Width X:
            <input
              type="number"
              step="1"
              min="1"
              max={MAX_GRID_SIZE}
              value={x}
              onChange={(e) => setX(e.target.value)}
            />
          </label>
          <label>
            Grid Depth Z:
            <input
              type="number"
              step="1"
              min="1"
              max={MAX_GRID_SIZE}
              value={z}
              onChange={(e) => setZ(e.target.value)}
            />
          </label>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
          <button onClick={generateGrid}>Generate Grid</button>
          <button onClick={exportGrid}>Export Grid JSON</button>
          <button>
            <label>
              Import Grid JSON
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => console.log(e)}
              />
            </label>
          </button>
        </div>
      </div>

      {grid.length > 0 && (
        <>
          <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>Grid Cells</h4>
          <div style={{ display: 'flex', gap: '16px', height: '64vh', paddingBottom: 12 }}>
            {/* JSON Box */}
            <textarea
              style={{
                flex: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                height: '100%',
                resize: 'none',
                border: '0px solid #ddd',
                padding: '8px',
              }}
              readOnly
              value={JSON.stringify(grid, null, 2)}
            />

            {/* Right Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Prop Editor */}
              <div
                style={{
                  flexShrink: 0,
                  border: '0px solid #ddd',
                  padding: '8px',
                  height: '40%', // Reserve space for editing
                  overflow: 'auto',
                }}
              >
                <h4>Editing Props for Cell: [{selectedCell?.coord.join(', ')}]</h4>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '40%' }}>Type:</label>
                  <input
                    type="text"
                    value={selectedCell?.props.type || ''}
                    onChange={(e) =>
                      setSelectedCell((prev) =>
                        prev ? { ...prev, props: { ...prev.props, type: e.target.value } } : prev
                      )
                    }
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '40%' }}>Height Pos:</label>
                  <input
                    type="number"
                    value={selectedCell?.props.heightPos || 0}
                    onChange={(e) =>
                      setSelectedCell((prev) =>
                        prev
                          ? {
                              ...prev,
                              props: { ...prev.props, heightPos: parseFloat(e.target.value) },
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '40%' }}>Height Scale:</label>
                  <input
                    type="number"
                    value={selectedCell?.props.heightScale || 0}
                    onChange={(e) =>
                      setSelectedCell((prev) =>
                        prev
                          ? {
                              ...prev,
                              props: { ...prev.props, heightScale: parseFloat(e.target.value) },
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '40%' }}>Init Entity:</label>
                  <input
                    type="text"
                    value={selectedCell?.props.initEntity || 'none'}
                    onChange={(e) =>
                      setSelectedCell((prev) =>
                        prev ? { ...prev, props: { ...prev.props, initEntity: e.target.value } } : prev
                      )
                    }
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={handleSaveProps}>Save</button>
                </div>
              </div>

              {/* Grid Cell List */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gap: '4px', padding: '12px' }}>
                  {grid.map((cell, index) => (
                    <button
                      key={index}
                      style={{
                        padding: '8px',
                        textAlign: 'center',
                        border: '0px solid #ddd',
                        background: '#f9f9f9',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleEditCell(cell)}
                    >
                      Grid Cell [{cell.coord.join(', ')}]
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DebugUIStageEditor;
