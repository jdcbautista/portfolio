import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import { Debug, useRapier, RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useKeyboardControls } from "@react-three/drei"
import { PlayerInputController } from './PlayerInputController';
import { useEventController } from '../Globals/EventController';
import CharacterAnimator from './CharacterAnimator';
import Rapier from "@dimforge/rapier3d-compat"

const CharacterController = (props) => {
  const { stateValues, updateStateValues, globalCanvasState, updateGlobalCanvasState } = useEventController();
  const {rapier, world} = useRapier();
  const [, get] = useKeyboardControls()
  
  const currentVelocity = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());

  const { camera, raycaster } = useThree();
  const direction = new THREE.Vector3();
  const rotation = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  const SPEED = 7;
  const JUMP_FORCE = 4;
  const SMOOTHING_FACTOR = 0.125;
  const MAX_VELOCITY = 10;

  const cameraHorizontalOffset = { x: 0, y: 0, z: 0 };
  const characterCamVerticalOffset = 0;
  const cameraLerpSpeed = 0.3;
  const freeRoamSpeed = 10;
  
  // const [isJumping, setIsJumping] = useState(false);
  const [renderPointerLock, setRenderPointerLock] = useState(true);
  
  const characterRigidBodyRef = useRef<RapierRigidBody>(null);
  const characterColliderRef = useRef();

  const freeRoamRef = useRef(null);
 
  const handleCharacterMode = () => {
    if (!characterRigidBodyRef.current) return;
      const { forward, backward, left, right, jump } = get()
      const velocity = characterRigidBodyRef.current.linvel()

      // updateGlobalCanvasState("characterRef", characterRigidBodyRef)
      
      // update camera
      const rigidBodyTranslation = characterRigidBodyRef.current.translation()
      // camera.position.set(rigidBodyTranslation.x, rigidBodyTranslation.y, rigidBodyTranslation.z)
      const desiredCameraPosition = new THREE.Vector3(
      rigidBodyTranslation.x + cameraHorizontalOffset.x,
      rigidBodyTranslation.y + characterCamVerticalOffset,
      rigidBodyTranslation.z + cameraHorizontalOffset.z
    );
      camera.position.lerp(desiredCameraPosition, cameraLerpSpeed);
      
      const characterRBCoord = characterRigidBodyRef.current.translation()
      // characterRigidBodyRef.current.userData.pos = [characterRBCoord.x.toFixed(1), characterRBCoord.y.toFixed(1), characterRBCoord.z.toFixed(1)]
      
        updateStateValues('characterPosition', [
      rigidBodyTranslation.x,
      rigidBodyTranslation.y,
      rigidBodyTranslation.z
    ]);
      updateStateValues('characterRotation', [
        camera.rotation.x,
        camera.rotation.y,
        camera.rotation.z
      ]);

    // movement
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)

    // Get camera's horizontal rotation (yaw) only
    // const yaw = camera.rotation.y;

      // Calculate camera's forward vector on the horizontal plane
    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    cameraForward.y = 0; // Ignore vertical component
    cameraForward.normalize();

      // Movement direction
    const moveForward = Number(forward) - Number(backward);
    const moveRight = Number(right) - Number(left);

    // Calculate camera's right vector
    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    direction
      .copy(cameraForward)
      .multiplyScalar(moveForward)
      .add(cameraRight.multiplyScalar(moveRight))
      .normalize()
      .multiplyScalar(SPEED);
      // .subVectors(frontVector, sideVector)
      // .normalize()
      // .multiplyScalar(SPEED)
      // .applyEuler(camera.rotation)                   // Original camera rotation
      // .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); // Apply yaw rotation only

    // Simple movement
    // characterRigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)
    
    characterRigidBodyRef.current.setLinvel({ 
      x: THREE.MathUtils.lerp(velocity.x, direction.x, SMOOTHING_FACTOR), 
      y: velocity.y, 
      z: THREE.MathUtils.lerp(velocity.z, direction.z, SMOOTHING_FACTOR)
    }, true)
    
        // jumping
    const maxToiColliderToGround = -1.5
    const ray = world.castRay(
      new Rapier.Ray(characterRigidBodyRef.current.translation(), { x: 0, y: -1, z: 0 }),
      maxToiColliderToGround,
      true,
      undefined,
      undefined,
      // filter out player capsule collider
      characterColliderRef.current[0],
    )
    const grounded = ray && ray.collider
    // if (jump && grounded) {
    if (jump) {
      console.log("JUMPING")
      characterRigidBodyRef.current.setLinvel({ x: 0, y: JUMP_FORCE, z: 0 }, true)
    }

  }
  //   const characterPosition = characterRigidBodyRef.current.translation();
  //   const cameraDirection = new THREE.Vector3();
  //   camera.getWorldDirection(cameraDirection);
    
  //   const cameraOffset = cameraDirection.clone()
  //   .normalize()
  //   .multiplyScalar(-characterCamDistance);
    
  //   const desiredCameraPosition = new THREE.Vector3(
  //     characterPosition.x + cameraOffset.x,
  //     characterPosition.y + characterCamVerticalOffset,
  //     characterPosition.z + cameraOffset.z
  //   );


    // const isGrounded = () => {
    //   if (!characterRigidBodyRef.current) return false;
 
    //     // Get the list of colliders in contact with the character
    //   const grounded = world.contactWith(characterRigidBody.handle).some((contact) => {
    //     const normal = contact.contactNormalAt(0); // Assuming a single contact point
    //     // Check if the contact normal is pointing upwards
    //     return normal.y > 0.7; // Adjust threshold as needed (1 = perfectly up)
    //   });
    //   return grounded;
    //   // const position = characterRigidBodyRef.current.translation() ?? { x: 0, y: 0, z: 0 };
    //   // const origin = position ? { x: position.x, y: position.y, z: position.z } : {x:0,y:0,z:0};
    //   // // Define the direction of the ray (downward)
    //   // const direction = { x: 0, y: -1, z: 0 };

    //   // const rayOrigin = new THREE.Vector3(position.x, position.y - 0.1, position.z); // Slightly below the character
    //   // const rayDirection = new THREE.Vector3(0, -1, 0); // Downward direction
    //   // raycaster.set(rayOrigin, rayDirection);
    
    //   // // Perform the raycast
    //   // const intersects = raycaster.intersectObjects(scene.children, true); // Replace 'scene.children' with the appropriate list of objects
    
    //   // // Check if there are intersections within a small distance threshold
    //   // for (const intersect of intersects) {
    //   //   if (intersect.distance <= 1.1) {
    //   //     return true;
    //   //   }
    //   // }
    
    //   return false;
    //   // const rayOrigin = new Vector3(position.x, position.y - 0.1, position.z);
    //   // const rayDirection = new Vector3(0, -1, 0); // Cast downwards
    
    //   // // Raycast using the world
    //   // const ray = new rapier.Ray(rayOrigin, rayDirection);
    //   // // Create a Rapier ray from the origin in the specified direction
    //   // // const ray = new rapier.Ray(origin, direction);
    //   // const ray = rapier.world.castRay(new THREE.Vector3(), direction, true);
    //   // // Perform the raycast with a maximum distance of 1.1
    //   // const hit = rapier.world.castRay(ray, 1.1, true);

    //   // // const ray = rapier.world.castRay(origin, direction, true);
    //   // // const hit = ray?.toi;
    //   // return hit !== null && hit.toi <= 1.1;
    //   // // return hit !== undefined && hit.toi <= 1.1;
    // };

    // camera.position.lerp(desiredCameraPosition, cameraLerpSpeed);

    // Calculate movement direction
    // frontVector.set(0, 0, Number(movement.backward) - Number(movement.forward));
    // sideVector.set(Number(movement.left) - Number(movement.right), 0, 0);
    // direction
    //   .subVectors(frontVector, sideVector)
    //   .normalize()
    //   .multiplyScalar(SPEED)
    //   .applyEuler(camera.rotation);

    // const currentVel = characterRigidBodyRef.current.linvel();
    // const grounded = isGrounded();

    // Handle jumping
    // if (movement.jump && grounded && !isJumping) {
    //   characterRigidBodyRef.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
    //   setIsJumping(true);
    // }

    // Apply movement
    // if (grounded) {
    //   characterRigidBodyRef.current.setLinvel({
    //     x: direction.x,
    //     y: currentVel.y,
    //     z: direction.z
    //   });
    // } else {
    //   // Apply less control in air
    //   characterRigidBodyRef.current.applyImpulse({ 
    //     x: direction.x * 0.2, 
    //     y: 0, 
    //     z: direction.z * 0.2 
    //   }, true);
    // }
    
    // Reset jump state when grounded
  //   if (grounded && currentVel.y <= 0) {
  //     setIsJumping(false);
  //   }

  //   // Update animation state if moving
  //   if (animationRef.current) {
  //     const isMoving = direction.length() > 0;
  //     // animationRef.current.setAnimation(isMoving ? 'walk' : 'idle');
  //   }

  //   updateStateValues('characterPosition', [
  //     characterPosition.x,
  //     characterPosition.y,
  //     characterPosition.z
  //   ]);
  //   updateStateValues('characterRotation', [
  //     camera.rotation.x,
  //     camera.rotation.y,
  //     camera.rotation.z
  //   ]);
  // };

  const handleFreeRoamMode = () => {
    if (!freeRoamRef.current) return;
    
    const moveSpeed = freeRoamSpeed / 60;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    frontVector.copy(cameraDirection).multiplyScalar(Number(movement.forward) - Number(movement.backward));
    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(cameraDirection, camera.up).normalize();
    sideVector.copy(rightDirection).multiplyScalar(Number(right) - Number(left));

    direction
      .addVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(moveSpeed);

    if (movement.jump) direction.y += moveSpeed;
    if (stateValues.crouch) direction.y -= moveSpeed;

    const currentPos = freeRoamRef.current.translation();
    freeRoamRef.current.setNextKinematicTranslation({
      x: currentPos.x + direction.x,
      y: currentPos.y + direction.y,
      z: currentPos.z + direction.z
    });

    camera.position.copy(new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z));

    updateStateValues('freeRoamPosition', [
      camera.position.x,
      camera.position.y,
      camera.position.z
    ]);
    updateStateValues('freeRoamRotation', [
      camera.rotation.x,
      camera.rotation.y,
      camera.rotation.z
    ]);
  };

  useFrame(() => {
    if (globalCanvasState.cameraMode !== 'manual') return;  
      if (globalCanvasState.manualMode === 'Character') {
        handleCharacterMode();

      } else if (globalCanvasState.manualMode === 'FreeRoam') {
        // handleFreeRoamMode();
      }
    // const rb = characterRigidBodyRef.current;
    // if (rb) {
    //   rb.userData.pos = rb.translation(); 
    // }
  });

  const handleUnlock = () => {
    updateGlobalCanvasState('cameraMode', 'track');
    updateGlobalCanvasState('manualMode', 'none');
    setRenderPointerLock(false);
    setTimeout(() => setRenderPointerLock(true), 1500);
  };

  return (
    <group>
      <RigidBody
        {...props}
        ref={characterRigidBodyRef}
        // colliders={"false"}
        // mass={1}
        density={1}
        type="dynamic"
        linearDamping={0.5}
        angularDamping={.5}
        position={props.position || [0,.25, 0]}
        // position={[-2,.25, -2]}
        enabledRotations={[false, true, false]}
        friction={0}
        restitution={1}
        collider={"capsule"}
        name={"player"}
        userData={"player"}
        // userData={{
        //   isPlayer:true,
          
        // }}
        // onCollisionEnter={handleContactStart}
        // onCollisionExit={handleContactEnd}
      >
        {/* <CapsuleCollider
        ref={characterColliderRef}
        args={[0.5, 0.5]} // Adjust size as needed
        // sensor
        // position={[0, -0.5, 0]} // Positioned slightly below the main body
      /> */}
        <CapsuleCollider
          ref={characterColliderRef}
          args={[0.09, 0.36]} // Adjusted for a shorter height and radius
          position={[0, -0.3, 0]} // Ensures the bottom of the capsule touches the ground
          // contactSkin={}
          sensor={true}
        />
        {/* <CapsuleCollider
          ref={characterColliderRef}
          args={[0.05, 0.25]} // Adjusted for a shorter height and radius
          position={[0, -0.3, 0]} // Ensures the bottom of the capsule touches the ground
          // contactSkin={}
        /> */}
        {/* <CapsuleCollider args={[0.5, 0.5]} /> */}
        {/* <CharacterAnimator ref={animationRef} /> */}
        <mesh castShadow position={[0,-.25,0]}>
          {/* <capsuleGeometry args={[0.3, .5]} /> */}
          <sphereGeometry args={[.2, 32, 32]}/>
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </RigidBody>

      {/* <RigidBody
        ref={freeRoamRef}
        position={props.position || [0, 1, 0]}
        type="kinematicPosition"
        colliders={false}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody> */}

      {renderPointerLock && (
        <PointerLockControls
          selector="#toggleCursorLock"
          onUnlock={handleUnlock}
          minPolarAngle={stateValues.projectionType === "perspective" 
            ? THREE.MathUtils.degToRad(0) 
            : THREE.MathUtils.degToRad(100)}
        />
      )}
    </group>
  );
};

export default CharacterController;