/* eslint-disable @typescript-eslint/no-unused-vars */
import { useBox } from '@react-three/cannon';
import { useGLTF, useFBX, Sparkles } from '@react-three/drei';

const EChair = ({ ...props }) => {
//   const { nodes, materials } = useFBX('./objects/EChair.fbx');
  const EChairFBX = useFBX('./objects/EChair.fbx');
//   const fbx = useFBX('/model-low-poly-dude.fbx')
  const [ref] = useBox(() => ({
    type: 'Static',
    mass: 1,
    args: props.args,
    position: props.position,

    ...props,
  }));

  const EChairObject = () => {  return <primitive position={[props.position[0],props.position[1],props.position[2]]} scale={[1, 1, 1]} object={EChairFBX} dispose={null} /> }

  return (
    // @ts-expect-error: Generic ref expected
    <group ref={ref} {...props} dispose={null}>
      <EChairObject />
    </group>
  );
};

export default EChair;
