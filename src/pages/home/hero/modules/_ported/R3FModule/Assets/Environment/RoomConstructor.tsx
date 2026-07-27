// RoomConstructor.tsx
import React from 'react';
import WallConstructor from './WallConstructor';
import FloorConstructor from './FloorConstructor';
import StairConstructor from './StairConstructor';

// Types for your data structures:
interface WallSpec {
  wid: number;
  wallType: 'north' | 'south' | 'east' | 'west';
  relativePosition?: [number, number, number]; // Position relative to section center
  wallSegments?: {
    intSegments?: number[];
    extSegments?: number[];
    interiorWallObjects?: unknown[]; 
    exteriorWallObjects?: unknown[];
  };
  childOverrides?: {
    dimensions?: [number, number, number];
    color?: string | null;
    opacity?: number | null;
    meshPreset?: string | null;
    sidePadDivisor?: number | null;
    manualOffsets?: number[][];
    moldingThickness?: number;
    verticalOffset?: number;
  };
}

interface FloorSpec {
  key: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  color?: string;
  verticalOffset?: number;
  meshPreset?: string;
}

interface StairSpec {
  position: [number, number, number];
  dimensions: [number, number, number];
  rotation: [number, number, number];
  color?: string;
  meshPreset?: string;
}

interface Section {
  sid: number;
  description?: string;
  sectionDimensions: [number, number, number]; // [width, height, length]
  sectionPosition: [number, number, number];   // center point
  sectionColor?: string;
  wallThickness?: number;
  walls: WallSpec[];
  floors?: FloorSpec[];
  stairs?: StairSpec[];
  planes?: unknown[]; // optional
}

interface RoomConstructorProps {
  sections: Section[];
}

/**
 * computeWall:
 *  1) Uses the relative position if provided, otherwise falls back to computing from wallType
 *  2) Uses dimensions from childOverrides if provided
 *  3) Attaches wallSegments data for WallConstructor
 */
function computeWall(
  section: Section,
  wall: WallSpec,
  roomOffset: [number, number, number]
) {
  const [secWidth, secHeight, secLength] = section.sectionDimensions;
  const [secX, secY, secZ] = section.sectionPosition;
  const thickness = section.wallThickness ?? 0.25;
  const [roomOffsetX, roomOffsetY, roomOffsetZ] = roomOffset;

  // REMOVED: const baseColor = '#ddeeff';
  
  // Use dimensions from childOverrides if provided
  let wallXLength: number;
  let wallYLength: number;
  let wallZLength: number;

  if (wall.childOverrides?.dimensions) {
    [wallXLength, wallYLength, wallZLength] = wall.childOverrides.dimensions;
  } else {
    // Fallback to computing from wallType
    if (wall.wallType === 'north' || wall.wallType === 'south') {
      wallXLength = secWidth;
      wallZLength = thickness;
    } else {
      wallXLength = thickness;
      wallZLength = secLength;
    }
    wallYLength = secHeight;
  }

  let finalX: number;
  let finalY: number;
  let finalZ: number;

  if (wall.relativePosition) {
    // Use the relative position provided by SceneConstructor
    const [relX, relY, relZ] = wall.relativePosition;
    finalX = roomOffsetX + secX + relX;
    finalY = roomOffsetY + secY + relY;
    finalZ = roomOffsetZ + secZ + relZ;
  } else {
    // Fallback: compute position from section center and wallType
    finalX = roomOffsetX + secX;
    finalY = roomOffsetY + secY + wallYLength / 2;
    finalZ = roomOffsetZ + secZ;

    // Shift to the appropriate side:
    if (wall.wallType === 'east') {
      finalX += secWidth / 2 - thickness / 2;
    } else if (wall.wallType === 'west') {
      finalX -= secWidth / 2 - thickness / 2;
    } else if (wall.wallType === 'south') {
      finalZ += secLength / 2 - thickness / 2;
    } else {
      // north
      finalZ -= secLength / 2 - thickness / 2;
    }
  }

  // console.log(`[RC-Wall] wid=${wall.wid} preset=${wall.childOverrides?.meshPreset || 'default'} color=${wall.childOverrides?.color || 'undefined'} opacity=${wall.childOverrides?.opacity || 'default'}`);
  
  // Return geometry + attach segments/overrides for use by WallConstructor
  return {
    position: [finalX, finalY, finalZ] as [number, number, number],
    dimensions: [wallXLength, wallYLength, wallZLength] as [number, number, number],
    color: wall.childOverrides?.color,  // CHANGED: Allow undefined, don't flood with default
    opacity: wall.childOverrides?.opacity ?? undefined,
    meshPreset: wall.childOverrides?.meshPreset ?? undefined,

    // Pass the wallSegments for interior/exterior objects
    wallSegments: wall.wallSegments,

    // Also pass sidePadDivisor & manualOffsets so advanced logic can read them
    sidePadDivisor: wall.childOverrides?.sidePadDivisor ?? 10,
    manualOffsets: wall.childOverrides?.manualOffsets ?? [[0, 0], [0, 0]],
    
    // Pass molding thickness and vertical offset
    moldingThickness: wall.childOverrides?.moldingThickness ?? 0.25,
    verticalOffset: wall.childOverrides?.verticalOffset ?? 0,
  };
}

