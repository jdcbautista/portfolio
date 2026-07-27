/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBox } from '@react-three/cannon';
import BasicBox from './BasicBox.tsx';
import BasicBoundary from './BasicBoundary.tsx';
import BasicPainting from './BasicPainting.tsx';

const BasicWall = ({ ...props }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    mass: 1,
    onCollide: (e) => {
      console.log(e);
    },
    ...props,
  }));

  // const canvasHeight = (props.canvasRatio[1])*(props.wallXLength/3)
  // Paintings we check the cardinal orientation of the wall by comparing X and Z

  // Wall Space calculations
  // 0. Instead of passing in arrays of integers as canvasPaintings or doors, consider all possible object spawns as an ObjectClass
  //    a.  We can then pass in a List of Dictionaries/Objects, and this allows us to cleanly iterate through a list while standardizing params into a a key value pair format
  //    b.  We create separate lists for interior and exterior generation. Both lists will contain the same object if the object requires it, such as doors or windows
  //    c.  Considering the amount of space we want around each object, and the amount of wallspace we have to work with, we sort the items based on priority through an inverse value parameter.
  //    d.  A priority param of 0 will mean we want the Object included for sure.  Anything beyond will be ordered, and will be generated until no allocatable wall space remains. Objects tied by value will be selected at random.
  // 1. Calculate segments ahead of time by counting number of objects  (canvasses, sculptures, tables, doors, windows, etc.) that have passed the initial filter.
  //    a.  Allocate space accordingly, and create segments, and call methods accordingly (BasicWall, BasicDoor, BasicWindow, etc)


  return (
    <group>
      <BasicBox position={[0 + props.position[0], .0625 + props.position[1], 0 + props.position[2]]} args={[props.wallZLength+.125, .125, props.wallXLength+.125]} color="#ffffff" />
      <BasicBox position={[0 + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[props.wallZLength, props.wallHeight, props.wallXLength]} color={props.color} />
      <BasicBoundary position={[0 + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[props.wallZLength+.5, props.wallHeight, props.wallXLength+.5]}/>
      {props.canvasPaintings==1 && props.wallXLength < props.wallZLength && (((props.canvasRatio[1])*(props.wallZLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[0 + props.position[0], props.wallHeight/2 + props.position[1], props.interiorPos * props.wallXLength + props.position[2]]} args={[(props.canvasRatio[0])*(props.wallZLength/1),(props.canvasRatio[1])*(props.wallZLength/1),.06725]} />}
      {props.canvasPaintings==1 && props.wallXLength > props.wallZLength && (((props.canvasRatio[1])*(props.wallXLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[props.interiorPos * props.wallZLength + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[.06725,(props.canvasRatio[1])*(props.wallXLength/1),(props.canvasRatio[0])*(props.wallXLength/1)]} />}
      {props.canvasPaintings==1 && props.wallXLength < props.wallZLength && (((props.canvasRatio[1])*(props.wallZLength/2)) >= (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[0 + props.position[0], props.wallHeight/2 + props.position[1], props.interiorPos * props.wallXLength + props.position[2]]} args={[(props.canvasRatio[0])*(props.wallHeight * 2),(props.canvasRatio[1])*(props.wallHeight * 2),.06725]} />}
      {props.canvasPaintings==1 && props.wallXLength > props.wallZLength && (((props.canvasRatio[1])*(props.wallXLength/2)) >= (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[props.interiorPos * props.wallZLength + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[.06725,(props.canvasRatio[1])*(props.wallHeight * 2),(props.canvasRatio[0])*(props.wallHeight * 2)]} />}
      {props.canvasPaintings==2 && props.wallXLength < props.wallZLength && (((props.canvasRatio[1])*(props.wallZLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[0 + props.position[0], props.wallHeight/2 + props.position[1], props.interiorPos * props.wallXLength / props.canvasPaintings + props.position[2]]} args={[(props.canvasRatio[0])*(props.wallZLength/(1*props.canvasPaintings)),(props.canvasRatio[1])*(props.wallZLength/(1*props.canvasPaintings)),.06725]} />}
      {props.canvasPaintings==2 && props.wallXLength > props.wallZLength && (((props.canvasRatio[1])*(props.wallXLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[props.interiorPos * props.wallZLength / props.canvasPaintings + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[.06725,(props.canvasRatio[1])*(props.wallXLength/(1*props.canvasPaintings)),(props.canvasRatio[0])*(props.wallXLength/(1*props.canvasPaintings))]} />}
      {props.canvasPaintings==2 && props.wallXLength < props.wallZLength && (((props.canvasRatio[1])*(props.wallZLength/2)) >= (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[0 + props.position[0], props.wallHeight/2 + props.position[1], props.interiorPos * props.wallXLength / props.canvasPaintings + props.position[2]]} args={[(props.canvasRatio[0])*(props.wallHeight * 2),(props.canvasRatio[1])*(props.wallHeight * 2),.06725]} />}
      {props.canvasPaintings==2 && props.wallXLength > props.wallZLength && (((props.canvasRatio[1])*(props.wallXLength/2)) >= (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[props.interiorPos * props.wallZLength / props.canvasPaintings + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[.06725,(props.canvasRatio[1])*(props.wallHeight * 2),(props.canvasRatio[0])*(props.wallHeight * 2)]} />}
    </group>
  );
};

export default BasicWall;

//      Example of conditional prior to refactoring to make paintings appear on the inside or outside
//      {props.canvasPaintings==1 && props.wallXLength < props.wallZLength && (((props.canvasRatio[1])*(props.wallZLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[0 + props.position[0], props.wallHeight/2 + props.position[1], -props.wallXLength + props.position[2]]} args={[(props.canvasRatio[0])*(props.wallZLength/1),(props.canvasRatio[1])*(props.wallZLength/1),.06725]} />}
//      {props.canvasPaintings==1 && props.wallXLength > props.wallZLength && (((props.canvasRatio[1])*(props.wallXLength/2)) < (props.wallHeight/2) - (props.wallHeight/10)) && <BasicPainting position={[-props.wallZLength + props.position[0], props.wallHeight/2 + props.position[1], 0 + props.position[2]]} args={[.06725,(props.canvasRatio[1])*(props.wallXLength/1),(props.canvasRatio[0])*(props.wallXLength/1)]} />}
