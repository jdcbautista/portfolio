/* eslint-disable @typescript-eslint/no-unused-vars */
// import { useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useGLTF, useFBX, Sparkles } from '@react-three/drei';
// import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
// import * as THREE from 'three';
// import { useConvexPolyhedron } from '@react-three/cannon';

const ObjectLoader = ({ ...props }) => {
//   const { nodes, materials } = useFBX('./objects/EChair.fbx');
//   const [objectFBX, setObjectFBX] = useState(useFBX(props.objectString));

//   const fbx = useFBX('/model-low-poly-dude.fbx')
const objectDict: { [key: string]: string } = {
    'echair': './objects/EChair.fbx',
    'edesk': './objects/EDesk.fbx',
};

const [ref] = useBox(() => ({
    type: 'Static',
    mass: 0,
    args: props.args,
    position: props.position,

    ...props,
}));



// const [ref, api] = useConvexPolyhedron(() => ({
//     mass: 1,
//     type: 'Dynamic',
//     position: [props.position[0], props.position[1], props.position[2]],
//     args: [convexGeometry.vertices, convexGeometry.faces],
//     ...props,
// }));

// const mesh = useFBX(objectDict[props.objectString]);
// const childObject = mesh.getObjectByName('name_of_child_object') as THREE.Mesh;
// const geometry = new THREE.BufferGeometry().toNonIndexed().copy(childObject?.geometry);

// const positions = Array.from(geometry.attributes.position.array).reduce((acc, _, i) => {
//     if (i % 3 === 0) {
//         acc.push(new THREE.Vector3());
//     }
//     acc[acc.length - 1].set(geometry.attributes.position.array[i], geometry.attributes.position.array[i + 1], geometry.attributes.position.array[i + 2]);
//     return acc;
// }, [] as THREE.Vector3[]);

// const convexGeometry = new ConvexGeometry(positions);

// const Object3D = () => {
//         const modelPath = objectDict[props.objectString];
//         const objectToLoad = useFBX(modelPath);
//         return <primitive position={[props.position[0], props.position[1], props.position[2]]} scale={[1, 1, 1]} object={objectToLoad} dispose={null} />;
// };

  return (
    // @ts-expect-error: Generic ref expected
    <group ref={ref} {...props} dispose={null}>
        <mesh
        scale={props.scale}
        castShadow
        receiveShadow
      />
      <primitive rotation={[props.objectRotation[0],props.objectRotation[1],props.objectRotation[2],]} position={[props.position[0], props.position[1], props.position[2]]} scale={[1, 1, 1]} object={useFBX(objectDict[props.objectString])} dispose={null} />
    </group>
  );
};

export default ObjectLoader;

// return (
//   // @ts-expect-error: Generic ref expected
//   <group ref={ref} {...props} dispose={null}>

//       <mesh
//       scale={props.scale}
//       castShadow
//       receiveShadow
//       // geometry={nodes['tree-beech'].geometry}
//       // material={materials.color_main}
//     />
//     {/* <Sparkles count={200} scale={[20, 20, 10]} size={3} speed={2} /> */}
//     {/* <mesh
//       scale={props.scale}
//       castShadow
//       receiveShadow
//       // @ts-expect-error: Geometry required
//       // geometry={nodes['tree-beech'].geometry}
//       // geometry={nodes['tree-beech'].geometry}
//       // material={materials.color_main}
//     /> */}
//     {/* <Object3D /> */}
//     {/* <primitive ref={ref} rotation={props.objectRotation} position={props.position} scale={[1, 1, 1]} object={mesh} dispose={null} /> */}
//     <primitive rotation={[props.objectRotation[0],props.objectRotation[1],props.objectRotation[2],]} position={[props.position[0], props.position[1], props.position[2]]} scale={[1, 1, 1]} object={useFBX(objectDict[props.objectString])} dispose={null} />
//   </group>
// );