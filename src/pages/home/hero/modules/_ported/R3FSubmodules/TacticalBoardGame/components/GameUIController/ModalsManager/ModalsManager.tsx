// ModalsController.tsx: Manages Modals

import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import MinimizeIcon from '@mui/icons-material/Minimize';
import BugReportIcon from '@mui/icons-material/BugReport';
import ModalsRegistry from './ModalsRegistry';
import './modals.css'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useGlobalState } from '../../../../../GlobalContextProvider/GlobalContextProvider';

const ModalsController: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeModals, setActiveModals] = useState<
    { type: string; position: { x: number; y: number } }[]
  >([]);

  const { updateModuleState, globalState } = useGlobalState();

  useEffect(()=> {
    toggleModal('DebugRootModule')
    // if (!activeModals.some((modal) => modal.type === 'DebugRootModule')){
    // }
  },[])

  const toggleInspect = () => {
    const newState = !globalState.debugOn
    updateModuleState("debugOn", newState)
  }

  const toggleModal = (modalType: string) => {
    setActiveModals(prev => {
      // Check if modal is already open
      const isOpen = prev.some(modal => modal.type === modalType);
      
      if (isOpen) {
        // Simply remove the modal, leaving all others untouched
        return prev.filter(modal => modal.type !== modalType);
      }
      
      // Add new modal with its own initial position
      const newModal = {
        type: modalType,
        position: {
          // Fixed offset for new modals, or could use a small random offset
          x: (window.innerWidth / 50) + prev.length * 30,
          y: (window.innerHeight / 50) + prev.length * 30
                    //   x: (window.innerWidth / 50) + activeModals.length * 30,  // Center horizontally
          //   y: (window.innerHeight / 50) + activeModals.length * 30  // Center vertically
        }
      };
      
      return [...prev, newModal];
    });
  };

  const closeModal = (modalType: string) => {
    setActiveModals((prev) => prev.filter((modal) => modal.type !== modalType));
  };

  return (
    <>
      { globalState.debugOn ?
        <div
          className="gameUI-modal-inspect inspect-toggle-off"
          onClick ={() => toggleInspect()}
          > 
          {/* <SearchOffIcon fontSize="large" /> */}
          <TroubleshootIcon fontSize="large" />
        </div> :
        <div
          className="gameUI-modal-inspect inspect-toggle-on"
          onClick ={() => toggleInspect()}
          > 
          {/* <TroubleshootIcon fontSize="large" /> */}
          <SearchOffIcon fontSize="large" />
        </div> 
      }
      {isCollapsed ? (
        <div
          className="gameUI-modal-collapsed"
          onClick={() => setIsCollapsed(false)}
          title="Expand Modals Menu"
        >
          <BugReportIcon fontSize="large" />
        </div>
      ) : (
        <Draggable>
          <div className="gameUI-modal-container">
            <div className="gameUI-modal-header">
              <h3 className="gameUI-modal-title">Modals Menu</h3>
              <button
                className="gameUI-modal-minimize"
                onClick={() => setIsCollapsed(true)}
                title="Collapse Modals Menu"
              >
                <MinimizeIcon fontSize="small" />
              </button>
            </div>
            <div className="gameUI-modal-body">
            <span style={{textAlign: 'center' }}>Globals</span>
               <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugRootModuleState')}
              >
                Open Root Module Controller State Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugRootModuleEvents')}
              >
                Open Root Module Controller Event Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugTrackController')}
              >
                Open TrackController Debugger
              </button>
              <span style={{textAlign: 'center' }}>Submodule</span>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUIGameState')}
              >
                Open Game State Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUIGameEvents')}
              >
                Open Event Manager Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUISandboxController')}
              >
                Open Sandbox Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUIStageEditor')}
              >
                Open Stage Editor Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUIGridController')}
              >
                Open Grid Controller Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUICursorManager')}
              >
                Open Cursor Manager Debugger
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => toggleModal('DebugUIInputManager')}
              >
                Open Input Manager Debugger
              </button>
            </div>
          </div>
        </Draggable>
      )}

      {activeModals.map((modal, index) => (
        <ModalsRegistry
          key={index}
          modalType={modal.type}
          // initialPosition={modal.position}
          
          // initialPosition={modal.position}
          initialPosition={{
            x: 50,
            y: 50
            // x: (window.innerWidth / 50) + activeModals.length * 30,  // Center horizontally
            // y: (window.innerHeight / 50) + activeModals.length * 30  // Center vertically
                      // x: 100 + activeModals.length * 30,
          // y: 0 + activeModals.length * 30,
          }}
          closeModal={() => closeModal(modal.type)}
        />
      ))}
    </>
  );
};

export default ModalsController;