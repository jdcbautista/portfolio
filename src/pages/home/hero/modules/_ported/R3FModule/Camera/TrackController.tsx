/* eslint-disable @typescript-eslint/no-unused-vars */
// Camera/TrackController.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useEventController } from '../Globals/EventController';
import {
  TrackSequence,
  CreateNodeEvent,
  UpdateNodeEvent,
  Direction,
} from './TrackControllerTypes';
// import type { TrackNode } from '../Types/TrackControllerTypes';

// -----------------------------
// Context Definitions
// -----------------------------

interface TrackControllerContextType {
  isPlaying: boolean;
  direction: Direction;
  currentSequenceID: number | null; // Loaded sequence for modification
  selectedSequenceID: number | null; // Selected sequence for EventController
  currentIndex: number;
  lerpCursor: number;
  playSequence: () => void;
  pauseSequence: () => void;
  stopSequence: () => void;
  resetSequence: () => void;
  setDirection: (dir: Direction) => void;
  createSequence: (sequence: TrackSequence) => void;
  deleteSequence: (sequenceID: number) => void;
  swapSequence: (idOrName: number | string) => void;
  createNode: (event: CreateNodeEvent) => void;
  updateNode: (event: UpdateNodeEvent) => void;
  deleteNode: (nodeID: number) => void;
  swapNode: (nodeID: number) => void;
  resetLerp: () => void;
  selectSequence: (idOrName: number | string) => void; // For selecting sequence for EventController
  getCurrentLerpedPosition: () => [number, number, number] | null;
  getCurrentLerpedRotation: () => [number, number, number] | null;
  updateLerp: (deltaTime: number) => void;
}

const TrackControllerContext = createContext<TrackControllerContextType | undefined>(undefined);

// Custom hook to use the TrackController context
export const useTrackController = (): TrackControllerContextType => {
  const context = useContext(TrackControllerContext);
  if (!context) {
    throw new Error('useTrackController must be used within TrackControllerProvider');
  }
  return context;
};


// -----------------------------
// TrackControllerProvider Component
// -----------------------------

