// import { useEffect, useRef } from 'react';
// import { useGLTF } from '@react-three/drei';
// import {  } from '@react-three/fiber';
// import * as THREE from 'three';

// // Preload the model
// useGLTF.preload('/models/Avatar.glb');

// // Animation state mapping
// const ANIMATION_MAPPING = {
//   'idle': 'FighterIdle',
//   'run': 'Run',
//   'jump': 'JumpUp',
//   // Add more mappings as needed
// };

// // GLTF Parser Type
// type GLTFParser = {
//   json: Record<string, unknown>;
//   associations: Map<unknown, unknown>;
//   getDependency: (type: string, index: number) => Promise<unknown>;
//   getDependencies: (type: string) => Promise<unknown[]>;
// };

// interface GLTFResult {
//   animations: THREE.AnimationClip[];
//   scene: THREE.Group;
//   scenes: THREE.Group[];
//   cameras: THREE.Camera[];
//   asset: {
//     copyright?: string;
//     generator?: string;
//     version?: string;
//     minVersion?: string;
//     extensions?: Record<string, unknown>;
//     extras?: unknown;
//   };
//   parser: GLTFParser;
//   userData: Record<string, unknown>;
// }

// const CharacterAnimator = ({
//   characterRef,
//   modelPath,
//   animationState,
// }: {
//   characterRef: React.MutableRefObject<THREE.Object3D | null>;
//   modelPath: string;
//   animationState: string;
// }) => {
//   console.log('CharacterAnimator: Attempting to load model from:', modelPath);
  
//   const gltf = useGLTF(modelPath) as GLTFResult;
//   console.log('GLTF Load Result:', {
//     hasScene: !!gltf.scene,
//     animationCount: gltf.animations?.length,
//     animations: gltf.animations?.map(a => a.name)
//   });

//   const mixer = useRef<THREE.AnimationMixer | null>(null);
//   const actions = useRef<Record<string, THREE.AnimationAction>>({});
//   const currentAction = useRef<THREE.AnimationAction | null>(null);


//   useEffect(() => {
//     console.log('Scene Load Effect:', {
//       hasScene: !!gltf.scene,
//       hasCharacterRef: !!characterRef.current
//     });

//     if (!gltf.scene || !gltf.animations.length) {
//       console.error('Failed to load model or animations:', {
//         modelPath,
//         scene: !!gltf.scene,
//         animationCount: gltf.animations?.length
//       });
//       return;
//     }

//     // Initialize Animation Mixer
//     mixer.current = new THREE.AnimationMixer(gltf.scene);
//     console.log('Created animation mixer');

//     // Store animations in a map for easy access
//     gltf.animations.forEach((clip) => {
//       const action = mixer.current?.clipAction(clip);
//       if (action) {
//         actions.current[clip.name.toLowerCase()] = action;
//         console.log('Added animation:', clip.name);
//       }
//     });

//     // Attach the model to the character reference
//     if (characterRef.current) {
//       characterRef.current.add(gltf.scene);
//       console.log('Attached model to character reference');
//     } else {
//       console.error('Character reference is null');
//     }

//     return () => {
//       mixer.current?.stopAllAction();
//       if (characterRef.current) {
//         characterRef.current.remove(gltf.scene);
//       }
//     };
//   }, [gltf.scene, gltf.animations, characterRef, modelPath]);

//   useEffect(() => {
//     // console.log('Animation State Effect:', {
//     //   currentState: animationState,
//     //   availableActions: Object.keys(actions.current)
//     // });
    
//     // const action = actions.current[animationState.toLowerCase()];

//     const mappedAnimationName = ANIMATION_MAPPING[animationState] || animationState;
//     const action = actions.current[mappedAnimationName];

//     if (!action) {
//       // console.warn('No animation found for state:', animationState);
//       console.warn(`No animation found for state: ${animationState} (mapped to: ${mappedAnimationName})`);
//       console.log('Available animations:', Object.keys(actions.current));
//       return;
//     }

//     // Transition between animations
//     Object.values(actions.current).forEach((otherAction) => {
//       if (otherAction !== action) otherAction.fadeOut(0.2);
//     });
//     action.reset().fadeIn(0.2).play();
//   }, [animationState]);

//   ((_, delta) => {
//     mixer.current?.update(delta);
//   });

//   return (null);
// };

// export default CharacterAnimator;