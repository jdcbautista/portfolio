// SceneConstructor.tsx
import React from 'react';
import RoomConstructor from './RoomConstructor';
import meshPresetsData from './meshPresets.json';

// ==================== RAW BLENDER DATA TYPES ====================
interface BlenderObject {
  object?: string;  // Backwards compatibility
  entityName?: string;  // New format
  position: [number, number, number];          // Global position in Blender
  entityProps?: {  // New: wrapper for entity properties
    rawDimensions?: [number, number, number];
    scaledDimensions?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
    meshPreset?: string;
  };
  rawDimensions?: [number, number, number];     // Backwards compatibility
  scaledDimensions?: [number, number, number];  // Backwards compatibility
  scale?: [number, number, number];             // Backwards compatibility
  rotation?: [number, number, number];          // Backwards compatibility
  dimensions?: [number, number, number];        // Backwards compatibility
  childOverrides?: Record<string, any>;  // Unified overrides name
  wallMetadata?: Record<string, any>;
  wallObjects?: any;
  floorMetadata?: Record<string, any>;
  stairMetadata?: Record<string, any>;
}

interface GlobalOverrides {
  scenePosition?: [number, number, number];
  sceneRotation?: [number, number, number];
  wallMoldingThickness?: number;
  floorVerticalOffset?: number;
  wallVerticalOffset?: number;
  clampWallsToFloor?: boolean;
  clampWallsToFloorOffset?: number;
  meshPreset?: string;
  color?: string;
  opacity?: number;
  sidePadDivisor?: number;
  stairsOffset?: [number, number, number];
  floorsOffset?: [number, number, number];
}

interface SceneData {
  globalOverrides?: GlobalOverrides;
  Scenes?: {
    [sceneName: string]: {
      sceneOverrides?: any;
      Areas?: {
        [areaName: string]: any;
      };
    };
  };
  Areas?: {
    [areaName: string]: any;
  };
}

// ==================== CLEAN REACT DATA TYPES ====================
interface ReactObject {
  entityName: string;
  entityName?: string;
  globalPosition: [number, number, number];  // Blender world position converted to React coords
  worldDimensions: [number, number, number]; // Final dimensions after scale and rotation
  originalRotation: [number, number, number]; // Original Blender rotation (for reference)
  entityProps?: any;
  childOverrides?: any;
  wallObjects?: any;
  wallMetadata?: any;
  floorMetadata?: any;
  stairMetadata?: any;
}

interface SceneConstructorProps {
  sceneData: SceneData;
  metadataJson?: any; // gallery.json - dot notation for wall objects
  additionalSectionsJson?: any; // ogWalls.json - OLD flat sections format (appended)
  hierarchicalWallsJson?: any; // walls.json - NEW hierarchical format (merged)
  scenePosition?: [number, number, number];
  sceneRotation?: [number, number, number]; // In radians for Three.js
  sceneScale?: [number, number, number];
}

