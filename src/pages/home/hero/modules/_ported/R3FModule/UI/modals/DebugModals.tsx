import React, { useState } from 'react';
import Draggable from 'react-draggable';
import MinimizeIcon from '@mui/icons-material/Minimize';
import BugReportIcon from '@mui/icons-material/BugReport';
import Modal from '../Modal';
import './DebugModals.css';

const DebugModals: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeModals, setActiveModals] = useState<
    { type: string; position: { x: number; y: number } }[]
  >([]);

  const openModal = (modalType: string) => {
    // Check if the modal is already open
    if (!activeModals.some((modal) => modal.type === modalType)) {
      const newModal = {
        type: modalType,
        position: {
          x: 100 + activeModals.length * 30, // Stagger positions
          y: 0 + activeModals.length * 30, // Avoid overlap
        },
      };
      setActiveModals((prev) => [...prev, newModal]);
    }
  };

  const closeModal = (modalType: string) => {
    setActiveModals((prev) => prev.filter((modal) => modal.type !== modalType));
  };

  return (
    <>
      {isCollapsed ? (
        <div
          className="debug-modal-collapsed"
          onClick={() => setIsCollapsed(false)}
          title="Expand Debug Menu"
        >
          <BugReportIcon fontSize="large" />
        </div>
      ) : (
        <Draggable>
          <div className="debug-modal-container">
            <div className="debug-modal-header">
              <h3 className="debug-modal-title">Debug Menu</h3>
              <button
                className="debug-modal-minimize"
                onClick={() => setIsCollapsed(true)}
                title="Collapse Debug Menu"
              >
                <MinimizeIcon fontSize="small" />
              </button>
            </div>
            <div className="debug-modal-body">
              <button
                className="debug-modal-button"
                onClick={() => openModal('CursorPosition')}
              >
                Open Cursor Position
              </button>
              <button
                className="debug-modal-button"
                onClick={() => openModal('TrackController')}
              >
                Open Track Controller
              </button>
            </div>
          </div>
        </Draggable>
      )}

      {/* Render Active Modals */}
      {activeModals.map((modal, index) => (
        <Modal
          key={index}
          modalType={modal.type}
          initialPosition={modal.position}
          closeModal={() => closeModal(modal.type)}
        />
      ))}
    </>
  );
};

export default DebugModals;
