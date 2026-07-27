// import { Suspense } from 'react';
import { useBox } from '@react-three/cannon';
import { useTexture } from '@react-three/drei';
import BasicBox from './BasicBox.tsx';
// import artCatalog from '../2D-Assets/artCatalog.tsx'
import CanvasCatalog from '../../Helpers/CanvasCatalog.ts'

// import { TextureLoader } from "three";

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

export default BasicPainting;
