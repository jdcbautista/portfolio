// import { Sky } from '@react-three/drei';
// import * as THREE from 'three';
// import { Physics, RigidBody, Rapier } from '@react-three/rapier'

// import BasicBox from '../../../../R3FModule/Archive/3D-AssetComponents/BasicBox.tsx';
// import BasicGlass from '../../../../R3FModule/Archive/3D-AssetComponents/BasicGlass.tsx';
// import BasicPyramid from '../../../../R3FModule/Archive/3D-AssetComponents/BasicPyramid.tsx';
// import BasicRoom from '../../../../R3FModule/Archive/3D-AssetComponents/BasicRoom.tsx';
// import AdvancedRoom from '../../../../R3FModule/Archive/3D-AssetComponents/AdvancedRoom.tsx';
// import StageModelImport from '../../../../R3FModule/Assets/Models/StageModelLoader.tsx';
// import CanvasController from '../../../../R3FModule/Globals/Components/CanvasComponent.tsx';
// import SceneConstructor from '../Assets/Environment/SceneConstructor.tsx';
// import SkyBox from '../Globals/Skybox.tsx';
// import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// Depth = North to South
// Width = East to West
// import DevTerrainScene from './scenes/DevTerrainScene.tsx';
// import { ReactNode } from 'react';
import RoomConstructor from '../../../../R3FModule/Assets/Environment/RoomConstructor.tsx';
import OgRoomConstructor from '../../../../R3FModule/Assets/Environment/OgRoomConstructor.tsx';
import { useThree, useFrame } from '@react-three/fiber';
import SceneConstructor from '../../../../R3FModule/Assets/Environment/SceneConstructor.tsx';
import scenetest from './scenetest.json';
import gallery from './gallery.json';
import hwallsJson from './hWalls.json';
import ogwallsJson from './ogWalls.json';
import React, { useEffect } from 'react';
import CanvasComponent from '../../../../R3FModule/Globals/Components/CanvasComponent.tsx';
import { useEventController } from '../../../../R3FModule/Globals/EventController.tsx';
import { useTrackController } from '../../../../R3FModule/Camera/TrackController.tsx';
// function ArtGalleryCanvas(): ReactNode {
export function DebugStats() {
  const { gl } = useThree();
  
  useFrame(() => {
    // Log every 60 frames to avoid spam
    if (gl.info.render.frame % 60 === 0) {
      console.log('Renderer Info:', {
        calls: gl.info.render.calls,        // Draw calls
        triangles: gl.info.render.triangles, // Total triangles/polygons
        points: gl.info.render.points,
        lines: gl.info.render.lines,
        geometries: gl.info.memory.geometries, // Unique geometries
        textures: gl.info.memory.textures,     // Unique textures
      });
    }
  });
  
  return null;
}

