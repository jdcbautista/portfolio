// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBox } from '@react-three/cannon';
// import BasicBox from './BasicBox.tsx';
// import BasicBoundary from './BasicBoundary.tsx';
import BasicWall from './BasicWall.tsx';
import BasicFloor from './BasicFloor.tsx';
import BasicPainting from './BasicPainting.tsx';

const BasicRoom = ({ ...props }) => {
  // const [ref] = useBox(() => ({
  //   type: 'Static',
  //   mass: 1,
  //   onCollide: (e) => {
  //     console.log(e);
  //   },
  //   ...props,
  // }));
  // ['nWalls',3,0,2,wallObjects=[{oid=1, type="canvas", objectParams=[imageId="1821"]}, {oid=1, type="canvas", objectParams=[imageId="1821"]}]]
  // const wallDataArray01 = [
  //   { wid: 1, type: 'nWall', segments:[1,1], wallObjects:[ {type="canvas", surfaceOrientation=1, objectParams=[imageId="1821"]}, {type="canvas", surfaceOrientation=1, objectParams=[imageId="1822"]} ]},
  //   { wid: 2, type: 'eWall', segments:[1], wallObjects:[ {type="canvas", surfaceOrientation=1, objectParams=[imageId="1823"]} ]},
  //   // more objects...
  // ];

  // <AdvancedRoom sections={[{description:"Main Gallery", area:[8,10], position:[0,0,0], sectionColor: "ffffff", walls: wallDataArray01}]} position ={[0,0,0]} />

  return (
    <group>
      {props.eWall[0] >=1 && <BasicWall doorways={props.eWall[1]} canvasPaintings={props.eWall[2]} canvasRatio={[.6,.36]} className="east" wallHeight={props.roomHeight} wallXLength={props.roomDepth} wallZLength={.25} interiorPos={-1} position={[props.position[0] + (props.roomWidth/2 -.125), props.position[1] + 0, props.position[2] + 0]} color="#ddeeff"/>}
      {props.wWall[0] >=1 && <BasicWall doorways={props.wWall[1]} canvasPaintings={props.wWall[2]} canvasRatio={[.6,.36]} className="west" wallHeight={props.roomHeight} wallXLength={props.roomDepth} wallZLength={.25} interiorPos={1} position={[props.position[0] + (-1 * (props.roomWidth/2 -.125)),props.position[1] + 0, props.position[2] + 0]} color="#ddeeff"/>}
      {props.sWall[0] >=1 && <BasicWall doorways={props.sWall[1]} canvasPaintings={props.sWall[2]} canvasRatio={[.6,.36]}  className="south" wallHeight={props.roomHeight}wallXLength={.25} wallZLength={props.roomWidth} interiorPos={-1} position={[props.position[0] +0, props.position[1] + 0,props.position[2] + (props.roomDepth/2 -.125)]} color="#ddeeff"/>}
      {props.nWall[0] >=1 && <BasicWall doorways={props.nWall[1]} canvasPaintings={props.nWall[2]} canvasRatio={[.6,.36]}  className="north" wallHeight={props.roomHeight} wallXLength={.25} wallZLength={props.roomWidth} interiorPos={1} position={[props.position[0] +0, props.position[1] + 0, props.position[2] + (-1 * (props.roomDepth/2 -.125))]} color="#ddeeff"/>}
      {props.floor[0] >=1 && <BasicFloor rotation={[Math.PI / -2, 0, 0]} position={[props.position[0] + 0, + props.position[1] + .01, props.position[2] + 0]} roomWidth={props.roomWidth} roomDepth={props.roomDepth} color="#999999" />}
    </group>
  );
};
//args={[2, 1, 2]} color="red" 
export default BasicRoom;

// return (
//   <group>
//     {/* {wallDataArray.map((item) => (
//       <div key={item.id}>
//         {item.name}
//       </div>
//     ))} */}
//     {/* <BasicBoundary text={"North"} position={[10, 0, 0]} args={[1, 4, 10]}/>
//     <BasicBox text={"North"} position={[10, 0, 0]} args={[.25, 4, 10]} color="red" /> */}
//     {props.eWall[0] >=1 && <BasicWall doorways={props.eWall[1]} canvasPaintings={props.eWall[2]} canvasRatio={[.6,.36]} className="east" wallHeight={props.roomHeight} wallXLength={props.roomDepth} wallZLength={.25} interiorPos={-1} position={[props.position[0] + (props.roomWidth/2 -.125), props.position[1] + 0, props.position[2] + 0]} color="#ddeeff"/>}
//     {props.wWall[0] >=1 && <BasicWall doorways={props.wWall[1]} canvasPaintings={props.wWall[2]} canvasRatio={[.6,.36]} className="west" wallHeight={props.roomHeight} wallXLength={props.roomDepth} wallZLength={.25} interiorPos={1} position={[props.position[0] + (-1 * (props.roomWidth/2 -.125)),props.position[1] + 0, props.position[2] + 0]} color="#ddeeff"/>}

//     {props.sWall[0] >=1 && <BasicWall doorways={props.sWall[1]} canvasPaintings={props.sWall[2]} canvasRatio={[.6,.36]}  className="south" wallHeight={props.roomHeight}wallXLength={.25} wallZLength={props.roomWidth} interiorPos={-1} position={[props.position[0] +0, props.position[1] + 0,props.position[2] + (props.roomDepth/2 -.125)]} color="#ddeeff"/>}
//     {props.nWall[0] >=1 && <BasicWall doorways={props.nWall[1]} canvasPaintings={props.nWall[2]} canvasRatio={[.6,.36]}  className="north" wallHeight={props.roomHeight} wallXLength={.25} wallZLength={props.roomWidth} interiorPos={1} position={[props.position[0] +0, props.position[1] + 0, props.position[2] + (-1 * (props.roomDepth/2 -.125))]} color="#ddeeff"/>}
    
//     {props.floor[0] >=1 && <BasicFloor rotation={[Math.PI / -2, 0, 0]} position={[props.position[0] + 0, + props.position[1] + .01, props.position[2] + 0]} roomWidth={props.roomWidth} roomDepth={props.roomDepth} color="#999999" />}
  
//     {/* <BasicPainting position={[0,.75,0]} args={[.6*2,.36*2,.0125]} canvasXLength={2} canvasHeight={1} /> */}
//   {/* <mesh castShadow position={[10 + props.position[0],0 + props.position[1],0 + props.position[2],]} ref={ref}>
//     <boxGeometry args={wallNorthArgs} />
//     <meshStandardMaterial color={"#ff9922"} />

//   </mesh>
//   <mesh castShadow position={[0 + props.position[0], + props.position[1],10 + props.position[2],]} ref={ref}>
//     <boxGeometry args={wallSouthArgs} />
//     <meshStandardMaterial color={"#99ff22"} />

//   </mesh>
//     <mesh castShadow position={[5 + props.position[0], + props.position[1],0 + props.position[2],]} ref={ref}>
//       <boxGeometry args={wallEastArgs} />
//       <meshStandardMaterial color={"#ff2211"} />

//     </mesh>
//     <mesh castShadow position={[5 + props.position[0], + props.position[1],0 + props.position[2],]} ref={ref}>
//       <meshStandardMaterial color={"#9922ff"} />
//       <boxGeometry args={wallWestArgs} /> 

//     </mesh>*/}
//   </group>
// );