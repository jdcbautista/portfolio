// import { Sky } from '@react-three/drei';
// import * as THREE from 'three';
// import { Physics, RigidBody, Rapier } from '@react-three/rapier'

import BasicBox from '../Archive/3D-AssetComponents/BasicBox.tsx';
import BasicGlass from '../Archive/3D-AssetComponents/BasicGlass.tsx';
import BasicPyramid from '../Archive/3D-AssetComponents/BasicPyramid.tsx';
import BasicRoom from '../Archive/3D-AssetComponents/BasicRoom.tsx';
import AdvancedRoom from '../Archive/3D-AssetComponents/AdvancedRoom.tsx';
import StageModelImport from '../Assets/Models/StageModelLoader.tsx';
import CanvasController from '../Globals/Components/CanvasComponent.tsx';
// import SkyBox from '../Globals/Skybox.tsx';
// import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// Depth = North to South
// Width = East to West
import { ReactNode } from 'react';

function DemoScene(): ReactNode {
  // const api = useContext(PhysicsContext);
  return (
    // <group>
    <CanvasController>
      <BasicGlass position={[-12.25, 1, -21.5]} args={[20, 30, .10]}/>
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
      <BasicPyramid position={[-1.75, .25, -18]} args={[5.75,15,4]} color="invisible" rotation={[0, Math.PI / 4, 0]} invisible={true}/>
      <BasicRoom roomDepth={16} roomWidth={25} roomHeight={99999} position={[-1.8, 0, -4]} nWall={[0,0,0]} sWall={[1,0,0]} eWall={[1,0,0]} wWall={[0,0,0]} floor={[1]} color="#ff9922"/>
      <AdvancedRoom sections={[
        {sid: 1,
          description: "Main Central Gallery Wall",
          area:[10.5,10],
          position:[-1.76, 0 ,-34.75],
          sectionColor: "ffffff",
          walls: [
            { wid: 1, collectionName: "Athletes",
            type: 'north', intSegments:[1,1], extSegments:[1,1],
              interiorWallObjects:[
                {type:"canvas", objectParams:{imageId:"1503"}, objectOffsets: null , scale:1.33},
                {type:"canvas", objectParams:{imageId:"1728"}, objectOffsets: null , scale:1.33}
              ],
              exteriorWallObjects: [
                {type:"canvas", objectParams:{imageId:"1525"}, objectOffsets: null , scale:1.33},
                {type:"canvas", objectParams:{imageId:"1524"}, objectOffsets: null , scale:1.33}
              ],
              wallColor:null,
              wallHeightOverride:null,
              sidePadDivisor:30,
              manualOffsets:[[0,0],[0,0]]
            }],
          wallThickness: .6,
          sectionHeight:3,
          floorColor: null,
          floorObjects:null},
        {sid: 2,
          description: "Main Central Gallery Entrance",
          area:[16.35,5.25],
          position:[-1.75, 0 ,-31.275],
          sectionColor: "ffffff",
          walls: [
            { wid: 1, collectionName: "Headshots",
            type: 'east', intSegments:[1], extSegments:[1],  
              interiorWallObjects:[
                {type:"canvas", objectParams:{imageId:"1804"}, objectOffsets: null , scale:.5}],
              exteriorWallObjects: [
                {type:"canvas", objectParams:{imageId:"1405"}, objectOffsets: null , scale:.4}],
              wallColor:null,
              wallHeightOverride:null,
              sidePadDivisor:null,
              manualOffsets:[[0,0],[0,0]]
            },
            { wid: 2, collectionName: "ReturnToForm",
            type: 'west', intSegments:[1], extSegments:[1],
              interiorWallObjects:[
                {type:"canvas", objectParams:{imageId:"1805"}, objectOffsets: null , scale:.5}],
              exteriorWallObjects:[
                {type:"canvas", objectParams:{imageId:"1410"}, objectOffsets: null , scale:.45}],
              wallColor:null,
              wallHeightOverride:null,
              sidePadDivisor:null,
              manualOffsets:[[0,0],[-.33,0]]
            }],
          wallThickness: .8,
          sectionHeight:3,
          floorColor: null,
          floorObjects:null},
        {sid: 3.1, description: "Main Central Gallery Left Front Walls", area:[11.5,10], position:[-14.95, 0, -33.65], sectionColor: "ffffff", walls: [
          { wid: 1, collectionName: "",
            type: 'west', intSegments:[1,1], extSegments:[1],  interiorWallObjects:[
            {type:"canvas", objectParams:{imageId:"1416"}, objectOffsets: null , scale:1.125},
            {type:"canvas", objectParams:{imageId:"1501"}, objectOffsets: null , scale:1},
          ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:5, manualOffsets:[[0,0],[0,0]]},
          { wid: 2, collectionName: "Melondrama Headshots", type: 'south', intSegments:[1,1,1], extSegments:[1], 
            interiorWallObjects:[
              {type:"canvas", objectParams:{imageId:"1402"}, objectOffsets: null , scale:1.25},
              {type:"canvas", objectParams:{imageId:"1409"}, objectOffsets: null , scale:1.25},
              {type:"canvas", objectParams:{imageId:"1403"}, objectOffsets: null , scale:1.25},
            ],
            exteriorWallObjects: [],
            wallColor:null, wallHeightOverride:null, sidePadDivisor:5.25, manualOffsets:[[0,0],[0,0]] }],
          wallThickness: .65, sectionHeight:3, floorColor: null, floorObjects:null},
        {sid: 3.2, description: "Main Central Gallery Left Front Walls", area:[11.5,20], position:[-14.95, 0, -48.65], sectionColor: "ffffff", walls: [
            { wid: 1, collectionName: "",
              type: 'west', intSegments:[2,1,1,1,1,1,], extSegments:[1],  interiorWallObjects:[
              {type:"canvas", objectParams:{imageId:"1411"}, objectOffsets: [1.25,0] , scale:2.5},
              {type:"canvas", objectParams:{imageId:"1504"}, objectOffsets: [.33,0] , scale:4},
              {type:"canvas", objectParams:{imageId:"1505"}, objectOffsets: [.33,0] , scale:4},
              {type:"canvas", objectParams:{imageId:"1425"}, objectOffsets: [-.75,0] , scale:2},
              {type:"canvas", objectParams:{imageId:"1502"}, objectOffsets: [-2.25,0] , scale:6.66},
              ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:20, manualOffsets:[[.5,0],[0,0]]
            }],
            wallThickness: .65, sectionHeight:3, floorColor: null, floorObjects:null},
          {sid: 4, description: "Main Central Gallery Left Rear Walls", area:[10,12.25], position:[-10.25, 0, -52.35], sectionColor: "ffffff", walls: [
            { wid: 1, collectionName: "",
            type: 'east', intSegments:[1,1,1], extSegments:[1],  interiorWallObjects:[
              {type:"canvas", objectParams:{imageId:"1604"}, objectOffsets: null , scale:1.5},
              {type:"canvas", objectParams:{imageId:"1405"}, objectOffsets: null , scale:1.5},
              {type:"canvas", objectParams:{imageId:"1632"}, objectOffsets: null , scale:1.5},
            ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:null, manualOffsets:[[.5,0],[0,0]] },
            { wid: 2, collectionName: "",
            type: 'north', intSegments:[2,1], extSegments:[2,1],  interiorWallObjects:[
              {type:"canvas", objectParams:{imageId:"1507"}, objectOffsets: [-.25,0] , scale:1},
              {type:"canvas", objectParams:{imageId:"1425"}, objectOffsets: null , scale:.75},
            ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:null, manualOffsets:[[0,0],[0,0]] }],
            wallThickness: .65, sectionHeight:3, floorColor: null, floorObjects:null},
          {sid: 5, description: "Main Central Gallery Right Front Walls", area:[11.5,30], position:[11.5, 0, -43.65], sectionColor: "ffffff", walls: [
            { wid: 1, collectionName: "",
            type: 'east', intSegments:[1,1,1,1,1,1,1], extSegments:[1],  interiorWallObjects:[
              {type:"canvas", objectParams:{imageId:"1525"}, objectOffsets: null , scale:3.5},
              {type:"canvas", objectParams:{imageId:"1610"}, objectOffsets: null , scale:3.5},
              {type:"canvas", objectParams:{imageId:"1614"}, objectOffsets: null , scale:3.5},
              {type:"canvas", objectParams:{imageId:"1618"}, objectOffsets: null , scale:3},
              {type:"canvas", objectParams:{imageId:"1707"}, objectOffsets: null , scale:3.5},
              {type:"canvas", objectParams:{imageId:"1510"}, objectOffsets: null , scale:3},
              {type:"canvas", objectParams:{imageId:"1511"}, objectOffsets: null , scale:3},
            ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:null, manualOffsets:[[0,0],[0,0]]},
            { wid: 2, collectionName: "",
            type: 'south', intSegments:[1], extSegments:[1], 
              interiorWallObjects:[
              ],
              exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:null, manualOffsets:[[0,0],[0,0]] }],
            wallThickness: .65, sectionHeight:3, floorColor: null, floorObjects:null},
            {sid: 6, description: "Main Central Gallery Right Rear Walls", area:[10,12.25], position:[7.0, 0, -52.35], sectionColor: "ffffff", walls: [
              { wid: 1, collectionName: "",
            type: 'west', intSegments:[1,1,1], extSegments:[1],  interiorWallObjects:[
                {type:"canvas", objectParams:{imageId:"1525"}, objectOffsets: null , scale:1.5},
                {type:"canvas", objectParams:{imageId:"1610"}, objectOffsets: null , scale:1.5},
                {type:"canvas", objectParams:{imageId:"1614"}, objectOffsets: null , scale:1.5},
              ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:null, manualOffsets:[[.5,0],[0,0]] },
              { wid: 2, collectionName: "",
            type: 'north', intSegments:[1,1,1], extSegments:[1],  interiorWallObjects:[
              ], exteriorWallObjects: [], wallColor:null, wallHeightOverride:null, sidePadDivisor:2, manualOffsets:[[0,0],[0,0]] }],
              wallThickness: .65, sectionHeight:3, floorColor: null, floorObjects:null},
        ]} position ={[0,1.65 + 1.725/4 + .125,0]} floorLevel={null}/>
      <StageModelImport args={[1, 1, 1]} scale={1.0625} position={[-1.75, -.66, -2]} objectRotation={[0, Math.PI / -2, 0]}/>
      {/* <SkyBox /> */}
    {/* </group> */}
    </CanvasController>
  );
}
export default DemoScene;
