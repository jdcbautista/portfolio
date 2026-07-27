/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBox, useCylinder } from '@react-three/cannon';
import { useEventController } from '../../Globals/EventController';

const BasicPyramid = ({ ...props }) => {
  const { globalCanvasState } = useEventController();

  const [ref] = useCylinder(() => ({
    type: 'Static',
    friction: 1,
    mass: 1,
    onCollide: (e) => {
      // if (globalCanvasState.collisionDebug) { console.log(e, globalCanvasState.collisionDebug)};
    },
    ...props,
  }));


  return (
    // @ts-expect-error: Ref must be generic
    <mesh castShadow position={props.position} rotation={[0, Math.PI / 4, 0]} ref={ref}>
      <cylinderGeometry args={[props.args[0], props.args[1], props.args[2], 4]} /> 
      {props.color == "invisible" ? <meshPhongMaterial color="#ff0000" opacity={0.00} transparent /> :
      <meshStandardMaterial color={props.color} />}
    </mesh>
  );
};

export default BasicPyramid;

// Math.PI = 180 degree rotation