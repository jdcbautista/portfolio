// import { useRef, useEffect } from "react";
// import { useFrame, extend, useThree } from "@react-three/fiber";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// import { Vector3, TubeGeometry, CatmullRomCurve3 } from "three";

// extend({ EffectComposer, UnrealBloomPass, RenderPass });

// export default function UnreallBloomPassLaserBeam({
//   origin,
//   points,
//   color = "red",
//   radius = 0.1,
//   isOn = false,
//   glowIntensity = 1.5,
// }) {
//   const beamRef = useRef();
//   const composerRef = useRef();
//   const { scene, camera, gl } = useThree();

//   useEffect(() => {
//     if (!isOn || points.length === 0) return;

//     const allPoints = [origin, ...points];
//     const curve = new CatmullRomCurve3(allPoints);
//     const tubeGeometry = new TubeGeometry(curve, 64, radius, 8, false);

//     beamRef.current.geometry = tubeGeometry;
//   }, [origin, points, radius, isOn]);

//   useEffect(() => {
//     const composer = new EffectComposer(gl);
//     const renderPass = new RenderPass(scene, camera);
//     const bloomPass = new UnrealBloomPass(undefined, glowIntensity, 0.5, 0.3);

//     composer.addPass(renderPass);
//     composer.addPass(bloomPass);
//     composerRef.current = composer;
//   }, [gl, scene, camera, glowIntensity]);

//   useFrame(() => {
//     if (composerRef.current) {
//       composerRef.current.render();
//     }
//   });

//   return (
//     <>
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
//     </>
//   );
// }
