import React from 'react';
import WallConstructor from './WallConstructor';

// Types for your data structures:
interface WallSpec {
  wid: number;
  wallType: 'north' | 'south' | 'east' | 'west';
  wallSegments?: {
    intSegments?: number[];
    extSegments?: number[];
    interiorWallObjects?: any[]; 
    exteriorWallObjects?: any[];
  };
  childOverrides?: {
    dimensions?: [number, number, number];
    color?: string | null;
    sidePadDivisor?: number | null;
    manualOffsets?: number[][];
  };
}

interface Section {
  sid: number;
  description?: string;
  sectionDimensions: [number, number, number]; // [width, height, length]
  sectionPosition: [number, number, number];   // center point
  sectionColor?: string;
  wallThickness?: number;
  walls: WallSpec[];
  planes?: any[]; // optional
}

interface OgRoomConstructorProps {
  sections: Section[];
}

/**
 * computeWall:
 *  1) Figures out final position/dimensions for each wall
 *  2) Also attaches the `wallSegments` data so that WallConstructor
 *     can see interior/exterior objects for that same wall.
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

  const baseColor = '#ddeeff'; // default color
  let wallXLength: number;
  let wallZLength: number;

  if (wall.wallType === 'north' || wall.wallType === 'south') {
    wallXLength = secWidth;
    wallZLength = thickness;
  } else {
    wallXLength = thickness;
    wallZLength = secLength;
  }
  let wallHeight = secHeight;

  if (wall.childOverrides?.dimensions) {
    const [ox, oy, oz] = wall.childOverrides.dimensions;
    if (ox > 0) wallXLength = ox;
    if (oy > 0) wallHeight = oy;
    if (oz > 0) wallZLength = oz;
  }

  let finalX = roomOffsetX + secX;
  let finalY = roomOffsetY + secY;
  let finalZ = roomOffsetZ + secZ;

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
  finalY += wallHeight / 2;

  // Return geometry + attach segments/overrides for use by WallConstructor
  return {
    position: [finalX, finalY, finalZ] as [number, number, number],
    dimensions: [wallXLength, wallHeight, wallZLength] as [number, number, number],
    color: wall.childOverrides?.color || baseColor,

    // Pass the wallSegments for interior/exterior objects
    wallSegments: wall.wallSegments,

    // Also pass sidePadDivisor & manualOffsets so advanced logic can read them
    sidePadDivisor: wall.childOverrides?.sidePadDivisor ?? 10,
    manualOffsets: wall.childOverrides?.manualOffsets ?? [[0, 0], [0, 0]],
  };
}

const OgRoomConstructor = ({ sections }: OgRoomConstructorProps) => {
  const roomOffset: [number, number, number] = [0, 0, 0];

  // Build one array that has both geometry + segment data
  const allWalls = sections.flatMap((section) => {
    if (section.walls && section.walls.length > 0) {
      return section.walls.map((wall) => computeWall(section, wall, roomOffset));
    }
    return [];
  });

  return (
    <group>
      {/* We pass `allWalls` to WallConstructor. It has both geometry + wallSegments. */}
      <WallConstructor wallInstancePropDicts={allWalls} />
    </group>
  );
};

export default OgRoomConstructor;