export const TrackControllerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { eventRequest, stateValues, removeAction, updateStateValues } = useEventController();

  // -----------------------------
  // State Management
  // -----------------------------

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [direction, setDirectionState] = useState<Direction>('forward');
  const [currentSequenceID, setCurrentSequenceID] = useState<number | null>(null); // Loaded sequence
  const [selectedSequenceID, setSelectedSequenceID] = useState<number | null>(null); // Selected for EventController
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lerpCursor, setLerpCursor] = useState<number>(0);
  const [sequences, setSequences] = useState<Record<number, TrackSequence>>({});

  // -----------------------------
  // Helper Functions
  // -----------------------------

  // useEffect(()=>{
  //   setIsPlaying(false)
  // },[eventRequest])
  
  // useEffect(() => {
  ////console.log('Sequences:', sequences);
  // }, [sequences]);

  // Get sequence by ID or name
  const getSequenceByIDOrName = useCallback(
    (idOrName: number | string): TrackSequence | undefined => {
      if (typeof idOrName === 'number') return sequences[idOrName];
      return Object.values(sequences).find((seq) => seq.sequenceName === idOrName);
    },
    [sequences]
  );

  // -----------------------------
  // Sequence Management Functions
  // -----------------------------

  const createSequence = useCallback(
    (seq: TrackSequence) => {
      setSequences((prev) => ({ ...prev, [seq.sequenceID]: seq }));
      ////console.log(`Sequence created: ${seq.sequenceName} with ID ${seq.sequenceID}`);

      setCurrentSequenceID((prevID) => {
      if (currentSequenceID === null) {
        // setCurrentSequenceID(seq.sequenceID);
        ////console.log(`Current sequence set to ID ${seq.sequenceID}`);
        updateStateValues('currentSequenceID', seq.sequenceID);
        return seq.sequenceID;
      }
      return prevID;
    });
  },
  [updateStateValues]
  );

  const deleteSequence = useCallback(
    (sequenceID: number) => {
      if (sequenceID === 0) return; // Prevent deletion of default or important sequence
      setSequences((prev) => {
        const { [sequenceID]: _, ...rest } = prev;
        return rest;
      });
      ////console.log(`Sequence with ID ${sequenceID} deleted`);

      if (currentSequenceID === sequenceID) {
        const remainingSequences = Object.keys(sequences)
          .map(Number)
          .filter((id) => id !== sequenceID);
        const newCurrentSequenceID = remainingSequences.length > 0 ? remainingSequences[0] : null;
        setCurrentSequenceID(newCurrentSequenceID);
        setCurrentIndex(0);
        setLerpCursor(0);
        ////console.log(`Current sequence switched to ID ${newCurrentSequenceID}`);
        updateStateValues('currentSequenceID', newCurrentSequenceID);
        updateStateValues('currentIndex', 0);
        updateStateValues('lerpCursor', 0);
      }
    },
    [currentSequenceID, sequences, updateStateValues]
  );

  const swapSequence = useCallback(
    (idOrName: number | string) => {
      const seq = getSequenceByIDOrName(idOrName);
      if (seq) {
        setCurrentSequenceID(seq.sequenceID);
        setCurrentIndex(0);
        setLerpCursor(0);
        ////console.log(`Swapped to sequence ID ${seq.sequenceID}`);
        updateStateValues('currentSequenceID', seq.sequenceID);
        updateStateValues('currentIndex', 0);
        updateStateValues('lerpCursor', 0);
      } else {
        console.warn(`Sequence not found for ID or Name: ${idOrName}`);
      }
    },
    [getSequenceByIDOrName, updateStateValues]
  );

  // -----------------------------
  // Node Management Functions
  // -----------------------------

  const createNode = useCallback(
    (event: CreateNodeEvent) => {
      const { seqIdOrName, node } = event;
      const seq = getSequenceByIDOrName(seqIdOrName);
      if (!seq) {
        console.warn(`Sequence not found for ID or Name: ${seqIdOrName}`);
        return;
      }

      const updatedSeq: TrackSequence = {
        ...seq,
        nodeArray: [...seq.nodeArray, node],
      };
      setSequences((prev) => ({ ...prev, [seq.sequenceID]: updatedSeq }));
      ////console.log(`Node created with ID ${node.nodeID} in sequence ${seq.sequenceName}`);

      if (currentSequenceID === null) {
        setCurrentSequenceID(seq.sequenceID);
        setCurrentIndex(0);
        setLerpCursor(0);
        ////console.log(`Current sequence set to ID ${seq.sequenceID}`);
        updateStateValues('currentSequenceID', seq.sequenceID);
        updateStateValues('currentIndex', 0);
        updateStateValues('lerpCursor', 0);
      }
      updateStateValues('nodeArray', updatedSeq.nodeArray);
    },
    [getSequenceByIDOrName, setSequences, currentSequenceID, updateStateValues]
  );

  const updateNode = useCallback(
    (event: UpdateNodeEvent) => {
      const { nodeID, updates } = event;
      if (currentSequenceID === null) return;
      const seq = sequences[currentSequenceID];
      if (!seq) return;

      const nodeIndex = seq.nodeArray.findIndex((n) => n.nodeID === nodeID);
      if (nodeIndex !== -1) {
        const updatedNodeArray = [...seq.nodeArray];
        updatedNodeArray[nodeIndex] = { ...updatedNodeArray[nodeIndex], ...updates };
        const updatedSeq: TrackSequence = {
          ...seq,
          nodeArray: updatedNodeArray,
        };
        setSequences((prev) => ({ ...prev, [currentSequenceID]: updatedSeq }));
        ////console.log(`Node with ID ${nodeID} updated in sequence ${seq.sequenceName}`);
        updateStateValues('nodeArray', updatedNodeArray);
      } else {
        console.warn(`Node with ID ${nodeID} not found in sequence ${seq.sequenceName}`);
      }
    },
    [currentSequenceID, sequences, setSequences, updateStateValues]
  );

  const deleteNode = useCallback(
    (nodeID: number) => {
      if (currentSequenceID === null) return;
      const seq = sequences[currentSequenceID];
      if (!seq) return;

      const updatedNodeArray = seq.nodeArray.filter((n) => n.nodeID !== nodeID);
      const updatedSeq: TrackSequence = {
        ...seq,
        nodeArray: updatedNodeArray,
      };
      setSequences((prev) => ({ ...prev, [currentSequenceID]: updatedSeq }));
      ////console.log(`Node with ID ${nodeID} deleted from sequence ${seq.sequenceName}`);

      if (currentIndex >= updatedNodeArray.length) {
        const newIndex = Math.max(0, updatedNodeArray.length - 1);
        setCurrentIndex(newIndex);
        updateStateValues('currentIndex', newIndex);
      }
      setLerpCursor(0);
      updateStateValues('lerpCursor', 0);
      updateStateValues('nodeArray', updatedNodeArray);
    },
    [currentSequenceID, sequences, setSequences, currentIndex, updateStateValues]
  );

  const swapNode = useCallback(
    (nodeID: number) => {
      if (currentSequenceID === null) return;
      const seq = sequences[currentSequenceID];
      if (!seq) return;

      const idx = seq.nodeArray.findIndex((n) => n.nodeID === nodeID);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setLerpCursor(0);
        ////console.log(`Swapped to node with ID ${nodeID} in sequence ${seq.sequenceName}`);
        updateStateValues('currentIndex', idx);
        updateStateValues('lerpCursor', 0);
      } else {
        console.warn(`Node with ID ${nodeID} not found in sequence ${seq.sequenceName}`);
      }
    },
    [currentSequenceID, sequences, updateStateValues]
  );

  // -----------------------------
  // Sequence Control Functions
  // -----------------------------

  // const playSequence = useCallback(() => {
  ////console.log(`TrackController.playSequence: isPlaying == ${isPlaying}`)
  //   if (!isPlaying){ 
  //     setIsPlaying(true);
  //     updateStateValues('isPlaying', true);
  //     ////console.log("LINE 282 playing", "state:", isPlaying, "event:", stateValues.isPlaying)
  //     // removeAction("playSequence");
  //   } else {
  //     ////console.log(`REQUEST DENIED: isPlaying is already set to ${isPlaying}`)
  //   }
  ////console.log('Sequence playback started');
  // }, []);

  const playSequence = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        updateStateValues('isPlaying', true);
        updateStateValues('isPaused', false);
        ////console.log('playSequence activated:', !prev);
        return true;
      } else {
        ////console.log(`TrackController.playSequence REQUEST DENIED: isPlaying is already set to ${prev}`);
        return prev;
      }
    });
  }, [updateStateValues]);

  // const pauseSequence = useCallback(() => {
  ////console.log(`TrackController.pauseSequence: isPlaying == ${isPlaying}`)
  //   if (isPlaying){ 
  //     setIsPlaying(false);
  //     updateStateValues('isPlaying', false);
  //     ////console.log("LINE 293 Pausing", "state:", isPlaying, "event:", stateValues.isPlaying)
  //   } else {
  //     ////console.log(`REQUEST DENIED: isPlaying is already set to ${isPlaying}`)
  //   }
  //     ////console.log('Sequence playback paused');
  // }, [eventRequest]);

  const pauseSequence = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        updateStateValues('isPlaying', false);
        updateStateValues('isPaused', true);
        ////console.log('playSequence deactivated:', !prev);
        return false;
      } else {
        ////console.log(`TrackController.pauseSequence REQUEST DENIED: isPlaying is already set to ${prev}`);
        return !prev;
      }
    });
  }, [updateStateValues]);


  const stopSequence = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        updateStateValues('isPlaying', false);
        updateStateValues('isPaused', false);
        ////console.log('playSequence deactivated:', !prev);
        return false;
      } else {
        ////console.log(`TrackController.pauseSequence REQUEST DENIED: isPlaying is already set to ${prev}`);
        return !prev;
      }
    });
  }, [updateStateValues]);

  const resetSequence = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        
        // updateStateValues('isPlaying', false);
        // updateStateValues('isPaused', false);
        ////console.log('playSequence deactivated:', !prev);
        return false;
      } else {
        ////console.log(`TrackController.pauseSequence REQUEST DENIED: isPlaying is already set to ${prev}`);
        return !prev;
      }
    });
  }, [updateStateValues]);

  const setDirectionStateWrapped = useCallback(
    (dir: Direction) => {
      setDirectionState(dir);
      updateStateValues('direction', dir);
      setLerpCursor(0);
      updateStateValues('lerpCursor', 0);
      ////console.log(`Direction set to ${dir}`);
    },
    [updateStateValues]
  );

  const newCycle = useCallback(() => {
    if (currentSequenceID === null) return;
    const seq = sequences[currentSequenceID];
    if (!seq || seq.nodeArray.length === 0) return;

    let nextIndex = currentIndex;
    if (direction === 'forward') {
      nextIndex++;
      if (nextIndex >= seq.nodeArray.length) {
        nextIndex = seq.sequenceConfig?.circular ? 0 : seq.nodeArray.length - 1;
      }
    } else {
      nextIndex--;
      if (nextIndex < 0) {
        nextIndex = seq.sequenceConfig?.circular ? seq.nodeArray.length - 1 : 0;
      }
    }

    setCurrentIndex(nextIndex);
    setLerpCursor(0);
    updateStateValues('currentIndex', nextIndex);
    updateStateValues('lerpCursor', 0);
    ////console.log(`New cycle: index ${nextIndex}`);
  }, [currentSequenceID, sequences, currentIndex, direction, updateStateValues]);

  // -----------------------------
  // Lerp Control Functions
  // -----------------------------

  const resetLerp = useCallback(() => {
    setLerpCursor(0);
    updateStateValues('lerpCursor', 0);
    ////console.log('Lerp cursor reset to 0');
  }, [updateStateValues]);

  // updateLerp is read by the TrackCursor
  const updateLerp = useCallback(
    (deltaTime: number) => {
      if (!isPlaying || currentSequenceID === null) return;
      const seq = sequences[currentSequenceID];
      if (!seq || seq.nodeArray.length < 2) return;

      const currentNode = seq.nodeArray[currentIndex];
      const duration = currentNode.nodeConfig?.transitionDuration ?? 10.0; // Default to 10 seconds
      ////console.log("UPDATING LERP")
      if (duration === 0) {
        ////console.log("instant teleport")
        // Instant transition: directly set lerpCursor to 1
        setLerpCursor(1);
        updateStateValues('lerpCursor', 1);
        const [x, y, z] = currentNode.nodePosition;
        const [xr, yr, zr] = currentNode.nodeRotation ?? [0,0,0];
        updateStateValues('trackCursorPosition', [x, y, z]);
        updateStateValues('trackCursorRotation', [xr, yr, zr]);
        // return; // Prevent further lerping in this frame
      }

      const newCursor = Math.min(lerpCursor + deltaTime / duration, 1);
      setLerpCursor(newCursor);
      updateStateValues('lerpCursor', newCursor);

      if (newCursor >= 1) {
        newCycle();
      }
    },
    [isPlaying, currentSequenceID, sequences, currentIndex, lerpCursor, newCycle, updateStateValues]
  );

  // This
  // const getCurrentLerpedPosition = useCallback((): [[number, number, number], [number, number, number]] | null => {
  const getCurrentLerpedPosition = useCallback(() => {
    // State Check
    if (isPlaying && stateValues.isPlaying){

      // Sequence & Node Check:  Does sequence exist with at least one node?
      if (currentSequenceID === null) return null;
      const seq = sequences[currentSequenceID];
      if (!seq || seq.nodeArray.length === 0) return null;
      
      const currentNode = seq.nodeArray[currentIndex];
      if (!currentNode) return null;

      // Locked position for instant transitions
      if (lerpCursor === 1 || seq.nodeArray.length === 1) {
        // return currentNode.nodePosition as [number, number, number];
        return [currentNode.nodePosition as [number, number, number]];
      }

      const nextIndex =
        direction === 'forward'
          ? (currentIndex + 1) % seq.nodeArray.length
          : (currentIndex - 1 + seq.nodeArray.length) % seq.nodeArray.length;

      const nextNode = seq.nodeArray[nextIndex];
      const [sx, sy, sz] = currentNode.nodePosition;
      const [tx, ty, tz] = nextNode.nodePosition;
      
      const x = sx + (tx - sx) * lerpCursor;
      const y = sy + (ty - sy) * lerpCursor;
      const z = sz + (tz - sz) * lerpCursor;

      //console.log("GET LERPED POSITION")
      updateStateValues("trackCursorPosition", [x,y,z])
      
      // Dont need to udpate state values?
      return [x, y, z];
    }
  }, [currentSequenceID, sequences, currentIndex, direction, lerpCursor]);

    const getCurrentLerpedRotation = useCallback((): [number, number, number] | null => {
      if (currentSequenceID === null) return null;
      const seq = sequences[currentSequenceID];
      if (!seq || seq.nodeArray.length === 0) return null;
    
      const currentNode = seq.nodeArray[currentIndex];
      if (!currentNode) return null;
    
      if (lerpCursor === 1 || seq.nodeArray.length === 1) {
        return currentNode.nodeRotation  as [number, number, number] ?? [0, 0, 0] as [number, number, number];
      }
    
      const nextIndex =
        direction === 'forward'
          ? (currentIndex + 1) % seq.nodeArray.length
          : (currentIndex - 1 + seq.nodeArray.length) % seq.nodeArray.length;
    
      const nextNode = seq.nodeArray[nextIndex];
      const [srx, sry, srz] = currentNode.nodeRotation ?? [0, 0, 0];
      const [trx, tryy, trz] = nextNode.nodeRotation ?? [0, 0, 0];
    
      const xr = srx + (trx - srx) * lerpCursor;
      const yr = sry + (tryy - sry) * lerpCursor;
      const zr = srz + (trz - srz) * lerpCursor;
      updateStateValues("trackCursorRotation", [xr,yr, zr])

      return [xr, yr, zr];
    }, [currentSequenceID, sequences, currentIndex, direction, lerpCursor]);
  

  // -----------------------------
  // Sequence Selection for EventController
  // -----------------------------

  const selectSequence = useCallback(
    (idOrName: number | string) => {
      const seq = getSequenceByIDOrName(idOrName);
      if (seq) {
        setSelectedSequenceID(seq.sequenceID);
        updateStateValues('selectedSequenceID', seq.sequenceID);
        ////console.log(`Selected sequence ID ${seq.sequenceID} for EventController`);
      } else {
        console.warn(`Sequence not found for ID or Name: ${idOrName}`);
      }
    },
    [getSequenceByIDOrName, updateStateValues]
  );

  // -----------------------------
  // Event Handling
  // -----------------------------

  const handleEvent = useCallback((eventType: string, payload: unknown) => {
    switch (eventType) {
      case 'playSequence':
        if (payload === true) {
          playSequence();
        }
        break;
      case 'pauseSequence':
        if (payload === true) {
          pauseSequence();
        }
        break;
      case 'setDirection':
        if (payload === 'forward' || payload === 'backward') {
          setDirectionStateWrapped(payload);
        }
        break;
      case 'createSequence':
        ////console.log("ATTEMPTING CREATE SEQUENCE")
        if (isTrackSequence(payload)) {
         //console.log(`🏃🏃🏃 TrackController.handleEvent: Handling ${eventType} with payload ${payload.toString()}.  Creating Sequence`)
          createSequence(payload);
        } else {
          console.warn(`Invalid payload for createSequence:`, payload);
        }
        break;
      case 'deleteSequence':
        if (typeof payload === 'number') {
          deleteSequence(payload);
        } else {
          console.warn(`Invalid payload for deleteSequence:`, payload);
        }
        break;
      case 'swapSequence':
        if (typeof payload === 'number' || typeof payload === 'string') {
          swapSequence(payload);
        } else {
          console.warn(`Invalid payload for swapSequence:`, payload);
        }
        break;
      case 'createNode':
        if (isCreateNodeEvent(payload)) {
          createNode(payload);
        } else {
          console.warn(`Invalid payload for createNode:`, payload);
        }
        break;
      case 'updateNode':
        if (isUpdateNodeEvent(payload)) {
          updateNode(payload);
        } else {
          console.warn(`Invalid payload for updateNode:`, payload);
        }
        break;
      case 'deleteNode':
        if (typeof payload === 'number') {
          deleteNode(payload);
        } else {
          console.warn(`Invalid payload for deleteNode:`, payload);
        }
        break;
      case 'swapNode':
        if (typeof payload === 'number') {
          swapNode(payload);
        } else {
          console.warn(`Invalid payload for swapNode:`, payload);
        }
        break;
      case 'resetLerp':
        if (payload === true) {
          resetLerp();
        }
        break;
      case 'selectSequence':
        if (typeof payload === 'number' || typeof payload === 'string') {
          selectSequence(payload);
        } else {
          console.warn(`Invalid payload for selectSequence:`, payload);
        }
        break;
      case 'initializeValues':
        if (payload && typeof payload === 'object') {
          console.log("")
          Object.entries(payload).forEach(([key, value]) => {
          updateStateValues(key, value);
          });
        } else {
            console.warn(`Invalid payload for selectSequence:`, payload);
          }
          break;
      // Add more cases if needed
      default:
        console.warn(`Unhandled event type: ${eventType}`);
        break;
    }
  },[
    playSequence,
    pauseSequence,
    stopSequence,
    resetSequence,
    setDirectionStateWrapped,
    createSequence,
    deleteSequence,
    swapSequence,
    createNode,
    updateNode,
    deleteNode,
    swapNode,
    resetLerp,
    selectSequence,
  ]);

    // Type Guards for validation
    const isTrackSequence = (payload: unknown): payload is TrackSequence => {
      return (
        typeof payload === 'object' &&
        payload !== null &&
        'sequenceID' in payload &&
        'sequenceName' in payload &&
        'nodeArray' in payload
      );
    };

    const isCreateNodeEvent = (payload: unknown): payload is CreateNodeEvent => {
      return (
        typeof payload === 'object' &&
        payload !== null &&
        'seqIdOrName' in payload &&
        'node' in payload
      );
    };

    const isUpdateNodeEvent = (payload: unknown): payload is UpdateNodeEvent => {
      return (
        typeof payload === 'object' &&
        payload !== null &&
        'nodeID' in payload &&
        'updates' in payload
      );
    };

  // useEffect(() => {
  //   if (Object.keys(eventRequest).length === 0) return; // Avoid unnecessary runs

  //   // Iterate over all eventRequests and handle them
  //   const requestsToProcess = { ...eventRequest };
  //   Object.entries(requestsToProcess).forEach(([eventType, payload]) => {
  //   // Object.entries(eventRequest).forEach(([eventType, payload]) => {
  //     handleEvent(eventType, payload);
  //     removeAction(eventType);
  //   });
  // }, [
  //   eventRequest, handleEvent, removeAction
  // ]);

  useEffect(() => {
    if (Object.keys(eventRequest).length === 0) return; // Avoid unnecessary runs
    
    // Queue the event processing to avoid mid-render state updates
    const processRequests = async () => {
      const requestsToProcess = { ...eventRequest }; // Clone to avoid mutation issues
      for (const [eventType, payload] of Object.entries(requestsToProcess)) {
        console.log("Processing Event", eventType.toString(), JSON.stringify(payload, null, 2), new Date().toISOString().slice(11, 23))
        await new Promise<void>((resolve) => {
          handleEvent(eventType, payload);
          resolve(); // Ensure each event is processed sequentially
        });
        removeAction(eventType);
      }
    };
  
    processRequests().catch((err) => console.error("Error processing requests:", err));
  }, [eventRequest, handleEvent, removeAction]);

  // -----------------------------
  // Provider Rendering
  // -----------------------------

  return (
    <TrackControllerContext.Provider
      value={{
        isPlaying,
        direction,
        currentSequenceID,
        selectedSequenceID,
        currentIndex,
        lerpCursor,
        playSequence,
        pauseSequence,
        stopSequence,
        resetSequence,
        setDirection: setDirectionStateWrapped,
        createSequence,
        deleteSequence,
        swapSequence,
        createNode,
        updateNode,
        deleteNode,
        swapNode,
        resetLerp,
        selectSequence,
        getCurrentLerpedPosition,
        getCurrentLerpedRotation,
        updateLerp,
      }}
    >
      {children}
    </TrackControllerContext.Provider>
  );
};

export default TrackControllerProvider;
