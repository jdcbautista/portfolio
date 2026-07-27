import { RigidBody, CuboidCollider } from '@react-three/rapier';
// import { useTexture } from "@react-three/drei"
interface StageFloorProps {
  rotation: [number, number, number];
  position: [number, number, number];
  color: string;
}

const StageFloor = (props: StageFloorProps) => {
  // const texture = useTexture(grass)
  // texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh
        receiveShadow
        rotation={props.rotation}
        position={props.position}
      >
        <planeGeometry args={[100, 100]} />
        {/* <boxGeometry args={[100, 1, 100]} /> */}
        <meshStandardMaterial color={props.color} />
      </mesh>
      <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
    </RigidBody>
  );
};

export default StageFloor;
