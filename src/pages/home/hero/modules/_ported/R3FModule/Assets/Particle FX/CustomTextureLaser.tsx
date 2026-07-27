

// import { useRef, useEffect } from "react";
// import { useFrame } from "@react-three/fiber";
// import { Vector3, TubeGeometry, CatmullRomCurve3, ShaderMaterial } from "three";
// import * as THREE from 'three';

// export default function LaserBeam({
//   origin,
//   points,
//   color = "red",
//   radius = 0.1,
//   isOn = false,
//   glowIntensity = 2.0,
// }) {
//   const beamRef = useRef();

//   const glowMaterial = new ShaderMaterial({
//     uniforms: {
//       glowColor: { value: new THREE.Color(color) },
//       intensity: { value: glowIntensity },
//     },
//     vertexShader: `
//       varying vec3 vNormal;
//       void main() {
//         vNormal = normalize(normalMatrix * normal);
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `,
//     fragmentShader: `
//       varying vec3 vNormal;
//       uniform vec3 glowColor;
//       uniform float intensity;
//       void main() {
//         float glow = pow(max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), intensity);
//         gl_FragColor = vec4(glowColor * glow, 1.0);
//       }
//     `,
//     transparent: true,
//     blending: THREE.AdditiveBlending,
//   });

//   useEffect(() => {
//     if (!isOn || points.length === 0) return;

//     const allPoints = [origin, ...points];
//     const curve = new CatmullRomCurve3(allPoints);
//     const tubeGeometry = new TubeGeometry(curve, 64, radius, 8, false);

//     beamRef.current.geometry = tubeGeometry;
//     beamRef.current.material = glowMaterial;
//   }, [origin, points, radius, isOn]);

//   return (
//     <>
//       {isOn && <mesh ref={beamRef} />}
//     </>
//   );
// }
