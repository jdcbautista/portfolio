// import React, { useMemo, useRef } from 'react';
// import { Object3D, InstancedMesh, BufferGeometry, Material } from 'three';
// import { useFrame, extend } from '@react-three/fiber';
// // import { useEventController } from '../../Globals/EventController';

// // Extend THREE.InstancedMesh for JSX compatibility
// extend({ InstancedMesh });

// interface BoxProps {
//   position: [number, number, number];
//   args: [number, number, number];
//   type?: string;
//   friction?: number;
//   mass?: number;
//   onCollide?: (e: any) => void;
//   color?: string;
//   visible?: boolean; // New prop to toggle visibility
// }

// interface InstancedBasicBoxProps {
//   boxes: BoxProps[];
// }

// const InstancedBasicBox: React.FC<InstancedBasicBoxProps> = ({ boxes }) => {

//   const ref = useRef<InstancedMesh<BufferGeometry, Material>>(null);

//   // Precompute instance matrices
//   const instanceMatrices = useMemo(() => {
//     const dummy = new Object3D();
//     return boxes.map(({ position, args }) => {
//       dummy.position.set(...position);
//       dummy.scale.set(...args);
//       dummy.updateMatrix();
//       return dummy.matrix.clone();
//     });
//   }, [boxes]);

//   // Apply instance matrices to the instanced mesh
//   useFrame(() => {
//     if (ref.current) {
//       instanceMatrices.forEach((matrix, index) => {
//         ref.current!.setMatrixAt(index, matrix);
//       });
//       ref.current.instanceMatrix.needsUpdate = true;
//     }
//   });

//   // Material logic based on the `visible` prop
//   const isVisible = boxes[0]?.visible ?? true; // Default to visible
//   const material = isVisible ? (
//     <meshStandardMaterial color={boxes[0]?.color || '#ddeeff'} />
//   ) : (
//     <meshPhongMaterial color="#ff0000" opacity={0.0} transparent />
//   );

//   return (
//     <instancedMesh
//       ref={ref}
//       args={[undefined, undefined, boxes.length]} // Geometry, material, instance count
//     >
//       <boxGeometry />
//       {material}
//     </instancedMesh>
//   );
// };

// export default InstancedBasicBox;