const ArtGalleryCanvas: React.FC = () => {
  // const api = useContext(PhysicsContext);
  

  const { createSequence
    // , playSequence
  } = useTrackController();
  const {requestAction} = useEventController()
  
  const InitActions = () => {
    requestAction("playSequence", true)
  }

  const InitValues = () => {
    console.log("INITIALIZE REQUEST")
    requestAction("initializeValues", {
      cameraMode: "track",
      trackCursorPosition: [0, 5, 0],
      cursorRotation: [Math.atan(-1 / Math.sqrt(2)), Math.PI / 4, 0],
      shouldReset: true,
      updateCameraPosition: [0,10,0],
      updateCameraRotation: [0, 0, 0,],
      projectionType: "perpsective",
    });
    InitActions()
  };

  useEffect(() => {
    // Initialize a sample sequence
    const sampleSequence = {
      sequenceID: 1,
      sequenceName: 'Sample Sequence',
      nodeArray: [
        { nodeID: 1, nodeRotation: [0,0,0], nodePosition: [0, 0, 0], nodeConfig: {transitionDuration: 5}},
        { nodeID: 1, nodeRotation: [0,0,0], nodePosition: [-15, 5, -25], nodeConfig: {transitionDuration: 5}},
        { nodeID: 2, nodeRotation: [0,0,0], nodePosition: [10, 5, -25], nodeConfig: {transitionDuration: 0}},
        { nodeID: 3, nodeRotation: [0,0,0], nodePosition: [0, 8, -25], nodeConfig: {transitionDuration: 5}},
        { nodeID: 4, nodeRotation: [0,0,0], nodePosition: [0, 8, -50], nodeConfig: {transitionDuration: 0}},
      ],
      sequenceConfig: { circular: true },
    };

    createSequence(sampleSequence);
    InitValues()

    // requestAction("isPlaying", true)
    
    // playSequence();

    // Cleanup if necessary
    // return () => {
    //   // Add any cleanup logic here
    // };
  }, []);

    
  // useEffect(()=> {
  //   InitValues()
  // },[])

  return (
    // <group>
    <div>
    <CanvasComponent characterStartPos={[-1.75, 0, -2]} >
      <DebugStats />
      <SceneConstructor 
        sceneData={scenetest} 
        metadataJson={gallery}
        // additionalSectionsJson={ogwallsJson}
        hierarchicalWallsJson={hwallsJson}
        />
      
      {/* <OgRoomConstructor
        sections={[
          {
            sid: 0,
            description: 'Stairs And Stuff',
            sectionDimensions: [10.5, 3, 10], // width, height, length
            sectionPosition: [-1.76, .725, -34.75],
            sectionColor: '#ffffff',
            floors:[],
            wallThickness: 0,
            walls: [],
            planes: [],
          },
          {
            sid: 1,
            description: 'Main Central Gallery Wall',
            sectionDimensions: [10.5, 3, 10], // width, height, length
            sectionPosition: [-1.76, .725, -34.75],
            sectionColor: '#ffffff',
            wallThickness: 0.6,
            walls: [
              {
                wid: 1,
                wallType: 'north',
                wallSegments: {
                  intSegments:[1,1], extSegments:[1,1],
                  interiorWallObjects:[
                    {type:"canvas", objectParams:{imageId:"1503"}, objectOffsets: null , scale:1.33},
                    {type:"canvas", objectParams:{imageId:"1728"}, objectOffsets: null , scale:1.33}
                  ],
                  exteriorWallObjects: [
                    {type:"canvas", objectParams:{imageId:"1525"}, objectOffsets: null , scale:1.33},
                    {type:"canvas", objectParams:{imageId:"1524"}, objectOffsets: null , scale:1.33}
                  ]
                },
                wallOverrides: {
                  dimensions: [0, 0, 0], // 0 => no override
                  color: null,
                  sidePadDivisor: 30,
                  manualOffsets: [
                    [0, 0],
                    [0, 0],
                  ],
                },
              },
              // {
              //   wid: 2,
              //   wallType: 'north',
              //   wallSegments: {

              //   },
              //   wallOverrides: {
              //     dimensions: [0, 0, 0], // 0 => no override
              //     color: null,
              //     sidePadDivisor: 30,
              //     manualOffsets: [
              //       [0, 0],
              //       [0, 0],
              //     ],
              //   },
              // },
              // etc.
            ],
            planes: [],
          },
          {
            sid: 2,
            description: 'Main Central Gallery Entrance',
            sectionDimensions: [16.35, 3, 5.25], // width, height, length
            sectionPosition: [-1.75, .725,-31.275],
            sectionColor: '#ffffff',
            wallThickness: 0.8,
            walls: [
              {
                wid: 1,
                wallType: 'east',
                wallSegments: {
                  interior: {
                    collectionName: null,
                    wallObjects: [
                      { type: "canvas",
                        name: null,
                        weight: 1,
                        objectParams:{},
                        offsets: [],
                        scale: [],
                      },
                      { type: "canvas",
                        name: null,
                        weight: 1,
                        objectParams:{},
                        offsets: [],
                        scale: [],
                      },
                    ],
                    // segmentRatios: [] // Moved to 'wallObjects[n].weight' property
                  },
                  exterior: {
                    collectionName: null,
                    wallObjects: [],
                  }
                },
                wallOverrides: {
                  dimensions: [0, 0, 0], // 0 => no override
                  color: null,
                  sidePadDivisor: null,
                  manualOffsets: [
                    [0, 0],
                    [0,0],
                  ],
                },
              },
              {
                wid: 1,
                wallType: 'west',
                wallSegments: {
                  interior: {
                    collectionName: null,
                    wallObjects: [
                      { type: "canvas",
                        name: null,
                        weight: 1,
                        objectParams:{},
                        offsets: [],
                        scale: [],
                      },
                      { type: "canvas",
                        name: null,
                        weight: 1,
                        objectParams:{},
                        offsets: [],
                        scale: [],
                      },
                    ],
                    // segmentRatios: [] // Moved to 'wallObjects[n].weight' property
                  },
                  exterior: {
                    collectionName: null,
                    wallObjects: [],
                  }
                },
                wallOverrides: {
                  dimensions: [0, 0, 0], // 0 => no override
                  color: null,
                  sidePadDivisor: null,
                  manualOffsets: [
                    [0, 0],
                    [-.33,0],
                  ],
                },
              },
              // {
              //   wid: 2,
              //   wallType: 'north',
              //   wallSegments: {

              //   },
              //   wallOverrides: {
              //     dimensions: [0, 0, 0], // 0 => no override
              //     color: null,
              //     sidePadDivisor: 30,
              //     manualOffsets: [
              //       [0, 0],
              //       [0, 0],
              //     ],
              //   },
              // },
              // etc.
            ],
            planes: [],
          },
        ]}
      /> */}

      {/* <RoomConstructor
  sections={[
          {
            sid: 1,
            description: 'Main Central Gallery Wall',
            sectionDimensions: [10.5, 3, 10], // width, height, length
            sectionPosition: [-1.76, .725, -34.75],
            sectionColor: '#ffffff',
            wallThickness: 0.6,
            walls: [
              {
                wid: 1,
                wallType: 'north',
                // wallSegments: {
                //   // intSegments:[1,1], extSegments:[1,1],
                //   // interiorWallObjects:[
                //   //   {type:"canvas", objectParams:{imageId:"1503"}, objectOffsets: null , scale:1.33},
                //   //   {type:"canvas", objectParams:{imageId:"1728"}, objectOffsets: null , scale:1.33}
                //   // ],
                //   // exteriorWallObjects: [
                //   //   {type:"canvas", objectParams:{imageId:"1525"}, objectOffsets: null , scale:1.33},
                //   //   {type:"canvas", objectParams:{imageId:"1524"}, objectOffsets: null , scale:1.33}
                //   // ]
                // },
                // wallOverrides: {
                //   dimensions: [0, 0, 0], // 0 => no override
                //   color: null,
                //   sidePadDivisor: 30,
                //   manualOffsets: [
                //     [0, 0],
                //     [0, 0],
                //   ],
                // },
              },

            ],
            // planes: [],
          },
  ]}
/> */}
{/* 
<RoomConstructor
  sections={[
    // {
    //   sid: 0,
    //   description: 'AreaAtrium - RoomAtriumCenter',
    //   sectionDimensions: [109.1447, 38.7728, 6.7871],
    //   sectionPosition: [0.3542, 53.6458, 2.8997],
    //   sectionColor: '#ffffff',
    //   wallThickness: 0.6,
    //   walls: [],
    //   floors: [
    //     {
    //       key: 'floor-Floor.002',
    //       position: [0.0, 42.0122, 1.3448],
    //       args: [109.1447, 38.7728, 0.7922],
    //       color: '#888888',
    //     }
    //   ],
    //   planes: [],
    // },
    {
      sid: 1,
      description: 'AreaAtrium - RoomAtriumWest',
      sectionDimensions: [29.5, 27, 9],
      sectionPosition: [-1, .725, -34.75],
      sectionColor: '#ffffff',
      wallThickness: 0.6,
      walls: [
        {
          wid: 1,
          wallType: 'west',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [1.054, 27.03, 5.5616],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 2,
          wallType: 'south',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [29.4495, 0.6518, 8.9507],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 3,
          wallType: 'east',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [22.1454, 1.054, 5.3197],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 4,
          wallType: 'north',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [22.1454, 1.054, 5.3197],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 5,
          wallType: 'north',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [1.054, 22.1454, 5.3197],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        }
      ],
      floors: [],
      planes: [],
    },
    {
      sid: 2,
      description: 'AreaAtrium - RoomAtriumEast',
      sectionDimensions: [31.6216, 27.03, 8.9507],
      sectionPosition: [37.4007, 44.58, 5.9175],
      sectionColor: '#ffffff',
      wallThickness: 0.6,
      walls: [
        {
          wid: 1,
          wallType: 'east',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [1.054, 27.03, 5.5616],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 2,
          wallType: 'west',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [1.054, 27.03, 5.5616],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 3,
          wallType: 'north',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [8.1419, 0.7389, 5.4881],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 4,
          wallType: 'north',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [8.1419, 0.7389, 5.4881],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        },
        {
          wid: 5,
          wallType: 'south',
          wallSegments: {
            intSegments: [1],
            extSegments: [1],
            interiorWallObjects: [],
            exteriorWallObjects: []
          },
          wallOverrides: {
            dimensions: [31.6216, 0.6518, 8.9507],
            color: '#ddeeff',
            sidePadDivisor: 30,
            manualOffsets: [[0, 0], [0, 0]],
          },
        }
      ],
      floors: [],
      planes: [],
    }
  ]}
/> */}
      {/* <StageModelImport args={[1, 1, 1]} scale={1.0625} position={[-1.75, -.66, -2]} objectRotation={[0, Math.PI / -2, 0]}/> */}
    </CanvasComponent>
    </div>
  );
}
export default ArtGalleryCanvas;