// Process scene data once on module load, not on every render
function processSceneData(sceneData: SceneData, metadataJson?: any, hierarchicalWallsJson?: any, additionalSectionsJson?: any) {
  /**
   * Processes curation JSON with object sets
   * New format: { "setName": { "wall": "Area.Room.Wall", "interior": [...], "exterior": [...] } }
   */
  const parseDotNotationOverrides = (dotNotationJson: any): any => {
    if (!dotNotationJson || typeof dotNotationJson !== 'object') return null;

    // console.log('[parseDotNotationOverrides] Processing dot notation JSON with keys:', Object.keys(dotNotationJson));

    const result: any = { Areas: {} };

    Object.entries(dotNotationJson).forEach(([setName, data]: [string, any]) => {
      // Skip comments
      if (setName.startsWith('_')) return;
      
      // console.log(`[parseDotNotationOverrides] Processing key: ${setName}`);
      
      // Check if this is an object set (has "wall" property)
      if (data && typeof data === 'object' && data.wall) {
        const wallPath = data.wall;
        const parts = wallPath.split('.');
        
        // console.log(`  Wall path: ${wallPath}, parts: ${parts.join(' / ')}`);
        
        // First 2 parts are Area.Room, everything else is the object name (handles Blender's .001, .002, etc)
        if (parts.length >= 3) {
          const areaName = parts[0];
          const roomName = parts[1];
          const objectName = parts.slice(2).join('.');
          
          // console.log(`  Parsed as: Area=${areaName}, Room=${roomName}, Object=${objectName}`);
          
          if (!result.Areas[areaName]) {
            result.Areas[areaName] = { Rooms: {} };
          }
          if (!result.Areas[areaName].Rooms) {
            result.Areas[areaName].Rooms = {};
          }
          if (!result.Areas[areaName].Rooms[roomName]) {
            result.Areas[areaName].Rooms[roomName] = {};
          }

          const objectType = 
            objectName.toLowerCase().includes('wall') ? 'Walls' :
            objectName.toLowerCase().includes('floor') ? 'Floors' :
            objectName.toLowerCase().includes('stair') ? 'Stairs' :
            'Other';

          // console.log(`  Object type: ${objectType}`);

          if (!result.Areas[areaName].Rooms[roomName][objectType]) {
            result.Areas[areaName].Rooms[roomName][objectType] = [];
          }

          result.Areas[areaName].Rooms[roomName][objectType].push({
            entityName: objectName,
            wallObjects: {
              interior: data.interior || [],
              exterior: data.exterior || []
            }
          });
          
          // console.log(`  Added to ${areaName}.Rooms.${roomName}.${objectType}[], interior: ${data.interior?.length || 0}, exterior: ${data.exterior?.length || 0}`);
        }
      }
      // Handle old dot notation format for backwards compatibility
      else {
        const parts = setName.split('.');
        
        if (parts.length === 1) {
          const [areaName] = parts;
          if (!result.Areas[areaName]) {
            result.Areas[areaName] = { areaOverrides: {}, Rooms: {} };
          }
          result.Areas[areaName].areaOverrides = { 
            ...result.Areas[areaName].areaOverrides, 
            ...data 
          };
        } 
        else if (parts.length === 2) {
          const [areaName, roomName] = parts;
          if (!result.Areas[areaName]) {
            result.Areas[areaName] = { Rooms: {} };
          }
          if (!result.Areas[areaName].Rooms) {
            result.Areas[areaName].Rooms = {};
          }
          if (!result.Areas[areaName].Rooms[roomName]) {
            result.Areas[areaName].Rooms[roomName] = { childOverrides: {} };
          }
          result.Areas[areaName].Rooms[roomName].childOverrides = {
            ...result.Areas[areaName].Rooms[roomName].childOverrides,
            ...data
          };
        }
        // Old dot notation format - first 2 parts are Area.Room, rest is object name
        else if (parts.length >= 3) {
          const areaName = parts[0];
          const roomName = parts[1];
          const objectName = parts.slice(2).join('.');
          
          if (!result.Areas[areaName]) {
            result.Areas[areaName] = { Rooms: {} };
          }
          if (!result.Areas[areaName].Rooms) {
            result.Areas[areaName].Rooms = {};
          }
          if (!result.Areas[areaName].Rooms[roomName]) {
            result.Areas[areaName].Rooms[roomName] = {};
          }

          const objectType = 
            objectName.toLowerCase().includes('wall') ? 'Walls' :
            objectName.toLowerCase().includes('floor') ? 'Floors' :
            objectName.toLowerCase().includes('stair') ? 'Stairs' :
            'Other';

          if (!result.Areas[areaName].Rooms[roomName][objectType]) {
            result.Areas[areaName].Rooms[roomName][objectType] = [];
          }

          if (data.interior || data.exterior) {
            result.Areas[areaName].Rooms[roomName][objectType].push({
              entityName: objectName,
              wallObjects: data
            });
          } else {
            result.Areas[areaName].Rooms[roomName][objectType].push({
              entityName: objectName,
              ...data
            });
          }
        }
      }
    });

    return result;
  };

  /**
   * Translates new wallObjects format to old wallSegments format
   * New format: { interior: [...], exterior: [...] }
   * Old format: { intSegments: [...], extSegments: [...], interiorWallObjects: [...], exteriorWallObjects: [...] }
   */
  const translateWallObjects = (wallObjects: any) => {
    if (!wallObjects || Object.keys(wallObjects).length === 0) {
      return {
        intSegments: [1],
        extSegments: [1],
        interiorWallObjects: [],
        exteriorWallObjects: []
      };
    }

    const interior = wallObjects.interior || [];
    const exterior = wallObjects.exterior || [];

    // Generate segments dynamically from objects, using segmentRatio if present
    const intSegments = interior.length > 0 
      ? interior.map((obj: any) => obj.segmentRatio ?? 1) 
      : [1];
    
    const extSegments = exterior.length > 0 
      ? exterior.map((obj: any) => obj.segmentRatio ?? 1) 
      : [1];

    return {
      intSegments,
      extSegments,
      interiorWallObjects: interior,
      exteriorWallObjects: exterior
    };
  };

  /**
   * Merges metadataJson into sceneData
   * Adds wallObjects, metadata, and overrides to the appropriate objects
   * Also merges full Blender object arrays (position, dimensions, etc.)
   */
  const mergeMetadata = (baseData: SceneData, metadata: any): SceneData => {
    if (!metadata || !metadata.Areas) return baseData;

    const merged = JSON.parse(JSON.stringify(baseData)); // Deep clone

    Object.entries(metadata.Areas).forEach(([areaName, areaMetadata]: [string, any]) => {
      // Create area if it doesn't exist
      if (!merged.Areas[areaName]) {
        // console.log(`[mergeMetadata] Creating new area: ${areaName}`);
        merged.Areas[areaName] = {
          areaMetadata: {},
          areaOverrides: {},
          Rooms: {}
        };
      }

      // Apply section-level metadata and overrides
      const area = merged.Areas[areaName];
      if (areaMetadata.areaMetadata) {
        area.areaMetadata = { ...area.areaMetadata, ...areaMetadata.areaMetadata };
      }
      if (areaMetadata.areaOverrides) {
        area.areaOverrides = { ...area.areaOverrides, ...areaMetadata.areaOverrides };
      }

      // Process rooms
      if (areaMetadata.Rooms) {
        // Ensure area has Rooms collection
        if (!area.Rooms) {
          area.Rooms = {};
        }

        // console.log(`[mergeMetadata] Merging ${areaName}, found ${Object.keys(areaMetadata.Rooms).length} rooms`);

        Object.entries(areaMetadata.Rooms).forEach(([roomName, metaRoom]: [string, any]) => {
          // console.log(`[mergeMetadata]   Processing room: ${roomName}`);
          
          // Create room if it doesn't exist
          if (!area.Rooms[roomName]) {
            // console.log(`[mergeMetadata]     Creating new room: ${roomName}`);
            area.Rooms[roomName] = {
              roomMetadata: {},
              childOverrides: {},
              Entities: {
                Walls: [],
                Floors: [],
                Stairs: []
              }
            };
          }

          const targetRoom = area.Rooms[roomName];
          
          // Ensure Entities exists (for backwards compatibility)
          if (!targetRoom.Entities) {
            targetRoom.Entities = {
              Walls: targetRoom.Entities.Walls || [],
              Floors: targetRoom.Entities.Floors || [],
              Stairs: targetRoom.Entities.Stairs || []
            };
          }

          // Apply room-level metadata and overrides
          if (metaRoom.roomMetadata) {
            targetRoom.roomMetadata = { ...targetRoom.roomMetadata, ...metaRoom.roomMetadata };
          }
          if (metaRoom.childOverrides) {
            targetRoom.childOverrides = { ...targetRoom.childOverrides, ...metaRoom.childOverrides };
          }

          // Merge wall objects by matching object names
          if (metaRoom.Walls) {
            if (!targetRoom.Entities.Walls) targetRoom.Entities.Walls = [];
            // console.log(`[mergeMetadata]     Merging ${metaRoom.Walls.length} walls from metadata`);
            
            metaRoom.Walls.forEach((metaWall: any) => {
              const targetWall = targetRoom.Entities.Walls.find((w: any) => w.entityName === metaWall.entityName);
              if (targetWall) {
                // Object exists - merge ALL data (metadata, overrides, AND Blender data)
                // console.log(`[mergeMetadata]       Found existing wall: ${metaWall.entityName}, merging ALL data`);
                
                // Merge Blender data (position, dimensions, rotation, scale)
                if (metaWall.position) targetWall.position = metaWall.position;
                if (metaWall.rawDimensions) targetWall.rawDimensions = metaWall.rawDimensions;
                if (metaWall.scaledDimensions) targetWall.scaledDimensions = metaWall.scaledDimensions;
                if (metaWall.dimensions) {
                  targetWall.rawDimensions = metaWall.dimensions;
                  targetWall.scaledDimensions = metaWall.dimensions;
                }
                if (metaWall.scale) targetWall.scale = metaWall.scale;
                if (metaWall.rotation) targetWall.rotation = metaWall.rotation;
                
                // Merge metadata and overrides
                targetWall.wallMetadata = { ...targetWall.wallMetadata, ...(metaWall.wallMetadata || {}) };
                targetWall.wallOverrides = { ...targetWall.wallOverrides, ...(metaWall.wallOverrides || {}) };
                targetWall.wallObjects = { ...targetWall.wallObjects, ...(metaWall.wallObjects || {}) };
                
                if (metaWall.wallObjects?.interior || metaWall.wallObjects?.exterior) {
                  // console.log(`[mergeMetadata]         Added ${metaWall.wallObjects.interior?.length || 0} interior, ${metaWall.wallObjects.exterior?.length || 0} exterior objects`);
                }
              } else {
                // Object doesn't exist - add it completely
                // console.log(`[mergeMetadata]       Adding new wall: ${metaWall.entityName}`);
                const newWall = {
                  entityName: metaWall.entityName,
                  position: metaWall.position || [0, 0, 0],
                  rawDimensions: metaWall.rawDimensions || metaWall.dimensions || [10, 3, 0.6],
                  scaledDimensions: metaWall.scaledDimensions || metaWall.dimensions || [10, 3, 0.6],
                  scale: metaWall.scale || [1, 1, 1],
                  rotation: metaWall.rotation || [0, 0, 0],
                  wallMetadata: metaWall.wallMetadata || {},
                  wallOverrides: metaWall.wallOverrides || {},
                  wallObjects: metaWall.wallObjects || {},
                  objectOverrides: metaWall.objectOverrides || {},
                  _createdFromMetadata: true
                };
                targetRoom.Entities.Walls.push(newWall);
              }
            });
          }

          // Merge floor objects by matching object names
          if (metaRoom.Floors) {
            if (!targetRoom.Entities.Floors) targetRoom.Entities.Floors = [];
            // console.log(`[mergeMetadata]     Merging ${metaRoom.Floors.length} floors from metadata`);
            
            metaRoom.Floors.forEach((metaFloor: any) => {
              const targetFloor = targetRoom.Entities.Floors.find((f: any) => f.entityName === metaFloor.entityName);
              if (targetFloor) {
                // Object exists - merge ALL data
                // console.log(`[mergeMetadata]       Found existing floor: ${metaFloor.entityName}, merging ALL data`);
                
                // Merge Blender data
                if (metaFloor.position) targetFloor.position = metaFloor.position;
                if (metaFloor.rawDimensions) targetFloor.rawDimensions = metaFloor.rawDimensions;
                if (metaFloor.scaledDimensions) targetFloor.scaledDimensions = metaFloor.scaledDimensions;
                if (metaFloor.dimensions) {
                  targetFloor.rawDimensions = metaFloor.dimensions;
                  targetFloor.scaledDimensions = metaFloor.dimensions;
                }
                if (metaFloor.scale) targetFloor.scale = metaFloor.scale;
                if (metaFloor.rotation) targetFloor.rotation = metaFloor.rotation;
                
                // Merge metadata and overrides
                targetFloor.floorMetadata = { ...targetFloor.floorMetadata, ...(metaFloor.floorMetadata || {}) };
                targetFloor.floorOverrides = { ...targetFloor.floorOverrides, ...(metaFloor.floorOverrides || {}) };
              } else {
                // Object doesn't exist - add it completely
                // console.log(`[mergeMetadata]       Adding new floor: ${metaFloor.entityName}`);
                const newFloor = {
                  entityName: metaFloor.entityName,
                  position: metaFloor.position || [0, 0, 0],
                  rawDimensions: metaFloor.rawDimensions || metaFloor.dimensions || [10, 0.5, 10],
                  scaledDimensions: metaFloor.scaledDimensions || metaFloor.dimensions || [10, 0.5, 10],
                  scale: metaFloor.scale || [1, 1, 1],
                  rotation: metaFloor.rotation || [0, 0, 0],
                  floorMetadata: metaFloor.floorMetadata || {},
                  floorOverrides: metaFloor.floorOverrides || {},
                  objectOverrides: metaFloor.objectOverrides || {},
                  _createdFromMetadata: true
                };
                targetRoom.Entities.Floors.push(newFloor);
              }
            });
          }

          // Merge stair objects by matching object names
          if (metaRoom.Stairs) {
            if (!targetRoom.Entities.Stairs) targetRoom.Entities.Stairs = [];
            // console.log(`[mergeMetadata]     Merging ${metaRoom.Stairs.length} stairs from metadata`);
            
            metaRoom.Stairs.forEach((metaStair: any) => {
              const targetStair = targetRoom.Entities.Stairs.find((s: any) => s.entityName === metaStair.entityName);
              if (targetStair) {
                // Object exists - merge ALL data
                // console.log(`[mergeMetadata]       Found existing stair: ${metaStair.entityName}, merging ALL data`);
                
                // Merge Blender data
                if (metaStair.position) targetStair.position = metaStair.position;
                if (metaStair.rawDimensions) targetStair.rawDimensions = metaStair.rawDimensions;
                if (metaStair.scaledDimensions) targetStair.scaledDimensions = metaStair.scaledDimensions;
                if (metaStair.dimensions) {
                  targetStair.rawDimensions = metaStair.dimensions;
                  targetStair.scaledDimensions = metaStair.dimensions;
                }
                if (metaStair.scale) targetStair.scale = metaStair.scale;
                if (metaStair.rotation) targetStair.rotation = metaStair.rotation;
                
                // Merge metadata and overrides
                targetStair.stairMetadata = { ...targetStair.stairMetadata, ...(metaStair.stairMetadata || {}) };
                targetStair.stairOverrides = { ...targetStair.stairOverrides, ...(metaStair.stairOverrides || {}) };
              } else {
                // Object doesn't exist - add it completely
                // console.log(`[mergeMetadata]       Adding new stair: ${metaStair.entityName}`);
                const newStair = {
                  entityName: metaStair.entityName,
                  position: metaStair.position || [0, 0, 0],
                  rawDimensions: metaStair.rawDimensions || metaStair.dimensions || [5, 3, 5],
                  scaledDimensions: metaStair.scaledDimensions || metaStair.dimensions || [5, 3, 5],
                  scale: metaStair.scale || [1, 1, 1],
                  rotation: metaStair.rotation || [30, 0, 0],
                  stairMetadata: metaStair.stairMetadata || {},
                  stairOverrides: metaStair.stairOverrides || {},
                  objectOverrides: metaStair.objectOverrides || {},
                  _createdFromMetadata: true
                };
                targetRoom.Entities.Stairs.push(newStair);
              }
            });
          }
        });
      }
    });

    return merged;
  };

  const DEFAULTS = {
    colors: {
      // wall: '#ddeeff',
      floor: '#888888', 
      ceiling: '#ffffff',
      construct: '#666666',
      model: '#ff6600',
      railings: '#333333',
      doors: '#8B4513',
      windows: '#87CEEB',
      furniture: '#D2691E',
      decorations: '#FFD700',
      stairs: '#B8860B',
      fallback: '#999999'
    },
    physics: {
      wall: { type: 'Static' as const, mass: 0, friction: 0.7 },
      floor: { type: 'Static' as const, mass: 0, friction: 0.9 },
      ceiling: { type: 'Static' as const, mass: 0, friction: 0.5 },
      construct: { type: 'Static' as const, mass: 10, friction: 0.8 },
      model: { type: 'Dynamic' as const, mass: 1, friction: 0.5 },
      railings: { type: 'Static' as const, mass: 5, friction: 0.6 },
      doors: { type: 'Static' as const, mass: 3, friction: 0.6 },
      windows: { type: 'Static' as const, mass: 2, friction: 0.6 },
      furniture: { type: 'Static' as const, mass: 8, friction: 0.6 },
      decorations: { type: 'Static' as const, mass: 1, friction: 0.6 },
      stairs: { type: 'Static' as const, mass: 5, friction: 0.8 },
      fallback: { type: 'Static' as const, mass: 2, friction: 0.6 }
    },
    properties: {
      wall: { opacity: 1.0, renderTopOnly: false, selectable: false, triggerOnly: false },
      floor: { opacity: 1.0, renderTopOnly: true, selectable: false, triggerOnly: false },
      ceiling: { opacity: 1.0, renderTopOnly: false, selectable: false, triggerOnly: false },
      construct: { opacity: 1.0, renderTopOnly: false, selectable: true, triggerOnly: false },
      model: { opacity: 1.0, renderTopOnly: false, selectable: true, triggerOnly: false },
      stairs: { opacity: 1.0, renderTopOnly: false, selectable: false, triggerOnly: false },
      fallback: { opacity: 1.0, renderTopOnly: false, selectable: true, triggerOnly: false }
    }
  };

  // Parse dot notation overrides if provided, then merge with any nested metadata
  let finalMetadata = metadataJson;
  if (metadataJson && !metadataJson.Areas) {
    // If metadataJson doesn't have "Areas" key, assume it's dot notation format
    finalMetadata = parseDotNotationOverrides(metadataJson);
  }
  
  // Merge metadata into scene data
  let mergedSceneData = finalMetadata ? mergeMetadata(sceneData, finalMetadata) : sceneData;
  // console.log('[processSceneData] After metadata merge, areas:', Object.keys(mergedSceneData.Areas || {}));
  
  // Merge hierarchicalWallsJson (walls.json) if provided
  if (hierarchicalWallsJson && (hierarchicalWallsJson.Scenes || hierarchicalWallsJson.Areas)) {
    // console.log('[processSceneData] Merging hierarchical walls JSON');
    
    // Unwrap Scenes if present (same logic as main component)
    let hierarchicalData = hierarchicalWallsJson;
    if (hierarchicalData.Scenes && !hierarchicalData.Areas) {
      const firstSceneKey = Object.keys(hierarchicalData.Scenes)[0];
      if (firstSceneKey) {
        const firstScene = hierarchicalData.Scenes[firstSceneKey];
        hierarchicalData = {
          globalOverrides: {
            ...hierarchicalData.globalOverrides,
            ...firstScene.sceneOverrides
          },
          Areas: firstScene.Areas || {}
        };
      }
    }
    
    mergedSceneData = mergeMetadata(mergedSceneData, hierarchicalData);
    // console.log('[processSceneData] After hierarchical merge, areas:', Object.keys(mergedSceneData.Areas || {}));
  }

  const getDefaults = (objectType: string) => {
    const typeKey = objectType.toLowerCase() as keyof typeof DEFAULTS.physics;
    return {
      physics: DEFAULTS.physics[typeKey] || DEFAULTS.physics.fallback,
      props: DEFAULTS.properties[typeKey] || DEFAULTS.properties.fallback,
      color: DEFAULTS.colors[typeKey as keyof typeof DEFAULTS.colors] || DEFAULTS.colors.fallback
    };
  };

  /**
   * Convert Blender raw data to clean React data
   * 1. Use scaledDimensions (already includes scale)
   * 2. Apply rotation to dimensions if needed
   * 3. Convert coordinate system from Blender to React Three Fiber
   */
  const convertBlenderToReact = (blenderObj: BlenderObject): ReactObject => {
    // Defensive checks for data structure with DEFAULTS, not errors
    const objectName = blenderObj?.entityName || blenderObj?.object || 'UNNAMED_OBJECT';
    
    if (!blenderObj || typeof blenderObj !== 'object') {
      console.warn(`[convertBlenderToReact] Invalid blenderObj for ${objectName}, using defaults`);
      return {
        entityName: objectName,
        globalPosition: [0, 0, 0],
        worldDimensions: [1, 1, 1],
        originalRotation: [0, 0, 0],
        entityProps: (blenderObj as any)?.entityProps,
        childOverrides: (blenderObj as any)?.childOverrides,
        wallObjects: (blenderObj as any)?.wallObjects,
        wallMetadata: (blenderObj as any)?.wallMetadata,
        floorMetadata: (blenderObj as any)?.floorMetadata,
        stairMetadata: (blenderObj as any)?.stairMetadata
      } as ReactObject;
    }
    
    // Read from entityProps if present, otherwise fall back to direct properties
    const entityProps = blenderObj.entityProps || {};
    
    // Use defaults if missing - priority: entityProps > direct properties > defaults
    const position = blenderObj.position && Array.isArray(blenderObj.position) ? blenderObj.position : [0, 0, 0];
    const dimensions = entityProps.scaledDimensions || blenderObj.scaledDimensions || (blenderObj as any).dimensions || entityProps.rawDimensions || blenderObj.rawDimensions || [1, 1, 1];
    const rotation = entityProps.rotation || (blenderObj.rotation && Array.isArray(blenderObj.rotation) ? blenderObj.rotation as [number, number, number] : [0, 0, 0]);
    
    // console.log(`[convertBlenderToReact] ${objectName}:`);
    // console.log(`  position: [${position.map((v: number) => v?.toFixed?.(2) || v).join(', ')}]`);
    // console.log(`  dimensions: [${dimensions.map((v: number) => v?.toFixed?.(2) || v).join(', ')}]`);
    // console.log(`  rotation: [${rotation.map((v: number) => v?.toFixed?.(2) || v).join(', ')}]`);
    
    const [bx, by, bz] = position;
    const [dimX, dimY, dimZ] = dimensions;
    const [rotX, rotY, rotZ] = rotation; // In degrees
    
    // // console.log(`\n=== Converting ${objectName} ===`);
    // // console.log(`  Blender scaled dimensions: [${dimX}, ${dimY}, ${dimZ}]`);
    // // console.log(`  Blender rotation (deg): [${rotX}°, ${rotY}°, ${rotZ}°]`);
    // // console.log(`  Blender position: [${bx}, ${by}, ${bz}]`);
    
    // Step 1: Handle rotation (swap dimensions if rotated 90° around Z)
    let blenderWorldX = dimX;
    let blenderWorldY = dimY;
    let blenderWorldZ = dimZ;
    
    const rotZNormalized = Math.abs(rotZ % 360);
    if (rotZNormalized > 45 && rotZNormalized < 135) {
      // // console.log(`  Applying ~90° Z rotation: swapping X and Y`);
      [blenderWorldX, blenderWorldY] = [blenderWorldY, blenderWorldX];
    } else if (rotZNormalized > 225 && rotZNormalized < 315) {
      // // console.log(`  Applying ~270° Z rotation: swapping X and Y`);
      [blenderWorldX, blenderWorldY] = [blenderWorldY, blenderWorldX];
    }
    
    // // console.log(`  After rotation: [${blenderWorldX.toFixed(2)}, ${blenderWorldY.toFixed(2)}, ${blenderWorldZ.toFixed(2)}]`);
    
    // Step 2: Convert coordinate system
    // Blender: X=right, Y=forward, Z=up
    // React Three Fiber: X=right, Y=up, Z=forward
    // Conversion: React = [Blender.X, Blender.Z, Blender.Y]
    // NEGATING X to flip left/right
    
    const reactGlobalPos: [number, number, number] = [-bx, bz, by];
    const reactWorldDims: [number, number, number] = [blenderWorldX, blenderWorldZ, blenderWorldY];
    
    // // console.log(`  React global position: [${reactGlobalPos[0].toFixed(2)}, ${reactGlobalPos[1].toFixed(2)}, ${reactGlobalPos[2].toFixed(2)}]`);
    // // console.log(`  React world dimensions: [${reactWorldDims[0].toFixed(2)}, ${reactWorldDims[1].toFixed(2)}, ${reactWorldDims[2].toFixed(2)}]`);
    
    const hasWallObjects = (blenderObj as any).wallObjects && 
      ((blenderObj as any).wallObjects.interior?.length > 0 || (blenderObj as any).wallObjects.exterior?.length > 0);
    
    // if (hasWallObjects) {
    //   console.log(`[convertBlenderToReact] ${objectName} has wallObjects:`, {
    //     interior: (blenderObj as any).wallObjects.interior?.length || 0,
    //     exterior: (blenderObj as any).wallObjects.exterior?.length || 0
    //   });
    // }
    
    return {
      entityName: objectName,
      globalPosition: reactGlobalPos,
      worldDimensions: reactWorldDims,
      originalRotation: [rotX, rotY, rotZ],
      // Preserve entityProps and childOverrides
      ...blenderObj.entityProps && { entityProps: blenderObj.entityProps },
      ...blenderObj.childOverrides && { childOverrides: blenderObj.childOverrides },
      // Preserve wallObjects and metadata
      ...(blenderObj as any).wallObjects && { wallObjects: (blenderObj as any).wallObjects },
      ...(blenderObj as any).wallMetadata && { wallMetadata: (blenderObj as any).wallMetadata },
      ...(blenderObj as any).floorMetadata && { floorMetadata: (blenderObj as any).floorMetadata },
      ...(blenderObj as any).stairMetadata && { stairMetadata: (blenderObj as any).stairMetadata }
    };
  };

  const determineWallOrientations = (walls: ReactObject[]) => {
    // console.log(`\n=== Determining wall orientations for ${walls.length} walls ===`);
    
    // Walls are classified by which SIDE of the room they're on
    // East/West walls: run North-South (long axis is Z), facades face East-West
    // North/South walls: run East-West (long axis is X), facades face North-South
    
    const eastWestSideWalls: Array<{wall: ReactObject, index: number}> = [];
    const northSouthSideWalls: Array<{wall: ReactObject, index: number}> = [];
    
    walls.forEach((wall, index) => {
      const [width, height, depth] = wall.worldDimensions; // React X, Y, Z
      // // console.log(`\nWall ${index} (${wall.entityName}):`);
      // // console.log(`  Position: [${wall.globalPosition[0].toFixed(2)}, ${wall.globalPosition[1].toFixed(2)}, ${wall.globalPosition[2].toFixed(2)}]`);
      // // console.log(`  Dimensions: [${width.toFixed(2)}, ${height.toFixed(2)}, ${depth.toFixed(2)}]`);
      
      // Compare width (X) vs depth (Z) to determine orientation
      if (depth > width) {
        // // console.log(`  → Long axis is Z (${depth.toFixed(2)} > ${width.toFixed(2)})`);
        // // console.log(`  → Runs North-South, on East or West side`);
        eastWestSideWalls.push({wall, index});
      } else {
        // // console.log(`  → Long axis is X (${width.toFixed(2)} > ${depth.toFixed(2)})`);
        // // console.log(`  → Runs East-West, on North or South side`);
        northSouthSideWalls.push({wall, index});
      }
    });
    
    const orientations: string[] = new Array(walls.length).fill('unknown');
    
    // For walls on East/West sides (running N-S), use X position to determine East vs West
    if (eastWestSideWalls.length > 0) {
      const xPositions = eastWestSideWalls.map(w => w.wall.globalPosition[0]);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      
      // // console.log(`\nEast/West side walls - X range: [${minX.toFixed(2)}, ${maxX.toFixed(2)}]`);
      
      eastWestSideWalls.forEach(({wall, index}) => {
        const x = wall.globalPosition[0];
        if (eastWestSideWalls.length === 1) {
          orientations[index] = x > 0 ? 'east' : 'west';
        } else {
          // Closer to minX = west side, closer to maxX = east side
          orientations[index] = Math.abs(x - minX) < Math.abs(x - maxX) ? 'west' : 'east';
        }
        // // console.log(`  ${wall.entityName} at X=${x.toFixed(2)} → ${orientations[index]}`);
      });
    }
    
    // For walls on North/South sides (running E-W), use Z position to determine North vs South
    if (northSouthSideWalls.length > 0) {
      const zPositions = northSouthSideWalls.map(w => w.wall.globalPosition[2]);
      const minZ = Math.min(...zPositions);
      const maxZ = Math.max(...zPositions);
      
      // // console.log(`\nNorth/South side walls - Z range: [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
      
      northSouthSideWalls.forEach(({wall, index}) => {
        const z = wall.globalPosition[2];
        if (northSouthSideWalls.length === 1) {
          orientations[index] = z > 0 ? 'north' : 'south';
        } else {
          // Closer to minZ = south side, closer to maxZ = north side
          orientations[index] = Math.abs(z - minZ) < Math.abs(z - maxZ) ? 'south' : 'north';
        }
        // // console.log(`  ${wall.entityName} at Z=${z.toFixed(2)} → ${orientations[index]}`);
      });
    }
    
    // // console.log(`\nFinal orientations: ${orientations.join(', ')}`);
    return orientations;
  };

  const calculateRoomBounds = (walls: ReactObject[]) => {
    if (walls.length === 0) {
      return { 
        dimensions: [10, 3, 10] as [number, number, number], 
        position: [0, 0, 0] as [number, number, number] 
      };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity; 
    let minZ = Infinity, maxZ = -Infinity;
    
    // // console.log(`\n=== Calculating room bounds from ${walls.length} walls ===`);
    
    walls.forEach((wall, i) => {
      const [x, y, z] = wall.globalPosition;
      const [w, h, d] = wall.worldDimensions;
      
      const wallMinX = x - w/2;
      const wallMaxX = x + w/2;
      const wallMinY = y - h/2;
      const wallMaxY = y + h/2;
      const wallMinZ = z - d/2;
      const wallMaxZ = z + d/2;
      
      // // console.log(`Wall ${i}: X[${wallMinX.toFixed(2)} to ${wallMaxX.toFixed(2)}], Z[${wallMinZ.toFixed(2)} to ${wallMaxZ.toFixed(2)}]`);
      
      minX = Math.min(minX, wallMinX);
      maxX = Math.max(maxX, wallMaxX);
      minY = Math.min(minY, wallMinY);
      maxY = Math.max(maxY, wallMaxY);
      minZ = Math.min(minZ, wallMinZ);
      maxZ = Math.max(maxZ, wallMaxZ);
    });

    // // console.log(`Overall bounds: X[${minX.toFixed(2)} to ${maxX.toFixed(2)}], Y[${minY.toFixed(2)} to ${maxY.toFixed(2)}], Z[${minZ.toFixed(2)} to ${maxZ.toFixed(2)}]`);

    const outerWidth = maxX - minX;
    const outerHeight = maxY - minY;
    const outerDepth = maxZ - minZ;
    
    // // console.log(`Outer dimensions: [${outerWidth.toFixed(2)}, ${outerHeight.toFixed(2)}, ${outerDepth.toFixed(2)}]`);
    
    // Estimate wall thickness
    const wallThickness = Math.min(...walls.map(w => Math.min(w.worldDimensions[0], w.worldDimensions[2])));
    // // console.log(`Estimated wall thickness: ${wallThickness.toFixed(2)}`);
    
    const innerWidth = outerWidth - wallThickness;
    const innerHeight = outerHeight;
    const innerDepth = outerDepth - wallThickness;
    
    const sectionCenter: [number, number, number] = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    ];
    
    const sectionDimensions: [number, number, number] = [
      innerWidth,
      innerHeight,
      innerDepth
    ];

    // // console.log(`Section center (global): [${sectionCenter.map(c => c.toFixed(2)).join(', ')}]`);
    // // console.log(`Section inner dimensions: [${sectionDimensions.map(d => d.toFixed(2)).join(', ')}]`);

    return { 
      dimensions: sectionDimensions, 
      position: sectionCenter,
      wallThickness
    };
  };

const processWalls = (
    walls: ReactObject[], 
    floors: ReactObject[],
    sectionCenter: [number, number, number], 
    globalOverrides?: any,
    childOverrides?: any,
    areaOverrides?: any
  ) => {
    const orientations = determineWallOrientations(walls);
    
    return walls.map((wall, index) => {
      // Convert from global to relative position
      let relativePosition: [number, number, number] = [
        wall.globalPosition[0] - sectionCenter[0],
        wall.globalPosition[1] - sectionCenter[1],
        wall.globalPosition[2] - sectionCenter[2]
      ];
      
      // Get wall-specific data from metadata (if it was merged in)
      const wallData = (wall as any).wallObjects || {};
      const wallMetadata = (wall as any).wallMetadata || {};
      const wallOverridesFromMeta = (wall as any).wallOverrides || {};
      
      // Check clampWallsToFloor with priority: wall > room > section > global
      const clampWallsToFloor = 
        wallOverridesFromMeta.clampWallsToFloor ??
        childOverrides?.clampWallsToFloor ?? 
        areaOverrides?.clampWallsToFloor ?? 
        globalOverrides?.clampWallsToFloor ?? 
        false;
      
      const clampWallsToFloorOffset = 
        wallOverridesFromMeta.clampWallsToFloorOffset ??
        childOverrides?.clampWallsToFloorOffset ?? 
        areaOverrides?.clampWallsToFloorOffset ?? 
        globalOverrides?.clampWallsToFloorOffset ?? 
        0;
      
      // If clampWallsToFloor is true, calculate Y position based on floor
      if (clampWallsToFloor && floors.length > 0) {
        const floor = floors[0];
        const floorGlobalY = floor.globalPosition[1];
        const floorHeight = floor.worldDimensions[1];
        const wallHeight = wall.worldDimensions[1];
        
        const newGlobalY = floorGlobalY + floorHeight / 2 + wallHeight / 2 + clampWallsToFloorOffset;
        relativePosition[1] = newGlobalY - sectionCenter[1];
      }
      
      // Translate new wallObjects format to old wallSegments format
      const wallSegments = translateWallObjects(wallData);
      
      // Read entityProps if present
      const entityProps = (wall as any).entityProps || {};
      const entityChildOverrides = (wall as any).childOverrides || {};
      
      // Check for meshPreset: entityProps > entity childOverrides > room childOverrides > area > global
      const meshPreset = 
        entityProps.meshPreset ??
        (wall as any).meshPreset ??
        entityChildOverrides.meshPreset ??
        wallOverridesFromMeta.meshPreset ?? 
        childOverrides?.meshPreset ?? 
        areaOverrides?.meshPreset ?? 
        globalOverrides?.meshPreset ?? 
        undefined;
      
      // Get preset properties if meshPreset is set
      const WALL_PRESETS = (meshPresetsData as any).wallPresets || {};
      const presetProps = meshPreset ? (WALL_PRESETS[meshPreset] || {}) : {};
      
      // Color precedence: entity > room > area > global > preset > defaults
      const finalColor = 
        (wall as any).color || 
        entityChildOverrides.color ||
        wallOverridesFromMeta.color || 
        childOverrides?.color ||
        areaOverrides?.color ||
        globalOverrides?.color ||
        presetProps.color ||
        getDefaults('wall').color;
      
      // Opacity precedence: explicit overrides > preset > 1.0
      const finalOpacity = 
        (wall as any).opacity ??
        entityChildOverrides.opacity ??
        wallOverridesFromMeta.opacity ?? 
        childOverrides?.opacity ?? 
        areaOverrides?.opacity ?? 
        globalOverrides?.opacity ?? 
        presetProps.opacity ??
        1.0;
      
      // console.log(`[SC-Wall] ${wall.object} preset=${meshPreset || 'default'} color=${finalColor || 'from-preset'} opacity=${finalOpacity || 'default'}`);
      
      return {
        wid: index + 1,
        wallType: orientations[index] as 'north' | 'south' | 'east' | 'west',
        relativePosition: relativePosition,
        wallMetadata: wallMetadata,
        wallSegments: wallSegments,
        childOverrides: {
          dimensions: wall.worldDimensions,
          color: finalColor,
          opacity: finalOpacity,
          meshPreset: meshPreset,
          sidePadDivisor: entityChildOverrides.sidePadDivisor ?? wallOverridesFromMeta.sidePadDivisor ?? childOverrides?.sidePadDivisor ?? 30,
          manualOffsets: entityChildOverrides.manualOffsets ?? wallOverridesFromMeta.manualOffsets ?? childOverrides?.manualOffsets ?? [[0, 0], [0, 0]],
          moldingThickness: wallOverridesFromMeta.moldingThickness ?? globalOverrides?.wallMoldingThickness ?? 0.25,
          verticalOffset: wallOverridesFromMeta.verticalOffset ?? globalOverrides?.wallVerticalOffset ?? 0,
        },
      };
    });
  };

  const processFloors = (
    floors: ReactObject[], 
    sectionCenter: [number, number, number], 
    globalOverrides?: any,
    childOverrides?: any,
    areaOverrides?: any
  ) => {
    const FLOOR_PRESETS = (meshPresetsData as any).floorPresets || {};
    
    return floors.map(floor => {
      // Read entityProps if present
      const entityProps = (floor as any).entityProps || {};
      const entityChildOverrides = (floor as any).childOverrides || {};
      
      // Get meshPreset: entityProps > entity childOverrides > room > area > global
      const meshPreset = 
        entityProps.meshPreset ??
        (floor as any).meshPreset ??
        entityChildOverrides.meshPreset ?? 
        childOverrides?.meshPreset ?? 
        areaOverrides?.meshPreset ?? 
        globalOverrides?.meshPreset ?? 
        undefined;
      
      // Get preset properties
      const presetProps = meshPreset ? (FLOOR_PRESETS[meshPreset] || {}) : {};
      
      // Color with preset support
      const finalColor = 
        entityChildOverrides.color || 
        presetProps.color ||
        getDefaults('floor').color;
      
      // Calculate offset with priority: entity > room > section > global
      const floorsOffset = 
        entityChildOverrides.floorsOffset || 
        childOverrides?.floorsOffset || 
        areaOverrides?.floorsOffset || 
        globalOverrides?.floorsOffset || 
        [0, 0, 0];
      
      // Convert from global to relative position
      const relativePosition: [number, number, number] = [
        floor.globalPosition[0] - sectionCenter[0] + floorsOffset[0],
        floor.globalPosition[1] - sectionCenter[1] + floorsOffset[1],
        floor.globalPosition[2] - sectionCenter[2] + floorsOffset[2]
      ];
      
      return {
        key: `floor-${floor.object}`,
        position: relativePosition,
        dimensions: floor.worldDimensions,
        color: finalColor,
        meshPreset: meshPreset,
        verticalOffset: globalOverrides?.floorVerticalOffset ?? 0,
      };
    });
  };

  const processStairs = (
    stairs: ReactObject[], 
    sectionCenter: [number, number, number],
    globalOverrides?: any,
    childOverrides?: any,
    areaOverrides?: any
  ) => {
    const STAIR_PRESETS = (meshPresetsData as any).stairPresets || {};
    
    return stairs.map(stair => {
      // Read entityProps if present
      const entityProps = (stair as any).entityProps || {};
      const entityChildOverrides = (stair as any).childOverrides || {};
      
      // Get meshPreset: entityProps > entity childOverrides > room > area > global
      const meshPreset = 
        entityProps.meshPreset ??
        (stair as any).meshPreset ??
        entityChildOverrides.meshPreset ?? 
        childOverrides?.meshPreset ?? 
        areaOverrides?.meshPreset ?? 
        globalOverrides?.meshPreset ?? 
        undefined;
      
      // Get preset properties
      const presetProps = meshPreset ? (STAIR_PRESETS[meshPreset] || {}) : {};
      
      // Color with preset support
      const finalColor = 
        entityChildOverrides.color || 
        presetProps.color ||
        getDefaults('stair').color;
      
      // Calculate offset with priority: entity > room > section > global
      const stairsOffset = 
        entityChildOverrides.stairsOffset || 
        childOverrides?.stairsOffset || 
        areaOverrides?.stairsOffset || 
        globalOverrides?.stairsOffset || 
        [0, 0, 0];
      
      // Convert from global to relative position and apply offset
      const relativePosition: [number, number, number] = [
        stair.globalPosition[0] - sectionCenter[0] + stairsOffset[0],
        stair.globalPosition[1] - sectionCenter[1] + stairsOffset[1],
        stair.globalPosition[2] - sectionCenter[2] + stairsOffset[2]
      ];
      
      return {
        position: relativePosition,
        dimensions: stair.worldDimensions,
        rotation: stair.originalRotation,
        color: finalColor,
        meshPreset: meshPreset,
      };
    });
  };

  const processSceneToSections = () => {
    // console.log('[processSceneToSections] ========== STARTING SECTION PROCESSING ==========');
    // console.log('[processSceneToSections] mergedSceneData.Areas:', Object.keys(mergedSceneData.Areas || {}));
    
    const sections: any[] = [];
    let sectionId = 0;

    Object.entries(mergedSceneData.Areas || {}).forEach(([areaName, areaData]) => {
      // console.log(`\n[processSceneToSections] Processing Area: ${areaName}`);
      
      // Extract section-level overrides
      const areaOverrides = (areaData as any).areaOverrides || {};
      // console.log(`[processSceneToSections]   areaOverrides:`, areaOverrides);
      
      // Collect ALL floors in this area for clampWallsToFloor
      const allAreaFloors: ReactObject[] = [];
      
      Object.entries(areaData).forEach(([roomCollectionKey, roomCollection]: [string, any]) => {
        if (roomCollectionKey.startsWith('Rooms')) {
          Object.entries(roomCollection).forEach(([roomName, roomData]: [string, any]) => {
            Object.entries(roomData).forEach(([roomKey, roomValue]: [string, any]) => {
              // Check for Entities wrapper
              if (roomKey === 'Entities' && typeof roomValue === 'object') {
                Object.entries(roomValue).forEach(([objectTypeKey, objectArray]: [string, any]) => {
                  if (Array.isArray(objectArray) && objectTypeKey.toLowerCase().includes('floor')) {
                    const convertedFloors = objectArray.map(convertBlenderToReact);
                    allAreaFloors.push(...convertedFloors);
                  }
                });
              }
              // Fallback: also check for direct arrays (backwards compatibility)
              else if (Array.isArray(roomValue) && roomKey.toLowerCase().includes('floor')) {
                const convertedFloors = roomValue.map(convertBlenderToReact);
                allAreaFloors.push(...convertedFloors);
              }
            });
          });
        }
      });
      
      Object.entries(areaData).forEach(([roomCollectionKey, roomCollection]: [string, any]) => {
        if (roomCollectionKey.startsWith('Rooms')) {
          // console.log(`[processSceneToSections]   Found Rooms collection with ${Object.keys(roomCollection).length} rooms`);
          
          Object.entries(roomCollection).forEach(([roomName, roomData]: [string, any]) => {
            // console.log(`[processSceneToSections]     Processing Room: ${roomName}`);
            
            // Extract room-level overrides
            const childOverrides = (roomData as any).childOverrides || {};
            
            const wallArrays: ReactObject[] = [];
            const floorArrays: ReactObject[] = [];
            const stairArrays: ReactObject[] = [];

            Object.entries(roomData).forEach(([roomKey, roomValue]: [string, any]) => {
              // Check for Entities wrapper
              if (roomKey === 'Entities' && typeof roomValue === 'object') {
                Object.entries(roomValue).forEach(([objectTypeKey, objectArray]: [string, any]) => {
                  if (Array.isArray(objectArray)) {
                    const convertedObjects = objectArray.map(convertBlenderToReact);
                    
                    if (objectTypeKey.toLowerCase().includes('wall')) {
                      wallArrays.push(...convertedObjects);
                    } else if (objectTypeKey.toLowerCase().includes('floor')) {
                      floorArrays.push(...convertedObjects);
                    } else if (objectTypeKey.toLowerCase().includes('stair')) {
                      stairArrays.push(...convertedObjects);
                    }
                  }
                });
              }
              // Fallback: also check for direct arrays (backwards compatibility)
              else if (Array.isArray(roomValue)) {
                const convertedObjects = roomValue.map(convertBlenderToReact);
                
                if (roomKey.toLowerCase().includes('wall')) {
                  wallArrays.push(...convertedObjects);
                } else if (roomKey.toLowerCase().includes('floor')) {
                  floorArrays.push(...convertedObjects);
                } else if (roomKey.toLowerCase().includes('stair')) {
                  stairArrays.push(...convertedObjects);
                }
              }
            });

            if (wallArrays.length === 0 && floorArrays.length === 0 && stairArrays.length === 0) {
              return;
            }
            
            // Calculate bounds from walls if available, otherwise use default or floor bounds
            const { dimensions, position, wallThickness } = wallArrays.length > 0 
              ? calculateRoomBounds(wallArrays)
              : {
                  dimensions: [10, 3, 10] as [number, number, number],
                  position: [0, 0, 0] as [number, number, number],
                  wallThickness: 0.6
                };

            const section = {
              sid: sectionId++,
              description: `${areaName} - ${roomName}`,
              sectionDimensions: dimensions,
              sectionPosition: position,
              sectionColor: '#ffffff',
              wallThickness: wallThickness || 0.6,
              floors: processFloors(floorArrays, position, mergedSceneData.globalOverrides, childOverrides, areaOverrides),
              // Pass ALL area floors so clampWallsToFloor works even if this room has no floors
              walls: processWalls(wallArrays, allAreaFloors, position, mergedSceneData.globalOverrides, childOverrides, areaOverrides),
              stairs: processStairs(stairArrays, position, mergedSceneData.globalOverrides, childOverrides, areaOverrides),
              planes: [],
            };
            
            sections.push(section);
          });
        } else if (Array.isArray(roomCollection)) {
          // Handle direct arrays (e.g., AreaExteriorFrontEntrance)
          const stairObjects = roomCollection
            .filter(obj => obj.entityName && obj.entityName.toLowerCase().includes('stair'))
            .map(convertBlenderToReact);
          
          if (stairObjects.length > 0) {
            const centerPos: [number, number, number] = [0, 0, 0];
            const section = {
              sid: sectionId++,
              description: `${areaName} - Direct Objects`,
              sectionDimensions: [10, 10, 10] as [number, number, number],
              sectionPosition: centerPos,
              sectionColor: '#ffffff',
              wallThickness: 0.6,
              floors: [],
              walls: [],
              stairs: processStairs(stairObjects, centerPos, mergedSceneData.globalOverrides, {}, areaOverrides),
              planes: [],
            };
            sections.push(section);
          }
        }
      });
    });

    // console.log(`[SC] Sections: ${sections.length} | ${JSON.stringify(sections.map(s => ({desc: s.description, walls: s.walls.length, floors: s.floors.length})))}`);

    return sections;
  };

  const baseSections = processSceneToSections().filter(section => 
    (section.walls && section.walls.length > 0) || 
    (section.floors && section.floors.length > 0) ||
    (section.stairs && section.stairs.length > 0)
  );

  // console.log(`[processSceneData] After filtering, ${baseSections.length} non-empty sections remain`);

  // Append old flat format sections if provided (for backward compatibility with ogWalls.json)
  if (additionalSectionsJson && additionalSectionsJson.sections) {
    // console.log('[processSceneData] Appending flat sections from additionalSectionsJson');
    return [...baseSections, ...additionalSectionsJson.sections];
  }

  // console.log(`[processSceneData] Returning ${baseSections.length} sections`);
  return baseSections;
}

