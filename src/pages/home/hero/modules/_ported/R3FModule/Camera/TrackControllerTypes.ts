// types/TrackControllerTypes.ts

export interface TrackNode {
  nodeID: number;
  nodePosition: [number, number, number] | number[];
  nodeRotation?: [number, number, number] | number[]; // Rotation (e.g., Euler angles: pitch, yaw, roll)
  nodeConfig?: {
    transitionDuration?: number; // Duration in seconds for transitioning to the next node
    transitionSmoothing?: number; // Optional smoothing factor for transitions
  };
}

export interface TrackSequenceConfig {
  circular?: boolean; // If true, the sequence loops back to the start after the last node
  [key: string]: unknown; // Allows for additional configuration properties
}

export interface TrackSequence {
  sequenceID: number;
  sequenceName: string;
  nodeArray: TrackNode[];
  sequenceConfig?: TrackSequenceConfig;
}

export type Direction = 'forward' | 'backward';

export interface CreateNodeEvent {
  seqIdOrName: number | string;
  node: TrackNode;
}

export interface UpdateNodeEvent {
  nodeID: number;
  updates: Partial<TrackNode>;
}
