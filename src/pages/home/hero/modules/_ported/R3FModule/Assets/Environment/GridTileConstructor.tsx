import React from 'react';
import GeometryInstantiator from './GeometryInstantiator';
import EntityConstructor from '../Entities/SokobanEntities/EntityConstructor';
import { PropObject } from './PropObjectTypes';
import SlopeGeometryConstructor from './SlopeGeometryConstructor';
import { MeshCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SlopeDirection } from './SlopeGeometryConstructor';
// type SlopeDirection = 'NS' | 'SN' | 'EW' | 'WE' | 'NESW' | 'NWSE' | 'SWNE' | 'SENW';

export type CornerOffsets = {
  NE?: number; // Optional property
  NW?: number; // Optional property
  SE?: number; // Optional property
  SW?: number; // Optional property
};

interface GridTerrainTile {
  coords: [number, number];
  props: {
    elevationType: 'floor' | 'recess' | 'wall' | 'ceiling';
    presetConfigStr: string;
    slopeTuple?: [number, SlopeDirection, object | null]; // Angle and direction (e.g., [45, "NS"])
    selectable?: boolean;
    specialProps?: string[];
    initEntity?: string;
    slopeOffset?: number;
    // Renamed / new fields
    heightTopPos?: number;
    heightBotPos?: number;
  };
}

interface SlopeGeometryData {
  meshKey: string;
  position: [number, number, number];
  slopeParams: {
    angle: number;
    direction: SlopeDirection;
    height: number;
    top: number;
    bottom: number;
    color:string;
    cornerOffsets: CornerOffsets | null;
  };
}

interface GridTileConstructorProps {
  terrainData: string | GridTerrainTile[];
}

const TILE_PRESETS: Record<string, Omit<PropObject, 'key' | 'position' | 'args'>> = {
  stockbrick: { color: '#cbc3ad', opacity: 1, renderTopOnly: false, type: 'Static' },
  wood: { color: '#d3b199', opacity: 1, renderTopOnly: false, type: 'Static' },
  stone: { color: '#808080', opacity: 1, renderTopOnly: false, type: 'Static' },
  water: {
    color: '#0088dd',
    opacity: 0.6,
    renderTopOnly: true,
    type: 'Static',
    mass: 0,
    onCollide: (e) => console.log('Entity entered water:', e.entity),
  },
  grass: { color: '#4CAF50', opacity: 1, renderTopOnly: false, type: 'Static' },
  dirt: { color: '#8B4513', opacity: 1, renderTopOnly: false, type: 'Static' },
  default: { color: '#c0c0c0', opacity: 1, renderTopOnly: false, type: 'Static' },
};

