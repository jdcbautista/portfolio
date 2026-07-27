// import * as THREE from "three";
// import { useRef, useEffect } from "react";
// import { useFrame } from "@react-three/fiber";

// const ParticleEmitter = ({ size = 1, color = "white", speed = 1, count = 100 }) => {
//   const particles = useRef();

//   const initializeParticles = () => {
//     if (!particles.current || !particles.current.geometry) return;

//     const positions = particles.current.geometry.attributes.position.array;
//     for (let i = 0; i < count; i++) {
//       const angle = Math.random() * Math.PI * 2;
//       const distance = Math.random() * size;

//       const x = Math.cos(angle) * distance;
//       const y = Math.sin(angle) * distance;
//       const z = 0;

//       positions[i * 3] = x;
//       positions[i * 3 + 1] = y;
//       positions[i * 3 + 2] = z;
//     }

//     particles.current.geometry.attributes.position.needsUpdate = true;
//   };

//   useEffect(() => {
//     if (particles.current) {
//       const positions = new Float32Array(count * 3);
//       particles.current.geometry.setAttribute(
//         "position",
//         new THREE.BufferAttribute(positions, 3)
//       );
//       initializeParticles();
//     }
//   }, [particles, count]);

//   useFrame(() => {
//     if (!particles.current || !particles.current.geometry) return;

//     const positions = particles.current.geometry.attributes.position.array;
//     for (let i = 0; i < count; i++) {
//       positions[i * 3 + 2] += speed * 0.01;
//     }

//     particles.current.geometry.attributes.position.needsUpdate = true;
//   });

//   return (
//     <points ref={particles}>
//       <bufferGeometry />
//       <pointsMaterial color={color} size={0.1} />
//     </points>
//   );
// };

// export default ParticleEmitter;
