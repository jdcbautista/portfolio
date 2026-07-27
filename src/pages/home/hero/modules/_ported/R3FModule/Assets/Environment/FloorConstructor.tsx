// FloorConstructor.tsx
import React from 'react';
import GeometryInstantiator from './GeometryInstantiator';

interface PropObject {
  position: [number, number, number] | number[];
  dimensions: [number, number, number] | number[]; // [floorX, height, floorZ]
  color?: string;
  verticalOffset?: number;
}

interface FloorConstructorProps {
  propObjects: PropObject[];
}

const FloorConstructor = ({ propObjects }: FloorConstructorProps) => {
  // Create floor objects with optional vertical offset
  const floorObjects = propObjects.map((config) => ({
    position: [
      config.position[0],
      config.position[1] + (config.verticalOffset ?? 0),
      config.position[2]
    ],
    args: config.dimensions,
    color: config.color || '#ddeeff',
  }));

  const boundaryObjects = propObjects.map((config) => ({
    position: [
      config.position[0],
      config.dimensions[1] / 2 + config.position[1] + (config.verticalOffset ?? 0),
      config.position[2]
    ],
    args: [
      config.dimensions[0] + 0.5, 
      config.dimensions[1], 
      config.dimensions[2] + 0.5
    ],
  }));

  return ( 
    <group>
      {/* GeometryInstantiator for floors */}
      <GeometryInstantiator geometryType="box" propObjects={floorObjects} />
      {/* GeometryInstantiator for boundaries */}
      <GeometryInstantiator geometryType="boundary" propObjects={boundaryObjects} />
    </group>
  );
};

export default FloorConstructor;