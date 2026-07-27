// -----------------------------------------------------------------------------
// WallObjectLogic.tsx
//  - Houses all the "object placement" logic & the BasicPainting component
// -----------------------------------------------------------------------------
import React from 'react';
import { useTexture } from '@react-three/drei';
import CanvasCatalog from '../../../Helpers/CanvasCatalog';

//
// INTERFACES
//
export interface WallItem {
  position: [number, number, number];
  dimensions: [number, number, number];
  color?: string;
  wallSegments?: {
    intSegments?: number[];
    extSegments?: number[];
    interiorWallObjects?: WallObjectSpec[];
    exteriorWallObjects?: WallObjectSpec[];
  };
  sidePadDivisor?: number;
  manualOffsets?: [[number, number], [number, number]];
}

export interface WallObjectSpec {
  type: 'canvas' | 'other';
  scale?: number;
  objectParams: {
    imageId: string;
  };
  objectOffsets?: [number, number] | null;
}

//
// Re-usable utility
//
function sumArray(arr: number[] = []) {
  return arr.reduce((acc, n) => acc + n, 0);
}

//
// BasicPainting – EXACT code for your unique painting mesh,
// with the CanvasMethod to load a unique texture from CanvasCatalog.
//
export function BasicPainting({
  position,
  args,
  canvasCode,
  ...restProps
}: {
  position: [number, number, number];
  args: [number, number, number];
  canvasCode: string;
}) {
  function CanvasMethod() {
    const filename = './art/Firestore/' + CanvasCatalog[canvasCode].Filename;
    const CanvasPainting = useTexture({ map: filename });

    return (
      <mesh castShadow position={position} {...restProps}>
        <boxGeometry args={args} />
        <meshBasicMaterial {...CanvasPainting} toneMapped={false} />
      </mesh>
    );
  }

  return (
    <group>
      <CanvasMethod />
    </group>
  );
}

