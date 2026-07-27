import { Environment } from '@react-three/drei'

const StageLights = () => {
  return (
    <group>
      {/* <ambientLight
        intensity={-.25}
        
      /> */}
      <spotLight
        intensity={12.25}
        angle={0.2}
        penumbra={1}
        position={[5, 15, 10]} />
      <Environment preset="park" background blur={0.6} />
      {/* <pointLight
        position={[6,4,6]}
        // distance={50}
        intensity={.00125}
        castShadow
        decay={-10.125}
        /> */}
      <pointLight
        position={[9,4,9]}
        // distance={50}
        intensity={.00125}
        castShadow
        decay={-10.125}
        />
      <directionalLight
        position={[15,10,15]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1000}
        shadow-mapSize-height={1000}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        />
       {/* <directionalLight position={[15,10,15]} intensity={2} castShadow shadow-mapSize-width={1000}
       shadow-mapSize-height={1000} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50}/> */}
    </group>
  );
};

export default StageLights;
