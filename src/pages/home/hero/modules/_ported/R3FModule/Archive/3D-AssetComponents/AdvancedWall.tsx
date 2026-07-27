/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useState } from 'react';
import BasicBox from './BasicBox.tsx';
import BasicBoundary from './BasicBoundary.tsx';
// import BasicPainting from './BasicPainting.tsx';
import CanvasCatalog from '../../Helpers/CanvasCatalog.js'



const WallObjectConstructor = ({ ...props }) => {
  // @ts-expect-error: Variable is declared but never used
  // eslint-disable-next-line no-unused-vars
  const [defaultsidePadDivisorValue, setDefaultsidePadDivisorValue] = useState(10)

  function SumArray(array: [number]) {
    let sum = 0;
    array.forEach(n => { sum += n}) 
    return sum;
  }

  const BasicPainting = ({ ...props }) => {
    const [ref] = useBox(() => ({
      type: 'Static',
      mass: 1,
      onCollide: (e) => {
        console.log(e);
      },
      ...props,
    }));
    
    function CanvasMethod() {
      // console.log('canvasCode:', props.canvasCode);
      const filename = './art/Firestore/' + CanvasCatalog[props.canvasCode]["Filename"]
      // console.log("LINE 41", props.canvasCode, CanvasCatalog[props.canvasCode]["Filename"])
      // console.log(filename)
  
      const CanvasPainting = useTexture({
        map: filename
      })
  
      return(
        // @ts-expect-error: Ref must be generic
          <mesh castShadow position={[props.position[0], props.position[1], props.position[2]]} color={"#ffffff"} ref={ref}>
            <boxGeometry args={props.args} />
            <meshBasicMaterial {...CanvasPainting} toneMapped={false}/>
          </mesh>
      )
    }
    
    return (
      <group>
      <BasicBox className={"Top"} position={[props.position[0], props.args[1]/2 + .03125 + props.position[1], props.position[2]]} args={[props.args[0] + .03125, .0625, props.args[2] + .03125]} color="#666666" />
      <BasicBox className={"Bottom"} position={[props.position[0], -props.args[1]/2 - .03125 + props.position[1], props.position[2]]} args={[props.args[0] + .03125, .0625, props.args[2] + .03125]} color="#666666" />
      {props.args[0] > props.args[2] && props.args[0] > props.args[1] && <BasicBox className={"L"} position={[-props.args[0]/2 - .03125 + props.position[0], props.position[1], props.position[2]]} args={[.0625, props.args[1] + .125, props.args[2] + .03125]} color="#666666" /> }
      {props.args[0] < props.args[2] && props.args[0] < props.args[1] && <BasicBox className={"L"} position={[props.position[0], props.position[1], -props.args[2]/2 - .03125 + props.position[2]]} args={[props.args[0] + .03125, props.args[1] + .125, .0625]} color="#666666" /> }
      {props.args[0] > props.args[2] && props.args[2] < props.args[1] && <BasicBox className={"L"} position={[-props.args[0]/2 - .03125 + props.position[0], props.position[1], -props.args[2]/2 + .03125 + props.position[2]]} args={[.0625, props.args[1] + .125, props.args[2] + .03125]} color="#666666" /> }
      {props.args[0] > props.args[2] && props.args[2] < props.args[1] && <BasicBox className={"R"} position={[props.args[0]/2 + .03125 + props.position[0], props.position[1], -props.args[2]/2 + .03125 + props.position[2]]} args={[.0625, props.args[1] + .125, props.args[2] + .03125]} color="#666666" /> }
      {props.args[0] > props.args[2] && props.args[0] > props.args[1] && <BasicBox className={"R"} position={[props.args[0]/2 + .03125 + props.position[0], props.position[1], props.position[2]]} args={[.0625, props.args[1] + .125, props.args[2] + .03125]} color="#666666" /> }
      {props.args[0] < props.args[2] && props.args[0] < props.args[1] && <BasicBox className={"R"} position={[props.position[0], props.position[1], props.args[2]/2 + .03125 + props.position[2]]} args={[props.args[0] + .03125, props.args[1] + .125, .0625]} color="#666666" /> }
      <CanvasMethod />
      </group>
    );
  };

    function ObjectPlacementCalculator(props){
      // if canvas
      // console.log("NEW OBJECT PLACEMENT CALCULATOR \n props", {props})
      // Variables
      const p = props.parentProps
      const i = props.oIndex
      const obj = props.object
      const segments = props.interiorFaceDirection == true ? p.intSegments : p.extSegments
      const segmentSum = SumArray(segments)
      const faceDirection = props.interiorFaceDirection == true ? 1 : -1
      const manualOffset = props.interiorFaceDirection == true ? p.manualOffsets[0] : p.manualOffsets[1]
      const objOffset = obj.objectOffsets?obj.objectOffsets:[0,0]
      // const edgeOffset = props.interiorFaceDirection == true ? p.edgeOffsets[0] : p.edgeOffsets[1]
      // Dimensions
      const wallLength = p.wallZLength < p.wallXLength ?  p.wallXLength : p.wallZLength
      const wallDepth = p.wallZLength < p.wallXLength ? p.wallZLength : p.wallXLength
      // Offset
      const parentHorizontalPos =  p.wallZLength < p.wallXLength ? p.position[0] : p.position[2]
      const parentDepthPos =  p.wallZLength < p.wallXLength ? p.position[2] : p.position[0]
      // Object balancing
      const sidePaddingDivisor = (p.sidePadDivisor?p.sidePadDivisor:defaultsidePadDivisorValue)      
      const shiftFromOrigin = (0 - wallLength/2  + wallLength/sidePaddingDivisor)
      const shiftIncrement = ((wallLength * ((sidePaddingDivisor-2)/sidePaddingDivisor)) / (2 * segmentSum))
      const shiftIteration = (((SumArray(segments.slice(0, i)))) * 2 + 1 * segments[i])
      const totalHorizontalOffset = parentHorizontalPos + manualOffset[0] + objOffset[0]
      const totalVerticalOffset = manualOffset[1] + objOffset[1]
      // Position
      const horizontalPos = p.segmentDir * (shiftFromOrigin + (shiftIncrement  * shiftIteration)) + totalHorizontalOffset
      const verticalPos = p.wallHeight/2 + p.position[1] + totalVerticalOffset
      const depthPos = p.interiorPos * wallDepth / (2 * faceDirection) + parentDepthPos    
      const v3Pos = p.wallZLength < p.wallXLength ? [horizontalPos, verticalPos, depthPos] : [depthPos, verticalPos, horizontalPos]
      // Scale
      const wallRatioMod = (((CanvasCatalog[obj.objectParams["imageId"]]["FHeight"])*(wallDepth/2)) < (p.wallHeight/2) - (p.wallHeight/10)) ? 1 : (p.wallHeight * 3)
      const horizontalScale = (CanvasCatalog[obj.objectParams["imageId"]]["FWidth"]/10000 * 5 * (obj.scale?obj.scale:1))*(wallDepth * (segments[i]/segmentSum) * wallRatioMod)
      const verticalScale =  (CanvasCatalog[obj.objectParams["imageId"]]["FHeight"]/10000 * 5 * (obj.scale?obj.scale:1))*(wallDepth * (segments[i]/segmentSum) * wallRatioMod)
      const depthScale = .06725
      const v3Scale = p.wallZLength < p.wallXLength ? [horizontalScale, verticalScale, depthScale] : [depthScale, verticalScale, horizontalScale]
      // console.log("SEGMENTS", segments)
      return ( 
        obj.type === "canvas" ? 
        <BasicPainting canvasCode={obj.objectParams["imageId"]} position={v3Pos} args={v3Scale} /> : <></>
      )
    }

  return (
    <group>
      {props.interiorWallObjects?.length >= 1 && props.intSegments?.length >= 1 && props.interiorWallObjects != null ?
        props.interiorWallObjects.map((object, oIndex) => (
          <group key={oIndex}>
            {
              (oIndex <= SumArray(props.intSegments) ? 
              <ObjectPlacementCalculator parentProps={props} object={object} oIndex={oIndex} interiorFaceDirection={true}/> : <></>
            )}
          </group>
        )) : <> </>
      }
      {props.exteriorWallObjects?.length >= 1 && props.extSegments?.length >= 1 && props.exteriorWallObjects != null ?
        props.exteriorWallObjects.map((extObject, extOIndex) => (
          <group key={extOIndex}>
            {
              (extOIndex <= SumArray(props.extSegments) ? 
              <ObjectPlacementCalculator parentProps={props} object={extObject} oIndex={extOIndex} interiorFaceDirection={false}/> : <></>
            )}
          </group>
        )) : null
      }
    </group>
  );
};

export default AdvancedWall;
