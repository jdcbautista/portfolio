// WallConstructor.tsx
import GeometryInstantiator from './GeometryInstantiator';
import { PropObject } from './PropObjectTypes';
import meshPresetsData from './meshPresets.json';

import {
  WallObjectSpec,
  BasicPainting,
  objectPlacementCalculator
} from '../Entities/GalleryEntities/WallCanvasObject';

// Import wall presets from JSON with type assertion
const WALL_PRESETS = meshPresetsData.wallPresets as Record<string, Omit<PropObject, 'key' | 'position' | 'args'>>;

interface WallItem {
  position: [number, number, number];
  dimensions: [number, number, number];
  color?: string;
  opacity?: number;
  meshPreset?: string;
  childOverrides?: Record<string, any>;  // CHANGED from wallOverrides
  wallSegments?: {
    intSegments?: number[];
    extSegments?: number[];
    interiorWallObjects?: WallObjectSpec[];
    exteriorWallObjects?: WallObjectSpec[];
  };
  sidePadDivisor?: number;
  manualOffsets?: [[number, number], [number, number]];
  moldingThickness?: number;
  verticalOffset?: number;
}

interface WallConstructorProps {
  wallInstancePropDicts: WallItem[];
  centerYPosition?: boolean;
}

export default function WallConstructor({ wallInstancePropDicts, centerYPosition = false }: WallConstructorProps) {
  // Group walls by preset (similar to GridTileConstructor)
  const groupedWalls: Record<string, PropObject[]> = {};
  const frameInstances: PropObject[] = [];
  const paintingElements: JSX.Element[] = [];

  // console.log(`[WC] Processing ${wallInstancePropDicts.length} walls`);

  // Process each wall
  wallInstancePropDicts.forEach((item, wallIndex) => {
    const moldingThickness = item.moldingThickness ?? 0.125;
    const verticalOffset = item.verticalOffset ?? 0;
    const wallY = item.position[1] + (centerYPosition ? item.dimensions[1] / 2 : 0) + verticalOffset;
    const wallBottom = wallY - item.dimensions[1] / 2;
    const moldingY = wallBottom + moldingThickness;

    // Determine preset - use 'meshPreset' if provided, otherwise 'default'
    const wallPreset = item.meshPreset || 'default';
    const moldingPreset = 'molding';
    
    // Get preset properties
    const wallPresetProps = WALL_PRESETS[wallPreset] || WALL_PRESETS.default;
    const moldingPresetProps = WALL_PRESETS[moldingPreset];

    // Initialize groups if needed
    if (!groupedWalls[moldingPreset]) {
      groupedWalls[moldingPreset] = [];
    }
    if (!groupedWalls[wallPreset]) {
      groupedWalls[wallPreset] = [];
    }

    // Add molding with preset properties
    groupedWalls[moldingPreset].push({
      key: `molding-${wallIndex}`,
      position: [item.position[0], moldingY, item.position[2]],
      args: [
        item.dimensions[0] + moldingThickness * 2,
        moldingThickness,
        item.dimensions[2] + moldingThickness * 2,
      ],
      ...moldingPresetProps,
    });

    // Add main wall - override preset color/opacity if explicitly provided
    groupedWalls[wallPreset].push({
      key: `wall-${wallIndex}`,
      position: [item.position[0], wallY, item.position[2]],
      args: item.dimensions,
      ...wallPresetProps,
      // Allow explicit overrides - if color is undefined, use preset color
      color: item.color !== undefined ? item.color : wallPresetProps.color,
      opacity: item.opacity !== undefined ? item.opacity : wallPresetProps.opacity,
    });

    // console.log(`[WC-Wall] ${wallIndex} preset=${wallPreset} finalColor=${item.color !== undefined ? item.color : wallPresetProps.color}`);


    // Process wall segments (frames and paintings)
    const segments = item.wallSegments;
    if (!segments) return;

    // Interior objects
    const { interiorWallObjects, intSegments } = segments;
    if (interiorWallObjects && intSegments?.length) {
      interiorWallObjects.forEach((obj, objIndex) => {
        const { frames, painting } = objectPlacementCalculator(item, obj, objIndex, true);

        frames.forEach((framePiece, fIndex) => {
          frameInstances.push({
            key: `frame-int-${wallIndex}-${objIndex}-${fIndex}`,
            position: framePiece.position,
            args: framePiece.args,
            color: framePiece.color ?? '#666666',
            slopedTileYOffset: 0
          });
        });

        if (painting) {
          paintingElements.push(
            <BasicPainting
              key={`painting-int-${wallIndex}-${objIndex}`}
              position={painting.position}
              args={painting.args}
              canvasCode={painting.canvasCode}
            />
          );
        }
      });
    }

    // Exterior objects
    const { exteriorWallObjects, extSegments } = segments;
    if (exteriorWallObjects && extSegments?.length) {
      exteriorWallObjects.forEach((obj, objIndex) => {
        const { frames, painting } = objectPlacementCalculator(item, obj, objIndex, false);

        frames.forEach((framePiece, fIndex) => {
          frameInstances.push({
            key: `frame-ext-${wallIndex}-${objIndex}-${fIndex}`,
            position: framePiece.position,
            args: framePiece.args,
            color: framePiece.color ?? '#666666',
            slopedTileYOffset: 0
          });
        });

        if (painting) {
          paintingElements.push(
            <BasicPainting
              key={`painting-ext-${wallIndex}-${objIndex}`}
              position={painting.position}
              args={painting.args}
              canvasCode={painting.canvasCode}
            />
          );
        }
      });
    }
  });

  // console.log(`[WC] Grouped walls:`, JSON.stringify(Object.entries(groupedWalls).map(([preset, walls]) => ({preset, count: walls.length}))));

  return (
    <group>
      {/* Render walls grouped by preset - each preset gets its own instanced mesh */}
      {Object.entries(groupedWalls).map(([preset, propObjects]) => (
        <GeometryInstantiator 
          key={`walls-${preset}`}
          geometryType="box" 
          propObjects={propObjects} 
        />
      ))}

      {/* Paintings */}
      {paintingElements}
      
      {/* Frames */}
      {frameInstances.length > 0 && (
        <GeometryInstantiator geometryType="box" propObjects={frameInstances} />
      )}
    </group>
  );
}