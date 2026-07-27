import React, { useEffect } from 'react';
import { useTrackController } from "../../../../../R3FModule/Camera/TrackController.tsx";
import { useEventController } from '../../../../../R3FModule/Globals/EventController.tsx';
// import CanvasComponent from "../../../../../R3FModule/Globals/CanvasComponent";


const DevScene: React.FC = () => {
  const { createSequence, playSequence, pauseSequence } = useTrackController();
  
  // const InitValues() => {
    //   requestAction["initializeCursor",
    //     {
      //       cameraMode: "track",
      //       trackCursorPosition: [0,0,0] ,
      //     }
      //   ]
      // }
    const { requestAction } = useEventController();
    const InitValues = () => {
      console.log("INITIALIZE REQUEST")
      requestAction("initializeValues", {
        cameraMode: "track",
        trackCursorPosition: [0, 5, 0],
        cursorRotation: [Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0],
        isPlaying: false,
        shouldReset: true,
      });

    };

  useEffect(() => {
    // Initialize a sample sequence
    const sampleSequence = {
      sequenceID: 2,
      sequenceName: 'Sample Sequence',
      nodeArray: [
        { nodeID: 1, nodePosition: [0, 0, 0], nodeRotation: [0, 0, 0], nodeConfig: {transitionDuration: 5}},
        // { nodeID: 1, nodePosition: [0, -10, 0], nodeRotation: [.6, Math.PI / 4, 0], nodeConfig: {transitionDuration: 5}},
        // { nodeID: 1, nodePosition: [0, 10, 0], nodeRotation: [.6, Math.PI / 4, 0], nodeConfig: {transitionDuration: 5}},
        // { nodeID: 2, nodePos: [0, 10, 0], nodeConfig: {transitionDuration: 5}},
      ],
      sequenceConfig: { circular: true },
    };

    // createSequence(sampleSequence);
    requestAction("createSequence", sampleSequence)
    // requestAction("pauseSequence", true)
    requestAction("playSequence", false)
    InitValues()
    // pauseSequence();
    // playSequence();

    // Cleanup if necessary
    // return () => {
    //   // Add any cleanup logic here
    // };
  }, []);
  
  return null;

};

export default DevScene
// requestAction