/**
 * computeFloor:
 *  Converts relative floor position to final world position
 */
function computeFloor(
  section: Section,
  floor: FloorSpec,
  roomOffset: [number, number, number]
) {
  const [secX, secY, secZ] = section.sectionPosition;
  const [roomOffsetX, roomOffsetY, roomOffsetZ] = roomOffset;
  const [relX, relY, relZ] = floor.position;

  const finalX = roomOffsetX + secX + relX;
  const finalY = roomOffsetY + secY + relY;
  const finalZ = roomOffsetZ + secZ + relZ;

  return {
    position: [finalX, finalY, finalZ] as [number, number, number],
    dimensions: floor.dimensions,
    color: floor.color,
    meshPreset: floor.meshPreset,
    verticalOffset: floor.verticalOffset,
  };
}

/**
 * computeStair:
 *  Converts relative stair position to final world position
 */
function computeStair(
  section: Section,
  stair: StairSpec,
  roomOffset: [number, number, number]
) {
  const [secX, secY, secZ] = section.sectionPosition;
  const [roomOffsetX, roomOffsetY, roomOffsetZ] = roomOffset;
  const [relX, relY, relZ] = stair.position;

  const finalX = roomOffsetX + secX + relX;
  const finalY = roomOffsetY + secY + relY;
  const finalZ = roomOffsetZ + secZ + relZ;

  return {
    position: [finalX, finalY, finalZ] as [number, number, number],
    dimensions: stair.dimensions,
    rotation: stair.rotation,
    color: stair.color,
    meshPreset: stair.meshPreset,
  };
}

const RoomConstructor = ({ sections }: RoomConstructorProps) => {
  const roomOffset: [number, number, number] = [0, 0, 0];
  
  // Build one array that has both geometry + segment data for walls
  const allWalls = sections.flatMap((section) => {
    if (section.walls && section.walls.length > 0) {
      return section.walls.map((wall) => computeWall(section, wall, roomOffset));
    }
    return [];
  });

  // Build floor objects
  const allFloors = sections.flatMap((section) => {
    if (section.floors && section.floors.length > 0) {
      return section.floors.map((floor) => computeFloor(section, floor, roomOffset));
    }
    return [];
  });

  // Build stair objects
  const allStairs = sections.flatMap((section) => {
    if (section.stairs && section.stairs.length > 0) {
      return section.stairs.map((stair) => computeStair(section, stair, roomOffset));
    }
    return [];
  });

  return (
    <group>
      {/* Render walls */}
      <WallConstructor wallInstancePropDicts={allWalls} />
      
      {/* Render floors */}
      {allFloors.length > 0 && (
        <FloorConstructor propObjects={allFloors} />
      )}
      
      {/* Render stairs */}
      {allStairs.length > 0 && (
        <StairConstructor propObjects={allStairs} />
      )}
    </group>
  );
};

export default RoomConstructor;