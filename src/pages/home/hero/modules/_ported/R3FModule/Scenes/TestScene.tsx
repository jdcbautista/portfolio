import React, { useEffect } from 'react';
import { useTrackController } from '../Camera/TrackController.tsx';
// import Test from '../../../pages/test/Test';

const TestScene: React.FC = () => {
  const { createSequence, playSequence } = useTrackController();
  useEffect(() => {
    // Initialize a sample sequence
    const sampleSequence = {
      sequenceID: 1,
      sequenceName: 'Sample Sequence',
      nodeArray: [
        { nodeID: 1, nodeRotation: [0,0,0], nodePosition: [0, 0, 0], nodeConfig: {transitionDuration: 5}},
        { nodeID: 1, nodeRotation: [0,0,0], nodePosition: [-15, 5, -25], nodeConfig: {transitionDuration: 5}},
        { nodeID: 2, nodeRotation: [0,0,0], nodePosition: [10, 5, -25], nodeConfig: {transitionDuration: 0}},
        { nodeID: 3, nodeRotation: [0,0,0], nodePosition: [0, 8, -25], nodeConfig: {transitionDuration: 5}},
        { nodeID: 4, nodeRotation: [0,0,0], nodePosition: [0, 8, -50], nodeConfig: {transitionDuration: 0}},
      ],
      sequenceConfig: { circular: true },
    };

    createSequence(sampleSequence);
    // playSequence();

    // Cleanup if necessary
    // return () => {
    //   // Add any cleanup logic here
    // };
  }, [createSequence, playSequence]);
  
  return null;

};

export default TestScene
