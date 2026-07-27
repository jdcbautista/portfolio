// // import React, { useRef } from "react";
// // import { Canvas, extend, useThree, useFrame } from "react-three-fiber";
// import { useThree } from "@react-three/fiber";
// import {
//   CubeTextureLoader,
//   // CubeCamera,
//   // WebGLCubeRenderTarget,
//   // RGBFormat,
//   // LinearMipmapLinearFilter,
// } from "three";
// // import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// // import "./styles.css";
// // import { Sky } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// // extend({ OrbitControls });

// // Loads the skybox texture and applies it to the scene.
// function SkyBox() {
//   const { scene } = useThree();
//   const loader = new CubeTextureLoader();

// //   scene.backgroundRotation.x += 1 * delta
// //   scene.backgroundRotation.y += 0.5 * delta



// useFrame((_, delta) => {
//     scene.backgroundRotation.x += 0.01 * delta;
//     scene.backgroundRotation.y += 0.005 * delta;
// });

// // The CubeTextureLoader load method takes an array of urls representing all 6 sides of the cube.
// const texture = loader.load([
//     "/textures/skybox/space01/1.jpg",
//     "/textures/skybox/space01/2.jpg",
//     "/textures/skybox/space01/3.jpg",
//     "/textures/skybox/space01/4.jpg",
//     "/textures/skybox/space01/5.jpg",
//     "/textures/skybox/space01/6.jpg",
// ]);

//   // Set the scene background property to the resulting texture.
//   scene.background = texture;
//   return null;
// }

// export default SkyBox;