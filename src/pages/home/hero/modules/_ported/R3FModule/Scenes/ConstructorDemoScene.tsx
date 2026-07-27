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
import WallConstructor from '../Assets/Environment/WallConstructor.tsx';
import GeometryConstructor from '../Assets/Environment/GeometryConstructor.tsx';
import GeometryInstantiator from '../Assets/Environment/GeometryInstantiator.tsx';
// import SkyBox from '../Globals/Skybox.tsx';
// import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// Depth = North to South
// Width = East to West
import { ReactNode } from 'react';

function ConstructorDemoScene(): ReactNode {
const wallConfig2 = [
  { position: [0, 0, Math.random() * (Math.random() * 10) as number],
    dimensions:[ 5, 3, (Math.random() * (Math.random() * 10)) as number],
    color: '#ff0000' },
  { position: [0, 0, -5], dimensions: [5, 3, 1], color: '#ff00ff' },
  { position: [6, 0, 0], dimensions: [4, 2.5, 1.5], color: '#00ff00' },
  { position: [-6, 0, 0], dimensions: [6, 4, 1], color: '#0000ff' },
  { position: [0, 0, 6], dimensions: [3, 3.5, 0.5], color: '#ffff00' },

]

  const wallConfig = [
    { position: [0, 0, Math.random() * (Math.random() * 10)], args: [ 5, 3, (Math.random() * (Math.random() * 10))], color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
        { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [0, 0, Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#ff0000' },
    { position: [6, 10, Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#00ff00' },
    { position: [-6, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4, color: '#0000ff' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), 6], wallXLength: 3, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3.5, color: '#ffff00' },
    { position: [Math.random() * (Math.random() * 10), 5, -6], wallXLength: 7, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#ff00ff' },
    { position: [10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 2, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 5, color: '#00ffff' },
    { position: [-10, Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10)], wallXLength: 4, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 4.5, color: '#880000' },
    { position: [Math.random() * (Math.random() * 10), 3, 10], wallXLength: 5, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2.5, color: '#008800' },
    { position: [Math.random() * (Math.random() * 10), Math.random() * (Math.random() * 10), -10], wallXLength: 6, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 3, color: '#000088' },
    { position: [12, Math.random() * (Math.random() * 10), 12], wallXLength: 8, wallZLength: Math.random() * (Math.random() * 10), wallHeight: 2, color: '#888888' },

  ];
  // const api = useContext(PhysicsContext);
  return (
    // <group>
    <CanvasController>
       <group>
        {/* <GeometryInstantiator propObjects={wallConfig2} /> */}
        <WallConstructor propObjects={wallConfig2} />
      {/* {wallConfig.map((config, index) => (
        <WallConstructor
          key={index}
          wallConfig={{
            position: config.position,
            wallXLength: config.wallXLength,
            wallZLength: config.wallZLength,
            wallHeight: config.wallHeight,
            color: config.color,
          }}
        />
      ))} */}
    </group>
    </CanvasController>
  );
}
export default ConstructorDemoScene;