// Cache for processed scene data - now includes both sceneData and metadataJson
const processedScenesCache = new Map<string, any[]>();

export default function SceneConstructor({ 
  sceneData,
  metadataJson,
  additionalSectionsJson,
  hierarchicalWallsJson,
  scenePosition = [0, 0, 0],
  sceneRotation = [0, 0, 0],
  sceneScale = [1, 1, 1]
}: SceneConstructorProps) {
  
  // If no sceneData but hierarchicalWallsJson provided, use hierarchicalWallsJson as sceneData
  let actualSceneData = sceneData;
  if (!actualSceneData && hierarchicalWallsJson) {
    // console.log('[SceneConstructor] Using hierarchicalWallsJson as sceneData');
    actualSceneData = hierarchicalWallsJson;
  }
  
  if (!actualSceneData) {
    console.warn('No scene data provided');
    return <group />;
  }

  // Handle Scenes wrapper - extract Areas from first scene if wrapped
  if (actualSceneData.Scenes && !actualSceneData.Areas) {
    const firstSceneKey = Object.keys(actualSceneData.Scenes)[0];
    if (firstSceneKey) {
      const firstScene = actualSceneData.Scenes[firstSceneKey];
      const sceneOverrides = firstScene.sceneOverrides || {};
      actualSceneData = { 
        globalOverrides: {
          ...actualSceneData.globalOverrides,
          ...sceneOverrides
        },
        Areas: firstScene.Areas || {} 
      };
    }
  }

  if (!actualSceneData.Areas || Object.keys(actualSceneData.Areas).length === 0) {
    console.warn('No Areas found in scene data');
    return <group />;
  }

  // Extract global overrides from actualSceneData if they exist
  const globalOverrides = actualSceneData.globalOverrides || {};
  
  // Use globalOverrides if props weren't provided
  const finalPosition = scenePosition[0] !== 0 || scenePosition[1] !== 0 || scenePosition[2] !== 0
    ? scenePosition 
    : (globalOverrides.scenePosition || [0, 0, 0]) as [number, number, number];
  
  // Convert rotation from degrees to radians if coming from globalOverrides
  let finalRotation: [number, number, number];
  if (sceneRotation[0] !== 0 || sceneRotation[1] !== 0 || sceneRotation[2] !== 0) {
    finalRotation = sceneRotation;
  } else if (globalOverrides.sceneRotation) {
    const degRotation = globalOverrides.sceneRotation as [number, number, number];
    finalRotation = [
      degRotation[0] * Math.PI / 180,
      degRotation[1] * Math.PI / 180,
      degRotation[2] * Math.PI / 180
    ];
  } else {
    finalRotation = [0, 0, 0];
  }

  // // console.log('[SceneConstructor] Final scene transform:', {
  //   position: finalPosition,
  //   rotation: finalRotation,
  //   rotationDegrees: finalRotation.map(r => r * 180 / Math.PI)
  // });

  // Create cache key from all JSONs
  const cacheKey = JSON.stringify({ 
    sceneData: actualSceneData, 
    metadataJson, 
    hierarchicalWallsJson: (sceneData ? hierarchicalWallsJson : null), // Don't include if used as sceneData
    additionalSectionsJson 
  });
  
  // Get or create processed sections - cached by combined key
  if (!processedScenesCache.has(cacheKey)) {
    // If hierarchicalWallsJson was used as sceneData, don't merge it again
    const wallsToMerge = sceneData ? hierarchicalWallsJson : null;
    processedScenesCache.set(cacheKey, processSceneData(actualSceneData, metadataJson, wallsToMerge, additionalSectionsJson));
  }
  const sections = processedScenesCache.get(cacheKey)!;

  // // console.log(`[SceneConstructor] Rendering ${sections.length} sections`);

  if (sections.length === 0) {
    return <group />;
  }

  return (
    <group 
      position={finalPosition} 
      rotation={finalRotation}
      scale={sceneScale}
    >
      <RoomConstructor sections={sections} />
    </group>
  );
}