//
// objectPlacementCalculator – 
// Places a single "canvas" object on a given wall (interior or exterior) 
// and returns { frames, painting } so frames can be instanced, painting is unique.
//
export function objectPlacementCalculator(
  wallItem: WallItem, 
  object: WallObjectSpec, 
  oIndex: number,
  isInterior: boolean
) {
  // We'll accumulate these "frame" boxes for instancing
  const frames: Array<{
    position: [number, number, number];
    args: [number, number, number];
    color?: string;
  }> = [];

  // Single painting mesh (non-instanced)
  let painting: {
    position: [number, number, number];
    args: [number, number, number];
    canvasCode: string;
  } | null = null;

  // 1) Read segments from the wall
  const segments = isInterior 
    ? wallItem.wallSegments?.intSegments ?? [] 
    : wallItem.wallSegments?.extSegments ?? [];
  const segmentSum = sumArray(segments);
  if (segmentSum <= 0) return { frames, painting };

  // 2) Offsets
  const manualOffset = isInterior
    ? wallItem.manualOffsets?.[0] ?? [0, 0]
    : wallItem.manualOffsets?.[1] ?? [0, 0];
  const objOffset = object.objectOffsets ?? [0, 0];

  // 3) Basic dims from geometry
  const wallXLength = wallItem.dimensions[0];
  const wallHeight  = wallItem.dimensions[1];
  const wallZLength = wallItem.dimensions[2];

  const sidePadDivisor = wallItem.sidePadDivisor ?? 10;
  // orientation logic for walls
  const isWallXLonger = wallZLength < wallXLength;

  // whichever is the "horizontal" dimension:
  const wallLength = isWallXLonger ? wallXLength : wallZLength;
  const wallDepth  = isWallXLonger ? wallZLength : wallXLength;

  const parentHorizontalPos = isWallXLonger ? wallItem.position[0] : wallItem.position[2];
  const parentDepthPos      = isWallXLonger ? wallItem.position[2] : wallItem.position[0];

  const faceDirection = isInterior ? 1 : -1;

  // SHIFT LOGIC
  const shiftFromOrigin = -wallLength / 2 + wallLength / sidePadDivisor;
  const shiftIncrement =
    (wallLength * ((sidePadDivisor - 2) / sidePadDivisor)) / (2 * segmentSum);
  const shiftIteration = sumArray(segments.slice(0, oIndex)) * 2 + 1 * segments[oIndex];

  const totalHorizontalOffset = parentHorizontalPos + manualOffset[0] + objOffset[0];
  const totalVerticalOffset   = manualOffset[1] + objOffset[1];

  const horizontalPos = shiftFromOrigin + shiftIncrement * shiftIteration + totalHorizontalOffset;
  const verticalPos   = wallItem.position[1] + totalVerticalOffset;
  const depthPos      = (wallDepth / 2) * (1 / faceDirection) + parentDepthPos;

  // final position
  const v3Pos: [number, number, number] = isWallXLonger
    ? [horizontalPos, verticalPos, depthPos]
    : [depthPos, verticalPos, horizontalPos];

  // 4) Scale logic
  const imageId = object.objectParams.imageId;
  const catalogEntry = CanvasCatalog[imageId];
  if (!catalogEntry) {
    console.warn(`[WallObjectLogic] Missing imageId=${imageId} in CanvasCatalog`);
    return { frames, painting };
  }

  const { FHeight, FWidth } = catalogEntry;
  
  // Normalize wallDepth to standard reference (0.25 = typical wall thickness)
  // This prevents paintings from becoming huge when wall thickness varies
  const normalizedWallDepth = Math.min(wallDepth, 0.6) * (0.25 / 0.25); // Clamp and normalize
  
  const wallRatioMod =
    FHeight * (normalizedWallDepth / 2) < wallHeight / 2 - wallHeight / 10
      ? 1
      : wallHeight * 3;

  const horizontalScale =
    ((FWidth / 10000) * 5 * (object.scale ?? 1)) *
    (normalizedWallDepth * (segments[oIndex] / segmentSum) * wallRatioMod);
  const verticalScale =
    ((FHeight / 10000) * 5 * (object.scale ?? 1)) *
    (normalizedWallDepth * (segments[oIndex] / segmentSum) * wallRatioMod);
  const depthScale = 0.06725;

  const v3Scale: [number, number, number] = isWallXLonger
    ? [horizontalScale, verticalScale, depthScale]
    : [depthScale, verticalScale, horizontalScale];

  // 5) painting => one unique <BasicPainting> with a specific canvasCode
  painting = {
    position: v3Pos,
    args: v3Scale,
    canvasCode: imageId, 
  };

  // 6) frames => can be instanced
  const frameColor = '#666666';
  // top
  frames.push({
    position: [
      v3Pos[0],
      v3Pos[1] + v3Scale[1] / 2 + 0.03125,
      v3Pos[2],
    ],
    args: [
      v3Scale[0] + 0.03125,
      0.0625,
      v3Scale[2] + 0.03125,
    ],
    color: frameColor,
  });
  // bottom
  frames.push({
    position: [
      v3Pos[0],
      v3Pos[1] - v3Scale[1] / 2 - 0.03125,
      v3Pos[2],
    ],
    args: [
      v3Scale[0] + 0.03125,
      0.0625,
      v3Scale[2] + 0.03125,
    ],
    color: frameColor,
  });

  // left/right frames
  if (v3Scale[0] > v3Scale[2] && v3Scale[0] > v3Scale[1]) {
    // left
    frames.push({
      position: [v3Pos[0] - v3Scale[0] / 2 - 0.03125, v3Pos[1], v3Pos[2]],
      args: [0.0625, v3Scale[1] + 0.125, v3Scale[2] + 0.03125],
      color: frameColor,
    });
    // right
    frames.push({
      position: [v3Pos[0] + v3Scale[0] / 2 + 0.03125, v3Pos[1], v3Pos[2]],
      args: [0.0625, v3Scale[1] + 0.125, v3Scale[2] + 0.03125],
      color: frameColor,
    });
  }
  if (v3Scale[0] < v3Scale[2] && v3Scale[0] < v3Scale[1]) {
    // left
    frames.push({
      position: [v3Pos[0], v3Pos[1], v3Pos[2] - v3Scale[2] / 2 - 0.03125],
      args: [v3Scale[0] + 0.03125, v3Scale[1] + 0.125, 0.0625],
      color: frameColor,
    });
    // right
    frames.push({
      position: [v3Pos[0], v3Pos[1], v3Pos[2] + v3Scale[2] / 2 + 0.03125],
      args: [v3Scale[0] + 0.03125, v3Scale[1] + 0.125, 0.0625],
      color: frameColor,
    });
  }

  return { frames, painting };
}