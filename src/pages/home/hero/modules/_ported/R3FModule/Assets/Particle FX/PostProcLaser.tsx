// import { useRef, useEffect } from "react";
// import { useFrame, extend } from "@react-three/fiber";
// import { EffectComposer, Bloom } from "@react-three/postprocessing";
// import { Vector3, TubeGeometry, CatmullRomCurve3, MeshStandardMaterial } from "three";

// export default function PostProcLaser({
//   origin,
//   points,
//   color = "red",
//   radius = 0.1,
//   isOn = false,
//   glowIntensity = 1.5,
// }) {
//   const beamRef = useRef();

//   useEffect(() => {
//     if (!isOn || points.length === 0) return;

//     const allPoints = [origin, ...points]; // Create the curve from the origin through the points
//     const curve = new CatmullRomCurve3(allPoints);
//     const tubeGeometry = new TubeGeometry(curve, 64, radius, 8, false);

//     // Update the tube geometry
//     beamRef.current.geometry = tubeGeometry;
//   }, [origin, points, radius, isOn]);

//   return (
//     <>
//       {/* Laser Beam */}
//       {isOn && (
//         <mesh ref={beamRef}>
//           <meshStandardMaterial
//             color={color}
//             emissive={color}
//             emissiveIntensity={2}
//             transparent
//             opacity={0.9}
//           />
//         </mesh>
//       )}

//       {/* Glow Effect */}
//       <EffectComposer>
//         <Bloom
//           intensity={glowIntensity}
//           luminanceThreshold={0.3}
//           luminanceSmoothing={0.9}
//         />
//       </EffectComposer>
//     </>
//   );
// }
