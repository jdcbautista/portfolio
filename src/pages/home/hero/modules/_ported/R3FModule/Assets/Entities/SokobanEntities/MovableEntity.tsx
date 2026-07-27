import React, { useMemo, useRef, useEffect, useState } from 'react';
import { CuboidCollider, InstancedRigidBodies, RigidBody, RigidBodyApi, RigidBodyProps } from '@react-three/rapier';
import { InstancedMesh } from 'three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { Ray, QueryPipeline, RigidBodySet, ColliderSet } from '@dimforge/rapier3d-compat';


interface MovableEntityProps {
  geometry: 'box' | 'prism';
  positions: [number, number, number][];
  size: [number, number, number];
  color: string;
  behavior: 'pushable' | 'reflective';
  snapToGrid?: boolean; // New property for grid snapping
  gridSize?: number; // Grid size for snapping
  onCollide?: (e: any) => void;
  cornerRadius?: number; // New prop for rounded corners
  rigidBodyScale?: number; // New prop for rigidbody scaling
  segments?: number; // New prop for controlling roundness quality
}

const MovableEntity: React.FC<MovableEntityProps> = ({
  geometry,
  positions,
  size,
  color,
  behavior,
  snapToGrid = false,
  gridSize = 1,
  onCollide,
  cornerRadius = 0.025, // Default corner radius
  rigidBodyScale = 0.98, // Default rigidbody scale (90% of mesh size)
  segments = 4, // Default segments for rounded corners
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const rigidBodiesRef = useRef<RigidBodyApi[]>([]);
  const { physics, rapier, world } = useRapier()
  // console.log(QueryPipeline)
  // console.log('World methods:', Object.getOwnPropertyNames(QueryPipeline));
// Also check the raw world
// console.log('Raw world:', world.raw);
  // useFrame(() => {
  //   rigidBodiesRef.current.forEach((rigidBody, index) => {
  //     if (rigidBody && textRefs.current[index]) {
  //       const { x, y, z } = rigidBody.translation();
  //       textRefs.current[index]?.position.set(x, y + size[1] / 2 + 0.05, z);
  //     }
  //   });
  // });
const ray = useRef(new THREE.Object3D());
  const instances = useMemo(() => {
    return positions.map((position, i) => ({
      key: `instance_${i}`,
      position,
      rotation: [0, 0, 0],
      scale: [
        size[0] * rigidBodyScale,
        size[1] * rigidBodyScale,
        size[2] * rigidBodyScale
      ],
      name: "box"
      // userData: {isBox:true},
    }));
  }, [positions, size, rigidBodyScale]);

  const textRefs = useRef<(THREE.Object3D | null)[]>([]);
  const [labels, setLabels] = useState(
    positions.map((position) => `(${position[0]}, ${position[2]})`)
  );

  const moveRigidBodyWithDirection = (rigidBody, direction) => {
    rigidBody.userData = "moving"; // Mark the box as moving
    const { x, y, z } = rigidBody.translation();
    // Target position based on direction
    const target = { x, y, z };
    switch (direction) {
      case 'x+':
        target.x += 1;
        break;
      case 'x-':
        target.x -= 1;
        break;
      case 'z+':
        target.z += 1;
        break;
      case 'z-':
        target.z -= 1;
        break;
      default:
        return; // Invalid direction
    }
  
    let animationFrame;
    const lerpFactor = 0.1; // Adjust for speed
  
    const animate = () => {
      const current = rigidBody.translation();
      const nextX = THREE.MathUtils.lerp(current.x, target.x, lerpFactor);
      const nextY = THREE.MathUtils.lerp(current.y, target.y, lerpFactor);
      const nextZ = THREE.MathUtils.lerp(current.z, target.z, lerpFactor);
  
      rigidBody.setTranslation({ x: nextX, y: nextY, z: nextZ }, true);
  
      // Stop when close enough to the target
      if (
        Math.abs(nextX - target.x) < 0.01 &&
        // Math.abs(nextY - target.y) < 0.01 &&
        Math.abs(nextZ - target.z) < 0.01
      ) {
        rigidBody.setTranslation(target, true); // Snap to the exact target
        cancelAnimationFrame(animationFrame); // End animation
        rigidBody.userData=("idle")
        console.log("FINISHED, resetting to ", rigidBody.userData)
      } else {
        animationFrame = requestAnimationFrame(animate); // Continue animating
      }
    };
  
    animate();
  }
  // Reset collision data
  // const resetCollisionData = (collisionInfo) => {
  //   collisionInfo.colliding = false;
  //   collisionInfo.collisionStart = 0;
  //   collisionInfo.pushDirection = 'none';
  // };
  

  ////////////////////////////////////////////////////////////////////////////

  // Check if can move
  const attemptMove = (targetRb: typeof RigidBody, direction: string) => {
    //Check target space
    const destination = getDestinationCoordinates(targetRb, direction); // Pass both parameters
  
    if (destination && !isDestinationOccupied(destination)) {
    // if (destination) {
      
      moveRigidBodyWithDirection(targetRb, direction);
    }
  };

  //Check target space
  const getDestinationCoordinates = (rigidBody: RigidBody, direction: string) => {
    // console.log("getDestinationCoordinates called with:", direction);
  const { x: xt, y: yt, z: zt } = rigidBody.translation();

    switch (direction) {
      case "z+":
        return { x: xt, y: yt, z: zt + 1 };
      case "z-":
        return { x: xt, y: yt, z: zt - 1 };
      case "x+":
        return { x: xt + 1, y: yt, z: zt };
      case "x-":
        return { x: xt - 1, y: yt, z: zt };
      default:
        return null;
    }
  };
  
  const isDestinationOccupied = (destination) => {
    console.log("CHECKING FOR ENTITY AT " ,destination)
    const rayOrigin = new THREE.Vector3(destination.x, destination.y + 0.5, destination.z);
    const rayDirection = new THREE.Vector3(0, -1, 0).normalize(); // Pointing up
    // console.log(world.bodies())
    // console.log(world)

    const ray = new rapier.Ray(
      { x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z },
      { x: rayDirection.x, y: rayDirection.y, z: rayDirection.z }
    )
    // Maximum distance to check
    const maxToi = 10

    console.log('Ray origin:', rayOrigin);
  
    // Perform raycast using the world
    const hit = world.castRay(ray, maxToi, true); // `true` means solid

    if (hit) {
      const collider = hit.collider;
      const toi = hit.toi || 0; // Time of impact

      if (collider && toi !== undefined) {
        const hitPoint = {
          x: rayOrigin.x + rayDirection.x * toi,
          y: rayOrigin.y + rayDirection.y * toi,
          z: rayOrigin.z + rayDirection.z * toi,
        };

        const resultObject = collider.parent()?.translation() as {x: a, y:number, z:number}
        console.log(`Collider ${collider.handle} hit at point ${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}`);
        console.log(collider.handle)
        console.log(`Origin Y ${destination.y} - Result Y ${resultObject.y} = ${destination.y - resultObject.y}`)

        const difference = destination.y - resultObject.y

        if (difference < .5){
          return true
        }
      } else {
        console.log('Hit detected but missing collider or toi.');
      }
    } else {
      console.log('No collision detected');
    }
  

  return false;

    
};



  const handleCollision = ({ target, other }: { target: Collider, other: Collider }) => {
    if (!target.rigidBody || !other.rigidBody) return;
    // console.log(target)
    // console.log(other.rigidBody)


    
    if (other.rigidBody.userData==="player" && target.rigidBody.userData!=="moving") {
      const targetRb = target.rigidBody;
      const otherRb = other.rigidBody;
  
      const { x: xt, y: yt, z: zt } = targetRb.translation();
      const { x: xo, y: yo, z: zo } = otherRb.translation();
  
      const isCloseX = Math.abs(xt - xo) <= 0.33;
      const isCloseZ = Math.abs(zt - zo) <= 0.33;

      // target.rigidBody.userData=("moving")
      // console.log(
      //   `This: (${xt.toFixed(1)}, ${yt.toFixed(1)}, ${zt.toFixed(1)}),\n Other: (${xo.toFixed(1)}, ${yo.toFixed(1)}, ${zo.toFixed(1)})`
      // );
      if (isCloseX) {
        console.log("MOVING")
        attemptMove(targetRb, zt > zo ? 'z+' : 'z-');
        // moveRigidBodyWithDirection(targetRb, zt > zo ? 'z+' : 'z-');
      } else if (isCloseZ) {
        // target.rigidBody.userData=("moving")
        console.log("MOVING")
        attemptMove(targetRb, xt > xo ? 'x+' : 'x-');
        // moveRigidBodyWithDirection(targetRb, xt > xo ? 'x+' : 'x-');
      }


      
      // // Check proximity in X-axis
      // if (Math.abs(xt - xo) <= 0.33) {
      //   if (zt > zo) {
      //     console.log("MOVING Z DOWN");
      //     moveRigidBody(targetRb, { x: xt, y: yt, z: zt + 1 });
      //   } else if (zt < zo) {
      //     console.log("MOVING Z UP");
      //     moveRigidBody(targetRb, { x: xt, y: yt, z: zt - 1 });
      //   }
      // }
  
      // // Check proximity in Z-axis
      // if (Math.abs(zt - zo) <= 0.33) {
      //   if (xt > xo) {
      //     console.log("MOVING X RIGHT");
      //     moveRigidBody(targetRb, { x: xt + 1, y: yt, z: zt });
      //   } else if (xt < xo) {
      //     console.log("MOVING X LEFT");
      //     moveRigidBody(targetRb, { x: xt - 1, y: yt, z: zt });
      //   }
      // }
    }
    
  };
  
  // // Helper to check if there's a box at a given destination
  // const isBoxAtDestination = (x: number, y: number, z: number) => {
  //   const allRigidBodies = /* Get all rigid bodies in your scene */;
  //   return allRigidBodies.some(rb => rb.userData?.isBox && isPositionMatch(rb.translation(), { x, y, z }));
  // };
  
  // Helper to check if two positions match
  // const isPositionMatch = (pos1: { x: number, y: number, z: number }, pos2: { x: number, y: number, z: number }) => {
  //   return Math.abs(pos1.x - pos2.x) < 0.1 && Math.abs(pos1.y - pos2.y) < 0.1 && Math.abs(pos1.z - pos2.z) < 0.1;
  // };
  
  // Helper to move the rigid body smoothly using lerp
  const moveRigidBody = (rigidBody: RigidBody, targetPosition: { x: number, y: number, z: number }) => {
    rigidBody?.setTranslation(targetPosition, true)
    // const startPosition = rigidBody.translation();
    // const duration = 1; // in seconds
    // let elapsedTime = 0;
  
    // const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
    // const move = () => {
      
    //   elapsedTime += 1 / 60; // Assuming 60 FPS
    //   const t = Math.min(elapsedTime / duration, 1); // Clamp t to [0, 1]
  
    //   rigidBody.setTranslation({
    //     x: lerp(startPosition.x, targetPosition.x, t),
    //     y: lerp(startPosition.y, targetPosition.y, t),
    //     z: lerp(startPosition.z, targetPosition.z, t),
    //   }, true);
  
    //   if (t < 1) {
    //     requestAnimationFrame(move);
    //   }
    // };
  
    // move();
  };

  useFrame(() => {
    // Update positions and text labels
    const updatedLabels = rigidBodiesRef.current.map((rigidBody, index) => {
      if (rigidBody && textRefs.current[index]) {
        const { x, y, z } = rigidBody.translation();

        // Update text position to stay tied to the object
        textRefs.current[index]?.position.set(
          x,
          y + size[1] / 2 + 0.05, // Slightly above the object
          z
        );

        // Return the updated label content
        return `(${x.toFixed(1)}, ${z.toFixed(1)})`;
      }
      return labels[index]; // Preserve the old label if no rigid body
    });

    setLabels(updatedLabels); // Update state with the new labels
  });

  return (
    <>
      <InstancedRigidBodies
        instances={instances}
        // instances={instances.map((_, index) => ({
        //   position: [...],
        //   rotation: [...],
        //   userData: { isBox: true }, // Lightweight and non-conflicting
        // }))}
        type={behavior === 'pushable' ? 'dynamic' : 'fixed'}
        ref={rigidBodiesRef}
        enabledRotations={[false, false, false]}
        enabledTranslations={[false, true, false]}
        density={0.25}
        restitution={0.5}
        friction={0}
        linearDamping={0}
        angularDamping={0}
        colliders="cuboid"
        contactSkin={0.01}
        // ADDED collision detection callback below:
        userData={"idle"}
        onCollisionEnter={handleCollision}
        
      >
        <instancedMesh
          ref={meshRef}
          args={[null, null, positions.length]}
          castShadow
          frustumCulled={false}
          matrixAutoUpdate={true}
          // name={"box"}
          // userData={{ isBox: false }}
        >
          {geometry === 'box' && <boxGeometry args={size} />}

          {/* PLACEHOLDER DO NOT DELETE
          {geometry === 'prism' && (
            <bufferGeometry attach="geometry" {...createPrismGeometry(size)} />
          )} */}
          <meshStandardMaterial color={color} />
        </instancedMesh>
      </InstancedRigidBodies>

      {/* Render text labels */}
      {positions.map((position, index) => (
        <Text
          key={`text-${index}`}
          ref={(ref) => (textRefs.current[index] = ref)}
          position={[
            position[0],
            position[1] + size[1] / 2 + 0.05,
            position[2],
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
          font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {labels[index]}
        </Text>
      ))}
    </>
  );
};

export default MovableEntity;
