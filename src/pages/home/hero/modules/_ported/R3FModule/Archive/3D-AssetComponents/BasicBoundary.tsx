import { useBox } from '@react-three/cannon';

const BasicBoundary = ({ ...props }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    mass: 1,
    onCollide: (e) => {
      console.log(e);
    },
    ...props,
  }));

  return (
    // @ts-expect-error: Ref must be generic
    <mesh position={props.position} ref={ref}>
      <boxGeometry args={props.args} />
      <meshPhongMaterial color="#ff0000" opacity={0.00} transparent />
    </mesh>
  );
};

export default BasicBoundary;
