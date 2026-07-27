import React, { useState, useEffect } from 'react';
import { useEventController } from '../../Globals/EventController';
import './DebugModals.css'; // Inherit shared sub-modal styles

const CursorPositionUI: React.FC = () => {
  const { stateValues } = useEventController();

  const initialCursorPosition = Array.isArray(stateValues.trackCursorPosition)
    ? stateValues.trackCursorPosition
    : [0, 0, 0];

  const [x, setX] = useState<string>(initialCursorPosition[0].toFixed(2));
  const [y, setY] = useState<string>(initialCursorPosition[1].toFixed(2));
  const [z, setZ] = useState<string>(initialCursorPosition[2].toFixed(2));

  useEffect(() => {
    if (Array.isArray(stateValues.trackCursorPosition)) {
      setX((prev) => prev); // Keeps user's input intact
      setY((prev) => prev);
      setZ((prev) => prev);
    }
  }, [stateValues.trackCursorPosition]);

  const handleUpdatePosition = () => {
    console.log(`Updating position to: [${x}, ${y}, ${z}]`);
  };

  return (
    <div className="sub-modal-body">
      <h3 className="sub-modal-title">Cursor Position</h3>
      <div className="cursor-position-grid">
        {/* X Row */}
        <span className="cursor-position-label">X</span>
        <span className="cursor-position-value">
          {parseFloat(initialCursorPosition[0].toFixed(2))}
        </span>
        <input
          className="cursor-position-input"
          type="number"
          step="0.01"
          value={x}
          onChange={(e) => setX(e.target.value)}
        />

        {/* Y Row */}
        <span className="cursor-position-label">Y</span>
        <span className="cursor-position-value">
          {parseFloat(initialCursorPosition[1].toFixed(2))}
        </span>
        <input
          className="cursor-position-input"
          type="number"
          step="0.01"
          value={y}
          onChange={(e) => setY(e.target.value)}
        />

        {/* Z Row */}
        <span className="cursor-position-label">Z</span>
        <span className="cursor-position-value">
          {parseFloat(initialCursorPosition[2].toFixed(2))}
        </span>
        <input
          className="cursor-position-input"
          type="number"
          step="0.01"
          value={z}
          onChange={(e) => setZ(e.target.value)}
        />
      </div>
      <button className="debug-modal-button disabled" disabled>
        Update Position
      </button>
    </div>
  );
};

export default CursorPositionUI;
