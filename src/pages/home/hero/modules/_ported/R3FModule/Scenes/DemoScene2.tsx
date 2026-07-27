// import { Sky } from '@react-three/drei';
// import * as THREE from 'three';
// import { Physics, RigidBody, Rapier } from '@react-three/rapier'

// import BasicBox from '../Archive/3D-AssetComponents/BasicBox.tsx';
// import BasicGlass from '../Archive/3D-AssetComponents/BasicGlass.tsx';
// import BasicPyramid from '../Archive/3D-AssetComponents/BasicPyramid.tsx';
// import BasicRoom from '../Archive/3D-AssetComponents/BasicRoom.tsx';
// import AdvancedRoom from '../Archive/3D-AssetComponents/AdvancedRoom.tsx';
// import StageModelImport from '../Assets/Models/StageModelLoader.tsx';
import CanvasController from '../Globals/Components/CanvasComponent.tsx';
import RoomConstructor from '../Assets/Environment/RoomConstructor.tsx';
import SceneConstructor from '../Assets/Environment/SceneConstructor.tsx';
import scenetest from './scenetest.json';
// import SkyBox from '../Globals/Skybox.tsx';
// import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// Depth = North to South
// Width = East to West
import { ReactNode } from 'react';

function DemoScene2(): ReactNode {
  // const api = useContext(PhysicsContext);
  return (
    // <group>
    <CanvasController>
      <SceneConstructor sceneData={scenetest}>

      </SceneConstructor>
            {/* <BasicGlass position={[-12.25, 1, -21.5]} args={[20, 30, .10]}/>
      <BasicGlass position={[8.825, 1, -21.5]} args={[20, 30, .10]}/>
      <BasicGlass position={[-1.675, 19, -21.5]} args={[20, 30, .10]}/>
      <BasicBox className="MainGalleryFloor" text={false} position={[0, 1.755, -75]} args={[120, .6, 120]} color="invisible" />
      <BasicBox className="BrickEntranceBlockCollider1" text={false} position={[-10.15, .85, -16.6]} args={[8.25, 999, 10]} color="invisible" />
      <BasicBox className="BrickEntranceBlockCollider2" text={false} position={[6.65, .85, -16.6]} args={[8.25, 999, 10]} color="invisible" />
      <BasicBox className="EntranceStatueCollider" text={false} position={[-1.75, .85, -12.5]} args={[2, 999, 2.5]} color="invisible" />
      <BasicBox className="EntranceColliderLeft" text={false} position={[-12.25, 1, -22]} args={[20, 30, .125]} color="invisible" />
      <BasicBox className="EntranceColliderRight" text={false} position={[8.825, 1, -22]} args={[20, 30, .125]} color="invisible" />
      <BasicBox className="EntranceColliderCenter" text={false} position={[-1.675, 10, -22]} args={[1, 12, .125]} color="invisible" />
      <BasicBox className="DebugPlatform" text={false} position={[-2, 12, -22]} args={[50, .25, 3]} color="red" />
      <BasicPyramid position={[-1.75, .25, -18]} args={[5.75,15,4]} color="invisible" rotation={[0, Math.PI / 4, 0]} invisible={true}/> */}
      {/* <BasicRoom roomDepth={16} roomWidth={ */}
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
                wallSegments: {

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

            ],
            planes: [],
          },
        ]}
      /> */}
      <StageModelImport args={[1, 1, 1]} scale={1.0625} position={[-1.75, -.66, -2]} objectRotation={[0, Math.PI / -2, 0]}/>

    </CanvasController>
  );
}
export default DemoScene2;


