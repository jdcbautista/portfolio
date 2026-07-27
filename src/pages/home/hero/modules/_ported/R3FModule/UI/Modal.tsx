import React from 'react';
import Draggable from 'react-draggable';
import './modals/DebugModals.css'; // Separate CSS for styling sub-modals

const modalRegistry: { [key: string]: React.FC } = {
  CursorPosition: React.lazy(() => import('./modals/CursorPositionUI')),
  TrackController: React.lazy(() => import('./modals/TrackControllerUI')),
};

interface ModalProps {
  modalType: string;
  closeModal: () => void;
  initialPosition?: { x: number; y: number }; // Optional initial position
}

const Modal: React.FC<ModalProps> = ({ modalType, closeModal, initialPosition = { x: 100, y: 100 } }) => {
  const ModalContent = modalRegistry[modalType];

  if (!ModalContent) return null;

  return (
    <Draggable defaultPosition={initialPosition}>
      <div className="sub-modal-container">
        <button className="sub-modal-close-button" onClick={closeModal} title="Close">
          ✕
        </button>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ModalContent />
        </React.Suspense>
      </div>
    </Draggable>
  );
};

export default Modal;