/* eslint-disable @typescript-eslint/no-unused-vars */
// import { useBox } from '@react-three/cannon';

import { useGLTF, useFBX, Sparkles } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const StageModelImport = ({ ...props }) => {
//   const { geometry, materials } = useGLTF('./objects/personal_desk_workspace.glb');
  // const gltf = useGLTF('./objects/personal_desk_workspace.glb')
  const gltf = useGLTF('./objects/GallerySceneG.glb')
  // const [ref] = useRigidBodyContext()

  return (
    
    <group {...props} dispose={null}>
      <RigidBody
        type="fixed" // Equivalent to 'Static' in Cannon
        position={[0,0,0]} // Initial position
        colliders="hull" // Automatically generate a collider (use 'cuboid' for box shapes)
        {...props}
      ></RigidBody>

      <primitive
        object={gltf.scene}
        position={[0, 1, 0]}
        children-0-castShadow
      />
    </group>
  );
};

export default StageModelImport;
