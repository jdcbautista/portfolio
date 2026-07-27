import React, { useState, useEffect } from 'react';
import ModalsController from './ModalsManager/ModalsManager';
import { useEventController } from '../../../../R3FModule/Globals/EventController';
// import './ui.css'; // Import the consolidated stylesheet
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../../../R3FModule/UI/ui.css'
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import ZoomInMapOutlinedIcon from '@mui/icons-material/ZoomInMapOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import R3FCanvasIndex from '../CanvasRenderer/R3FCanvasIndex';

// import { Videocam } from '@mui/icons-material';
import { VideocamOutlined } from '@mui/icons-material';
// const { globalCanvasState, updateGlobalCanvasState } = useEventController();
// import { ChevronDown } from 'lucide-react';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
interface Props {
  enabled: boolean;
}

function EscIcon() {
  return (
    <div style={{
      // display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid #ccc',
      borderRadius: '2px',
      padding: '0.25rem 0.5rem',
      fontSize: '0.5rem',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      backgroundColor: '#33333366',
      transform: 'scale(1.5)',
      // opacity:'66%'
    }}>
      esc
    </div>
  );
}


function GameUIController(props: Props) {
// const GameUIController: React.FC = () => {
    const { enabled } = props;
    const { globalCanvasState, updateGlobalCanvasState, updateStateValues, stateValues } = useEventController();
    const [loading, setLoading] = useState(false); // Track loading state
    // const [buttonsDisabled, setButtonsDisabled] = useState(false); // Disable buttons after pointer unlock
    const [showSpinner, setShowSpinner] = useState(false); // Show spinner for 2s after pointer unlock
    // const [isScrolling, setIsScrolling] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    // const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-out'); // Start hidden

    useEffect(() => {
      if (globalCanvasState.cameraMode === 'manual') {
        setAnimationClass('animate-out'); // Trigger slide out
      } else {
        setAnimationClass('animate-in'); // Trigger slide in
      }
    }, [globalCanvasState.cameraMode]);
  
    const handleAutoScroll = () => {
      const splashComponent = document.querySelector('.splash-container') as HTMLElement | null;
      const navbar = document.querySelector('.navbar') as HTMLElement | null;
      const chevron = document.querySelector('.splashChevronButton') as HTMLElement | null;
  
      if (!splashComponent || !navbar || !chevron) {
        console.error('Required elements not found');
        return;
      }
  
      const splashBottom =
        splashComponent.getBoundingClientRect().bottom + window.scrollY;
  
      const targetScroll = splashBottom - navbar.offsetHeight;
  
      if (chevron.classList.contains('scrolling')) {
        chevron.classList.remove('scrolling');
        return;
      }
  
      chevron.classList.add('scrolling');
  
      const scrollInterval = setInterval(() => {
        const currentScroll = window.scrollY;
  
        if (
          currentScroll >= targetScroll ||
          currentScroll + window.innerHeight >= document.body.scrollHeight
        ) {
          clearInterval(scrollInterval);
          chevron.classList.remove('scrolling');
        } else {
          window.scrollBy(0, 8);
        }
      }, 10);
    };
    const enableFreeRoam = (e) => {
      updateGlobalCanvasState('manualMode', 'FreeRoam')
      handleToggle(e)
    }
    
    const enablePlayerCam = (e) => {
      updateGlobalCanvasState('manualMode', 'Character')
      handleToggle(e)
    }

    // const handleToggle = (e) => {
    //   if (loading) return; // Prevent interaction during loading
  
    //   setLoading(true); // Enter loading state
    //   toggleCameraMode(e); // Trigger the toggle logic
  
    //   setTimeout(() => {
    //     setLoading(false); // Exit loading state after 2 seconds
    //   }, 2000);
    // };
    // const handleAutoScroll = () => {
    //   const splashComponent = document.querySelector('.splash-container') as HTMLElement | null;
    //   const navbar = document.querySelector('.navbar') as HTMLElement | null;
    //   const chevron = document.querySelector('.splashChevronButton') as HTMLElement | null;
  
    //   if (!splashComponent || !navbar || !chevron) {
    //     console.error('Required elements not found');
    //     return;
    //   }
  
    //   const splashBottom =
    //     splashComponent.getBoundingClientRect().bottom + window.scrollY;
  
    //   const targetScroll = splashBottom - navbar.offsetHeight;
  
    //   if (chevron.classList.contains('scrolling')) {
    //     chevron.classList.remove('scrolling');
    //     return;
    //   }
  
    //   chevron.classList.add('scrolling');
  
    //   const scrollInterval = setInterval(() => {
    //     const currentScroll = window.scrollY;
  
    //     if (
    //       currentScroll >= targetScroll ||
    //       currentScroll + window.innerHeight >= document.body.scrollHeight
    //     ) {
    //       clearInterval(scrollInterval);
    //       chevron.classList.remove('scrolling');
    //     } else {
    //       window.scrollBy(0, 8);
    //     }
    //   }, 10);
    // };

    const handleToggle = (e) => {
      e.preventDefault();
      (e.target as HTMLButtonElement).blur();
  
      if (loading) return;
  
      setLoading(true);
      toggleCameraMode(e);
  
      setTimeout(() => {
        setLoading(false);
      }, 1600);
    };
  
    const toggleCameraMode = (e) => {
      e.preventDefault();
      (e.target as HTMLButtonElement).blur();
  
      const newMode = globalCanvasState.cameraMode === 'manual' ? 'track' : 'manual';
      updateGlobalCanvasState('cameraMode', newMode);
    };
  

    const toggleProjection = () => {
      const newProjectionType =
        stateValues.projectionType === 'perspective' ? 'orthographic' : 'perspective';
      updateStateValues('projectionType', newProjectionType);
    };
  
  // Show spinner when pointer lock is released
  useEffect(() => {
    if (globalCanvasState.cameraMode === 'track') {
      setShowSpinner(true);
      const timeout = setTimeout(() => {
        setShowSpinner(false);
      }, 1600); // 2-second delay

      return () => clearTimeout(timeout); // Cleanup timeout on unmount or re-render
    }
  }, [globalCanvasState.cameraMode]);

  const handleDevPlaygroundToggle = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    
    const canvasList = R3FCanvasIndex(); // Dynamically retrieve the canvas list
    const listLength = canvasList.length;
  
    if (listLength === 0) return; // Handle edge case where list is empty
  
    const currentIndex = canvasList.findIndex(canvas => canvas.id === globalCanvasState.currentCanvas);
  
    let nextIndex = currentIndex;
  
    if (value === 'left') {
      nextIndex = currentIndex === 0 ? listLength - 1 : currentIndex - 1;
    } else if (value === 'right') {
      nextIndex = (currentIndex + 1) % listLength;
    }
  
    const nextCanvas = canvasList[nextIndex];
    if (nextCanvas) {
      updateGlobalCanvasState('currentCanvas', nextCanvas.id);
    }
  };

  return (
    <div className="canvasContainer" style={styles.container}>
      <div className="canvasSubContainer" style={styles.header}>

      {loading ? (
          <button className="canvasButton" disabled>
            <div className="spinner" /> {/* Render a spinning loader */}
          </button>
        ) : globalCanvasState.cameraMode !== 'manual' ? (
          <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="canvasButtonBackground">
              
                {showSpinner ? (
                  <div className="spinner" /> /* Render spinner on the button */
                ) : (
                  <button
                onClick={(e) => enablePlayerCam(e)}
                className="canvasButton"
                id="toggleCursorLock"
              >
                  <VisibilityOutlinedIcon style={{ fontSize: '2rem' }} />
              </button>
                )}
            </div>

                {showSpinner ? (
                  <div /> /* Render spinner on the button */
                ) : (
                <div className="canvasButtonBackground">
                  <button
                    onClick={(e) => enableFreeRoam(e)}
                    className="canvasButton"
                    id="toggleCursorLock"
                  >
                  <VideocamOutlined style={{ fontSize: '2rem' }} />
                </button>
              </div>
                )}
          </span>
        ) : (
          <button onClick={(e) => handleToggle(e)} className="canvasButton">
            <EscIcon /> {/* Render escape icon */}
          </button>
        )}

            <div className="canvasButtonBackground">
                <button
                onClick={toggleProjection} // Use the existing function
                className="canvasButton"
              >
                {stateValues.projectionType === 'perspective' ? (
                  <ZoomInMapOutlinedIcon style={{ fontSize: '2rem' }} />
                ) : (
                  <ViewInArOutlinedIcon style={{ fontSize: '2rem' }} />
                )}
          </button>
          </div>
      </div>
      {/* <div className="canvasButtonBackground">
              <button
                onClick={toggleProjection} // Use the existing function
                className="canvasButton"
              >
                {stateValues.projectionType === 'perspective' ? (
                  <ViewInArOutlinedIcon style={{ fontSize: '2rem' }} />
                ) : (
                  <ZoomInMapOutlinedIcon style={{ fontSize: '2rem' }} />
                )}
          </button>
      </div> */}
      <div className="canvasSubContainer" style={styles.body}>

      <ModalsController />
      
      </div>

      <div className={`canvasSubContainerFooter ${animationClass}`}>
      {/* <span > */}<div>
      <div
          className="gameUI-modal-devplayground-nav left"
          onClick ={(e) => handleDevPlaygroundToggle(e,"left")}
          > 
          <ChevronLeft fontSize="large" />
          {/* <TroubleshootIcon fontSize="large" /> */}
        </div> 
        <div
          className="gameUI-modal-devplayground-nav right"
          onClick ={(e) => handleDevPlaygroundToggle(e,"right")}
          title="Expand Modals Menu"
          > 
          <ChevronRight fontSize="large" />
          {/* <SearchOffIcon fontSize="large" /> */}
        </div> 
  
          {/* <BugReportIcon fontSize="large" /> */}      
      </div>
       <div className='splashChevronContainer'>
          <button
            className={`splashChevronButton ${isScrolling ? 'scrolling' : ''}`}
            onClick={handleAutoScroll}
            title="Scroll down"
          >
            <ChevronDown className="splashChevron" />
          </button>
        </div>
      {/* <ModalsController /> */}
        {/* </span> */}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column', // Stack header, body, footer vertically
    gap: '0', // Remove unnecessary gaps between sections
    height: 'calc(100% - 40px)', // Ensures it fits within parent wrapper constraints
    width: 'calc(100% - 40px)', // Same margin adjustment
  },
  header: {
    height: '50px', // Fixed height for header
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    // background: '#222',
    color: '#fff',
    padding: '0 10px',
  },
  body: {
    flex: 1, // Expands to fill remaining vertical space
    // background: '#333',
    color: '#fff',
    overflow: 'auto',
  },
  footer: {
    height: '50px', // Fixed height for footer
    // background: '#444', // Visible background for debugging
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '120px',
    justifyContent: 'center', // Center footer content
  },
};

export default GameUIController;