const GridTileConstructor: React.FC<GridTileConstructorProps> = ({ terrainData }) => {
  /**
   * Optional global Y offset if your entire board is above/below the origin.
   */
  const stageGlobalY = -0.1875; 

  const parseTerrainData = (data: string | GridTerrainTile[]): GridTerrainTile[] => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse terrain JSON:', error);
        return [];
      }
    }
    return data;
  };

  const generatePropObjects = (
    tiles: GridTerrainTile[]
  ): { groupedProps: Record<string, PropObject[]>; slopeGeometries: SlopeGeometryData[] } => {
    const groupedProps: Record<string, PropObject[]> = {};
    const slopeGeometries: SlopeGeometryData[] = [];

    tiles.forEach((tile, index) => {
      const { coords, props } = tile;
      const {
        presetConfigStr,
        slopeTuple,
        selectable,
        specialProps,
        heightTopPos,
        heightBotPos,
      } = props;

      const preset = TILE_PRESETS[presetConfigStr] || TILE_PRESETS.default;

      // Safeguard against zero or negative "tileHeight"
      const rawHeight = heightTopPos - heightBotPos;
      // If top == bottom, fallback to 0.1
      const tileHeight = Math.abs(rawHeight) < 0.0001 ? 0.1 : Math.abs(rawHeight);

      // Midpoint for the geometry Y-position
      const tileMidY = ((heightTopPos + heightBotPos) / 2) + heightBotPos + stageGlobalY;

      const position: [number, number, number] = [coords[0], tileMidY, coords[1]];
      const slopedCoordPos : [number, number, number] = [coords[0]-.5, 0, coords[1]-.5];

      // const slopedTileYDelta = 0
      const slopedTileYDelta = slopeTuple !== undefined && slopeTuple[0] !== 0 ?  Math.floor(Math.tan(THREE.MathUtils.degToRad(slopeTuple[0])) / .25) * .25 : 0;
      // Build the propObject
      const propObject: PropObject = {
        key: `${presetConfigStr}-${index}`,
        position,
        args: [1, tileHeight, 1], // (width, height, depth)
        color: preset.color,
        opacity: preset.opacity,
        renderTopOnly: preset.renderTopOnly,
        type: preset.type,
        friction: preset.friction ?? 1,
        mass: preset.mass ?? 1,
        triggerOnly: preset.triggerOnly || false,
        onCollide: preset.onCollide,
        selectable,
        specialProps,
        // slopedTileYOffset: 0.1234,
        slopedTileYOffset: slopedTileYDelta || 0,
      };

      if (!groupedProps[presetConfigStr]) {
        groupedProps[presetConfigStr] = [];
      }
      groupedProps[presetConfigStr].push(propObject);

      // Handle slopes
      const isValidSlopeDirection = (dir: string): dir is SlopeDirection =>
        ['NS', 'SN', 'EW', 'WE', 'NESW', 'NWSE', 'SWNE', 'SENW', 'ENWS', 'WSEN', 'ESWN', 'WNES'].includes(dir);
      

      if (slopeTuple) {
        const [angle, direction] = slopeTuple;
        if (isValidSlopeDirection(direction)) {
          slopeGeometries.push({
            meshKey: `slope-${index}`,
            position: slopedCoordPos,
            slopeParams: {
              angle,
              direction,
              // Provide a "height" plus the top and bottom
              color: preset.color,
              height: heightTopPos,
              top: heightTopPos + stageGlobalY,
              bottom: heightBotPos + stageGlobalY,
              cornerOffsets: slopeTuple[2]
            },
          });
        }
      }
    });

    return { groupedProps, slopeGeometries };
  };

  const formattedTerrainData = parseTerrainData(terrainData);

  if (!formattedTerrainData || formattedTerrainData.length === 0) {
    console.error('No valid terrain data found.');
    return null;
  }

  const { groupedProps, slopeGeometries } = generatePropObjects(formattedTerrainData);

  /**
   * Place entities at the tile's midpoint by default.
   */
  const entities = formattedTerrainData
    .filter((tile) => !!tile.props.initEntity)
    .map((tile, i) => {
      const {
        heightTopPos = 1,
        heightBotPos = 0,
        initEntity,
      } = tile.props;

      // Midpoint
      const entityMidY = ((heightTopPos + heightBotPos) / 2) + heightBotPos + stageGlobalY;

      return {
        coords: tile.coords,
        initEntity: initEntity || 'defaultEntity',
        heightPos: entityMidY,
        tileIndex: i, // for debugging or reference
        heightScale: 1,
      };
    });

  return (
    <group>
      {Object.entries(groupedProps).map(([preset, propObjects]) => (
        <GeometryInstantiator key={preset} propObjects={propObjects} geometryType={''} />
      ))}
      {slopeGeometries.length > 0 && slopeGeometries?.map((slope) => (
          <RigidBody
          key={slope.meshKey}
          type="fixed" // Fixed means it won't move (good for static terrain)
          colliders={false} // Disable auto-generated colliders
          // contactSkin={.1}
          restitution={.1}
        >
          <MeshCollider type="trimesh" >
            <SlopeGeometryConstructor
              key={slope.meshKey}
              meshKey={slope.meshKey}
              position={slope.position}
              slopeParams={slope.slopeParams}
            />
            </MeshCollider>
          </RigidBody>
        
      ))}
      <EntityConstructor entities={entities} />
    </group>
  );
};

export default GridTileConstructor;
