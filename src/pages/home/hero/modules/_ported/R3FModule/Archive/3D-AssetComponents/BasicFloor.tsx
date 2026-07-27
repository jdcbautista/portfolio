// import { usePlane } from '@react-three/cannon';

import { usePlane } from '@react-three/cannon';
// import { Mesh, BufferGeometry, NormalBufferAttributes, Material, Object3DEventMap } from 'three';

interface BasicFloorProps {
  rotation: [number, number, number]; // Update the type of rotation property
  position: [number, number, number]; 
  color: string;
  roomWidth: number;
  roomDepth: number;
}

const BasicFloor = (props: BasicFloorProps) => {
  const [ref] = usePlane(() => ({ type: 'Static', mass: 0, ...props }));
  // ts-expect-error: Ref expected to be generic
  // const ref: Ref<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>> | undefined = usePlane(() => ({ type: 'Static', mass: 0, ...props }));

  return (
    // @ts-expect-error: Ref expected to be generic
    <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]} position={props.position} ref={ref}>
      <planeGeometry args={[props.roomWidth, props.roomDepth]} />
      <meshStandardMaterial color={props.color} />
    </mesh>
  );
};

export default BasicFloor;
