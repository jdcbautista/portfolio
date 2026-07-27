import WallComposer from './WallComposer';

const RoomComposer = ({ sections, position }) => {
  const [instancePool, setInstancePool] = useState({
    walls: [],
    mouldings: [],
    boundaries: [],
  });

  const addToInstancePool = (type, instanceData) => {
    setInstancePool((prevPool) => ({
      ...prevPool,
      [type]: [...prevPool[type], instanceData],
    }));
  };
  

  return (
    <group>
      {sections.map((section, sIndex) => (
        <group key={sIndex}>
          {section.walls.map((wall, wIndex) => (
            <WallComposer
              key={wIndex}
              {...wall}
              position={[
                position[0] + section.position[0],
                position[1] + section.position[1],
                position[2] + section.position[2],
              ]}
              addInstance={addToInstancePool}
            />
          ))}
        </group>
      ))}

      {/* Render all instances */}
      <Instantiator instancePool={instancePool} />
    </group>
  );
};

export default RoomComposer;
