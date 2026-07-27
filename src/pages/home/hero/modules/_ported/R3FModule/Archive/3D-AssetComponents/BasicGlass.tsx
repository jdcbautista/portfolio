/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'

// import { Suspense } from 'react'
// import { Canvas } from '@react-three/fiber'
// import { useGLTF, MeshTransmissionMaterial, Environment, Loader, OrbitControls } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
// import { MeshPhysicalMaterial } from 'three'

const BasicGlass = ({ ...props }) => {
    const [ref] = useBox(() => ({
        type: 'Static',
        friction: 1,
        mass: 1,
        onCollide: (e) => {
          console.log(e);
        },
        ...props,
      }));
    
        // const { nodes } = useGLTF('./objects/suzanne-draco.glb')
        // const { nodes } = useBox('./objects/suzanne-draco.glb')
        // const materialProps = ({
        //   thickness: { value: 5, min: 0, max: 20 },
        //   roughness: { value: 0, min: 0, max: 1, step: 0.1 },
        //   clearcoat: { value: 1, min: 0, max: 1, step: 0.1 },
        //   clearcoatRoughness: { value: 0, min: 0, max: 1, step: 0.1 },
        //   transmission: { value: 1, min: 0.9, max: 1, step: 0.01 },
        //   ior: { value: 1.25, min: 1, max: 2.3, step: 0.05 },
        //   envMapIntensity: { value: 25, min: 0, max: 100, step: 1 },
        //   color: '#ffffff',
        //   attenuationTint: '#ffe79e',
        //   attenuationDistance: { value: 0, min: 0, max: 1 }
        // })

        const materialProps = {
                transmission: 1.0,
                roughness: 0.2,
                metalness: 0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.25,
                color: new THREE.Color(0x88bbff),
                ior: 1,
                thickness: 6.0
        }

        return (
                <mesh castShadow position={props.position} >
                <boxGeometry args={props.args} />
                {props.color == "invisible" ? <meshPhongMaterial color="#ff0000" opacity={0.0} transparent /> :
                <meshPhysicalMaterial {...materialProps} />
                }
            </mesh>
        )
    }

    export default BasicGlass;
