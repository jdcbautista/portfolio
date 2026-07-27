import React, { useEffect, useState, MouseEvent } from 'react';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AutoModeOutlinedIcon from '@mui/icons-material/AutoModeOutlined';
import ZoomInMapOutlinedIcon from '@mui/icons-material/ZoomInMapOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import Modal from './Modal';
import DebugModals from './modals/DebugModals';
import { useEventController } from '../Globals/EventController';
import { ChevronDown } from 'lucide-react';
import './ui.css'; // Import the consolidated stylesheet

interface Props {
  enabled: boolean;
}

function EscIcon() {
  return (
    <div
      style={{
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
      }}
    >
      esc
    </div>
  );
}

function UIController(props: Props) {
  const { enabled } = props;
  const { globalCanvasState, updateGlobalCanvasState, stateValues, updateStateValues } =
    useEventController();
  const [loading, setLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

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

  const toggleProjection = () => {
    const newProjectionType =
      stateValues.projectionType === 'perspective' ? 'orthographic' : 'perspective';
    updateStateValues('projectionType', newProjectionType);
  };

  const toggleCameraMode = () => {
    const newMode =
      globalCanvasState.cameraMode === 'manual' ? 'track' : 'manual';
    updateGlobalCanvasState('cameraMode', newMode);
  };

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (e.target as HTMLButtonElement).blur();
    if (loading) return;

    setLoading(true);

    setTimeout(() => {
      toggleCameraMode();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="canvasContainer" style={styles.container}>
      <div className="canvasSubContainer" style={styles.header}>
        {loading ? (
          <button className="canvasButton" disabled>
            <div className="spinner" />
          </button>
        ) : globalCanvasState.cameraMode !== 'manual' ? (
          <div className="canvasButtonBackground">
            <button
              onClick={handleToggle}
              className="canvasButton"
              id="toggleCursorLock"
            >
              <VisibilityOutlinedIcon style={{ fontSize: '2rem' }} />
            </button>
          </div>
        ) : (
          <button onClick={handleToggle} className="canvasButton">
            <EscIcon />
          </button>
        )}
      </div>

      <div className="canvasButtonBackground">
        <button onClick={toggleProjection} className="canvasButton">
          {stateValues.projectionType === 'perspective' ? (
            <ZoomInMapOutlinedIcon style={{ fontSize: '2rem' }} />
          ) : (
            <ViewInArOutlinedIcon style={{ fontSize: '2rem' }} />
          )}
        </button>
      </div>

      <div className="canvasSubContainer" style={styles.body}></div>

      <div className="canvasSubContainer" style={styles.footer}>
        {globalCanvasState.cameraMode !== "manual" && <div className="splashChevronContainer">
          <button
            className={`splashChevronButton ${isScrolling ? 'scrolling' : ''}`}
            onClick={handleAutoScroll}
            title="Scroll down"
          >
            <ChevronDown className="splashChevron" />
          </button>
        </div>}
      </div>

      <div className="canvasSubContainer" style={styles.modal}></div>
      <DebugModals />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    height: 'calc(100% - 40px)',
    width: 'calc(100% - 40px)',
  },
  header: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#fff',
    padding: '0 10px',
  },
  body: {
    flex: 1,
    color: '#fff',
    overflow: 'auto',
  },
  footer: {
    height: '50px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '120px',
    justifyContent: 'center',
  },
};

export default UIController;


// import React, { useEffect } from 'react';
// import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// import ToggleOffIcon from '@mui/icons-material/ToggleOff';
// import ToggleOnIcon from '@mui/icons-material/ToggleOn';
// import AutoModeOutlinedIcon from '@mui/icons-material/AutoModeOutlined';
// import ZoomInMapOutlinedIcon from '@mui/icons-material/ZoomInMapOutlined';
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
// import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
// import Modal from './Modal';
// import DebugModals from './modals/DebugModals';

// import { useState, MouseEvent } from 'react';
// import { useEventController } from '../Globals/EventController';
// import { ChevronDown } from 'lucide-react';
// import './ui.css'; // Import the consolidated stylesheet

// interface Props {
//   enabled: boolean;
// }

// function EscIcon() {
//   return (
//     <div style={{
//       // display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       border: '1.5px solid #ccc',
//       borderRadius: '2px',
//       padding: '0.25rem 0.5rem',
//       fontSize: '0.5rem',
//       fontWeight: 'bold',
//       fontFamily: 'Arial, sans-serif',
//       color: '#fff',
//       backgroundColor: '#33333366',
//       transform: 'scale(1.5)',
//       // opacity:'66%'
//     }}>
//       esc
//     </div>
//   );
// }


// function UIController(props: Props) {
//   const { enabled } = props;
//   const { globalCanvasState, updateGlobalCanvasState, stateValues, updateStateValues } = useEventController();
//   const [loading, setLoading] = useState(false); // Track loading state


//   const [isScrolling, setIsScrolling] = useState(false);

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

//   // Add window height to ensure scrolling ends beyond the splash, accounting for navbar height
//   const targetScroll = splashBottom - navbar.offsetHeight;

//   if (chevron.classList.contains('scrolling')) {
//     // Stop scrolling
//     chevron.classList.remove('scrolling');
//     return;
//   }

//   chevron.classList.add('scrolling');

//   const scrollInterval = setInterval(() => {
//     const currentScroll = window.scrollY;

//     // Stop scrolling if we've reached or exceeded the target scroll position
//     if (currentScroll >= targetScroll || currentScroll + window.innerHeight >= document.body.scrollHeight) {
//       clearInterval(scrollInterval);
//       chevron.classList.remove('scrolling');
//     } else {
//       window.scrollBy(0, 8); // Incremental scroll
//     }
//   }, 10);
// };
  
//   const toggleProjection = () => {
//     const newProjectionType =
//       stateValues.projectionType === 'perspective' ? 'orthographic' : 'perspective';
//     updateStateValues('cameraType', newProjectionType);
//   };

//   const handleToggle = (e) => {
//     e.preventDefault();
//     (e.target as HTMLButtonElement).blur();
//     if (loading) return; // Prevent interaction during loading

//     setLoading(true); // Enter loading state
    
//     setTimeout(() => {
//       // toggleCameraMode(e); // Trigger the toggle logic
//       setLoading(false); // Exit loading state after 2 seconds
//     }, 2000);
//   };
  
//   useEffect(()=>{
//     toggleCameraMode(e); // Trigger the toggle logic
//     // const newMode = globalCanvasState.cameraMode === 'manual' ? 'track' : 'manual';
//     // updateGlobalCanvasState('cameraMode', newMode);
    
//   }, [loading])
//   // useEffect(() => {
//   //   function handleEscape(e: KeyboardEvent) {
//   //     if (e.key === 'Escape') {
//   //       e.preventDefault();
//   //       updateGlobalCanvasState('cameraMode', 'track');
//   //       // escapeCameraMode(e);
//   //     }
//   //   }
//   //   window.addEventListener('keydown', handleEscape);
//   //   return () => window.removeEventListener('keydown', handleEscape);
//   // }, [globalCanvasState]);

//   function toggleCameraMode(e: MouseEvent<HTMLButtonElement>) {
//     e.preventDefault();
//     (e.target as HTMLButtonElement).blur();
//     const newMode = globalCanvasState.cameraMode === 'manual' ? 'track' : 'manual';
//     updateGlobalCanvasState('cameraMode', newMode);
//   }

//   // function escapeCameraMode(e: KeyboardEvent) {
//   //   const newMode = 'track';
//   //   updateGlobalCanvasState('cameraMode', newMode);
//   // }

//   function toggleMouseCursorLock(e: MouseEvent<HTMLButtonElement>) {
//     e.preventDefault();
//     // Logic for cursor lock
//   }

//   return (
//     <div className="canvasContainer" style={styles.container}>
//       <div className="canvasSubContainer" style={styles.header}>
//       {loading ? (
//           <button className="canvasButton" disabled>
//             <div className="spinner" /> {/* Render a spinning loader */}
//           </button>
//         ) : globalCanvasState.cameraMode !== 'manual' ? (
          
//           <div className="canvasButtonBackground">
//             <button
//               onClick={(e) => handleToggle(e)}
//               className="canvasButton"
//               id="toggleCursorLock"
//             >
//               <VisibilityOutlinedIcon style={{ fontSize: '2rem' }} />
//             </button>
//           </div>
//         ) : (
//           <button onClick={(e) => handleToggle(e)} className="canvasButton">
//             <EscIcon /> {/* Render escape icon */}
//           </button>
//         )}
//       </div>
      
//             {/* Camera Toggle Button */}
//       {/* Camera Projection Toggle Button */}
//       <div className="canvasButtonBackground">
//               <button
//                 onClick={toggleProjection} // Use the existing function
//                 className="canvasButton"
//               >
//                 {stateValues.projectionType === 'perspective' ? (
//                   <ZoomInMapOutlinedIcon style={{ fontSize: '2rem' }} />
//                 ) : (
//                   <ViewInArOutlinedIcon style={{ fontSize: '2rem' }} />
//                 )}
//               </button>
//         </div>
    

//       <div className="canvasSubContainer" style={styles.body}>
        
//       </div>

//       <div className="canvasSubContainer" style={styles.footer}>

//       <div className="splashChevronContainer">
//       <button
//       className={`splashChevronButton ${isScrolling ? 'scrolling' : ''}`}
//       onClick={handleAutoScroll}
//       title="Scroll down"
//     >
//             <ChevronDown className="splashChevron" />
//           </button>
//         </div>

//       </div>

//       <div className="canvasSubContainer" style={styles.modal}>
//       </div>

//         <DebugModals />
//     </div>
//   );
// }

// const styles: { [key: string]: React.CSSProperties } = {
//   container: {
//     position: 'absolute',
//     top: '20px',
//     left: '20px',
//     zIndex: 10,
//     display: 'flex',
//     flexDirection: 'column', // Stack header, body, footer vertically
//     gap: '0', // Remove unnecessary gaps between sections
//     height: 'calc(100% - 40px)', // Ensures it fits within parent wrapper constraints
//     width: 'calc(100% - 40px)', // Same margin adjustment
//   },
//   header: {
//     height: '50px', // Fixed height for header
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // background: '#222',
//     color: '#fff',
//     padding: '0 10px',
//   },
//   body: {
//     flex: 1, // Expands to fill remaining vertical space
//     // background: '#333',
//     color: '#fff',
//     overflow: 'auto',
//   },
//   footer: {
//     height: '50px', // Fixed height for footer
//     // background: '#444', // Visible background for debugging
//     color: '#fff',
//     display: 'flex',
//     alignItems: 'center',
//     paddingBottom: '120px',
//     justifyContent: 'center', // Center footer content
//   },
// };

// export default UIController;
