// import { MeshTransmissionMaterial} from "@react-three/drei";
// import { MeshPhysicalMaterial } from THREE;
import { useBox } from '@react-three/cannon';
import { useEventController } from '../../Globals/EventController';
const BasicBox = ({ ...props }) => {
  const { globalCanvasState } = useEventController();

  const [ref] = useBox(() => ({
    type: 'Static',
    friction: 1,
    mass: 1,
    onCollide: (e) => {
      if (globalCanvasState.collisionDebug) { console.log(e, globalCanvasState.collisionDebug)};
    },
    ...props,
  }));

  // const materialProps = ({
  //   thickness: { value: 5, min: 0, max: 20 },
  //   roughness: { value: 0, min: 0, max: 1, step: 0.1 },
  //   clearcoat: { value: 1, min: 0, max: 1, step: 0.1 },
  //   clearcoatRoughness: { value: 0, min: 0, max: 1, step: 0.1 },
  //   transmission: { value: 1, min: 0.9, max: 1, step: 0.01 },
  //   ior: { value: 1.25, min: 1, max: 2.3, step: 0.05 },
  //   envMapIntensity: { value: 25, min: 0, max: 100, step: 1 },
  //   color: '#ffffff',
  //   attenuationTint: '#ffe79e',
  //   attenuationDistance: { value: 0, min: 0, max: 1 }
  // })

//   material.reflectivity = 0
// material.transmission = 1.0
// material.roughness = 0.2
// material.metalness = 0
// material.clearcoat = 0.3
// material.clearcoatRoughness = 0.25
// material.color = new THREE.Color(0xffffff)
// material.ior = 1.2
// material.thickness = 10.0

  return (
    // @ts-expect-error: Ref must be generic
    <mesh castShadow position={props.position} ref={ref}>
      <boxGeometry args={props.args} />
      {props.color == "invisible" ? <meshPhongMaterial color="#ff0000" opacity={0.0} transparent /> :
      <meshStandardMaterial color={props.color} />
      }
    </mesh>
  );
};

export default BasicBox;
