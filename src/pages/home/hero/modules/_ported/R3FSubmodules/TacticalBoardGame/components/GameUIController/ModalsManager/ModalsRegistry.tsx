// ModalsManager/ModalRegistry.tsx: Dynamic Modal Loader
import './modals.css';

import React from 'react';
import Draggable from 'react-draggable';


const modalRegistry: { [key: string]: React.FC } = {
  
  DebugUIGameState: React.lazy(() => import('../../GameStateController/DebugUIGameStateController')),
  DebugUIGameEvents: React.lazy(() => import('../../GameStateController/managers/DebugUIGameEventManager')),
  DebugUISandboxController: React.lazy(() => import('../../SandboxController/DebugUISandboxController')),
  DebugUIStageEditor: React.lazy(() => import('../../SandboxController/StageEditor/DebugUIStageEditor')),
  DebugUIGridController: React.lazy(() => import('../../GridController/DebugUIGridController')),
  DebugUICursorManager: React.lazy(() => import('../../GridController/managers/DebugUICursorManager')),
  DebugUIInputManager: React.lazy(() => import('../../GridController/managers/DebugUIInputManager')),
  // Global
  DebugRootModuleState: React.lazy(() => import('../../RootModuleDebug/DebugRootModuleState')),
  DebugRootModuleEvents: React.lazy(() => import('../../RootModuleDebug/DebugRootModuleEvents')),
  DebugTrackController: React.lazy(() => import('../../../../../R3FModule/UI/modals/TrackControllerUI')),
};

// const onDrag = (e: any, data: { x: number; y: number }) => {
//   setPosition({ x: data.x, y: data.y });
// };

interface ModalProps {
  modalType: string;
  closeModal: () => void;
  initialPosition?: { x: number; y: number };
}

const ModalRegistry: React.FC<ModalProps> = ({ modalType, closeModal, initialPosition = { x: 100, y: 100 } }) => {
  const ModalContent = modalRegistry[modalType];

  if (!ModalContent) return null;

  return (
    <div className="draggable-wrapper">
    <Draggable bounds={{ top: 0, left: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
    // position={position}
    defaultPosition={initialPosition}
    >
      <div className="sub-modal-container">
        <button className="sub-modal-close-button" onClick={closeModal} title="Close">
          ✕
        </button>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ModalContent />
        </React.Suspense>
      </div>
    </Draggable>
    </div>
  );
};

export default ModalRegistry;