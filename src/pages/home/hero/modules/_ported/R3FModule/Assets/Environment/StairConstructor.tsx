// StairConstructor.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import GeometryInstantiator from './GeometryInstantiator';
import SimpleSlopeGeometryConstructor from './SimpleSlopeGeometryConstructor';
import { RigidBody, MeshCollider } from '@react-three/rapier';

interface StairObject {
  position: [number, number, number];
  dimensions: [number, number, number];
  rotation: [number, number, number];
  color?: string;
  stepColor?: string;
  showVisibleSlope?: boolean;
}

interface StairConstructorProps {
  propObjects: StairObject[];
}

function calculateStairParameters(stair: StairObject) {
  const [width, height, depth] = stair.dimensions;
  const [rx, ry, rz] = stair.rotation;
  
  const rxRad = THREE.MathUtils.degToRad(rx);
  const ryRad = THREE.MathUtils.degToRad(ry);
  
  const horizontalRun = depth * Math.cos(rxRad);
  const verticalRise = depth * Math.sin(rxRad);
  
  const directionX = Math.sin(ryRad);
  const directionZ = Math.cos(ryRad);
  
  const targetRisePerStep = 0.175;
  const numSteps = Math.max(2, Math.ceil(Math.abs(verticalRise) / targetRisePerStep));
  const actualRisePerStep = verticalRise / numSteps;
  const horizontalStepDistance = horizontalRun / numSteps;
  
  const treadDepth = Math.max(0.25, 0.63 - (2 * Math.abs(actualRisePerStep)));
  
  return {
    numSteps,
    actualRisePerStep,
    treadDepth,
    horizontalStepDistance,
    directionX,
    directionZ,
    verticalRise,
    horizontalRun,
    width,
    slopeAngle: Math.abs(rx)
  };
}

const StairConstructor: React.FC<StairConstructorProps> = ({ propObjects }) => {
  // Memoize all stair calculations to prevent recreating geometry every frame
  const stairData = useMemo(() => {
    return propObjects.map((stair, stairIndex) => {
      const params = calculateStairParameters(stair);
      const [baseX, baseY, baseZ] = stair.position;
      const [rx, ry, rz] = stair.rotation;
      
      const slopeColor = stair.color || '#8B7355';
      const stepColor = stair.stepColor || '#A0826D';
      
      const lowestY = baseY - (params.verticalRise / 2);
      const highestY = baseY + (params.verticalRise / 2);
      
      const halfHorizontalRun = params.horizontalRun / 2;
      const startOffsetX = -halfHorizontalRun * params.directionX;
      const startOffsetZ = -halfHorizontalRun * params.directionZ;
      
      // Generate steps
      const stairSteps: any[] = [];
      for (let i = 0; i < params.numSteps; i++) {
        const horizontalProgress = i * params.horizontalStepDistance;
        const verticalProgress = i * params.actualRisePerStep;
        
        const stepX = baseX + startOffsetX + (horizontalProgress * params.directionX);
        const stepY = lowestY + verticalProgress + (Math.abs(params.actualRisePerStep) / 2);
        const stepZ = baseZ + startOffsetZ + (horizontalProgress * params.directionZ);
        
        stairSteps.push({
          key: `step-${stairIndex}-${i}`,
          position: [stepX, stepY, stepZ],
          args: [params.width, Math.abs(params.actualRisePerStep), params.treadDepth + 0.05],
          color: stepColor,
          mass: 0,
          type: 'Static',
          triggerOnly: true,
          rotation: [0, THREE.MathUtils.degToRad(ry), 0]
        });
      }
      
      /**
       * Calculate corner heights for SimpleSlopeGeometryConstructor
       * 
       * In the centered unit space (before scaling and rotation):
       * Geometry spans from -0.5 to 0.5 in X and Z
       * - SW (-0.5, -0.5): back-left
       * - SE (0.5, -0.5): back-right
       * - NE (0.5, 0.5): front-right
       * - NW (-0.5, 0.5): front-left
       * 
       * In local space (before Y rotation):
       * - -Z direction is the back/start of stairs
       * - +Z direction is the front/end of stairs
       * 
       * If rx > 0: stairs go UP in +Z direction (front is high)
       * If rx < 0: stairs go DOWN in +Z direction (back is high)
       */
      const isGoingUp = rx > 0;
      const cornerHeights = isGoingUp
        ? { SW: 0, SE: 0, NE: params.verticalRise, NW: params.verticalRise }
        : { SW: params.verticalRise, SE: params.verticalRise, NE: 0, NW: 0 };
      
      return {
        stairIndex,
        baseX,
        baseY,
        baseZ,
        lowestY,
        ry,
        params,
        slopeColor,
        stairSteps,
        cornerHeights
      };
    });
  }, [propObjects]); // Only recalculate when propObjects changes

  return (
    <group>
      {stairData.map(({ stairIndex, baseX, baseY, baseZ, lowestY, ry, params, slopeColor, stairSteps, cornerHeights }) => (
        <group key={`stair-group-${stairIndex}`}>
          {/* Slope geometry with proper transforms */}
          <group
            position={[baseX, lowestY, baseZ]}
            rotation={[0, THREE.MathUtils.degToRad(ry), 0]}
            scale={[params.width, 1, params.horizontalRun]}
          >
            <RigidBody type="fixed" colliders={false} restitution={0.1}>
              <MeshCollider type="trimesh">
                <SimpleSlopeGeometryConstructor
                  meshKey={`slope-${stairIndex}`}
                  position={[0, 0, 0]}
                  slopeParams={{
                    color: slopeColor,
                    baseY: 0,
                    cornerHeights: cornerHeights,
                  }}
                />
              </MeshCollider>
            </RigidBody>
          </group>
          
          <GeometryInstantiator geometryType="box" propObjects={stairSteps} />
        </group>
      ))}
    </group>
  );
};

export default StairConstructor;