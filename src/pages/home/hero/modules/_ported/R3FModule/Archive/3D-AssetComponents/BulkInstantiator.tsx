// import React, { useMemo, useRef } from 'react';
// import { InstancedMesh } from 'three';
// import { useFrame } from '@react-three/fiber';

// const Instantiator = ({ instancePool }) => {
//   const wallRef = useRef();
//   const mouldingRef = useRef();
//   const boundaryRef = useRef();

//   // Helper to create instance matrices
//   const createInstanceMatrices = (instances) => {
//     const dummy = new THREE.Object3D();
//     return instances.map(({ position, args }) => {
//       dummy.position.set(...position);
//       dummy.scale.set(...args);
//       dummy.updateMatrix();
//       return dummy.matrix.clone();
//     });
//   };

//   const wallMatrices = useMemo(() => createInstanceMatrices(instancePool.walls), [instancePool.walls]);
//   const mouldingMatrices = useMemo(() => createInstanceMatrices(instancePool.mouldings), [instancePool.mouldings]);
//   const boundaryMatrices = useMemo(() => createInstanceMatrices(instancePool.boundaries), [instancePool.boundaries]);

//   useFrame(() => {
//     [wallRef, mouldingRef, boundaryRef].forEach((ref, idx) => {
//       const matrices = [wallMatrices, mouldingMatrices, boundaryMatrices][idx];
//       if (ref.current && matrices.length) {
//         matrices.forEach((matrix, i) => ref.current.setMatrixAt(i, matrix));
//         ref.current.instanceMatrix.needsUpdate = true;
//       }
//     });
//   });

//   return (
//     <>
//       <instancedMesh ref={wallRef} args={[null, null, wallMatrices.length]}>
//         <boxGeometry />
//         <meshStandardMaterial color="#ddeeff" />
//       </instancedMesh>
//       <instancedMesh ref={mouldingRef} args={[null, null, mouldingMatrices.length]}>
//         <boxGeometry />
//         <meshStandardMaterial color="#ffffff" />
//       </instancedMesh>
//       <instancedMesh ref={boundaryRef} args={[null, null, boundaryMatrices.length]}>
//         <boxGeometry />
//         <meshPhongMaterial color="#ff0000" opacity={0.0} transparent />
//       </instancedMesh>
//     </>
//   );
// };

// export default Instantiator;
