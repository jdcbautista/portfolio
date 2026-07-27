// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// import { useBox } from '@react-three/cannon';
// import BasicBox from './BasicBox.tsx';
// import BasicBoundary from './BasicBoundary.tsx';
// import BasicWall from './BasicWall.tsx';
import BulkWallComposer from './BulkWallComposer.tsx';
// import BasicFloor from './BasicFloor.tsx';
// import BasicPainting from './BasicPainting.tsx';

interface WallObjects {
    type: string;                           // Object type (door/window, canvas, stageProp, eventTrigger) to specify which script to call
    // name: string | null | empty;                    // Optional value 
    scale : number | null;
    objectOffsets: [number,number] | null;
    objectParams:   doorParams
                    | canvasParams
                    | stagePropParams
                    | eTriggerParams;      // Key value pairs with properties specific to necessary component
  }

  interface AdvancedRoomSectionWallProps {
    wid: number | null ;
    collectionName: string | null;
    type: string;                                   // string, n,e,s,w
    intSegments: number[];                          // List of numbers.  Individual values over sum of values determines weight (ex: For a wall [1,1], sum = 2.
    extSegments: number[];                          // 1/2 = .5, therefore each wall is .5 width of the total wall.
                                                    // For wall [1,2] Segment 1 = 1/3 or .33 and wall 2 = .66
    // edgeOffsets: [number,number] | null;
    wallColor: string | null;                       // Wall color (SectionWall overrides RoomWall color)
    interiorWallObjects: WallObjects[] | null;      // Wall objects to generate
    exteriorWallObjects: WallObjects[] | null;      // Wall objects to generate
    wallHeightOverride: number | null;              // If we want to override section wall heightK
    sidePadDivisor: number | null;
    manualOffsets: [[number,number],[number,number]] | null;  // Vector 2 for additional left right padding
  }

  interface AdvancedRoomSectionProps {
    sid: number | null;
    description: string | null;

    area: [number, number];                 // [Width (EW), Depth (NS)]
    position: [number, number, number];     // Offset from Room position
    sectionColor: string;                   // Wall color (SectionWall overrides RoomWall color)

    walls: AdvancedRoomSectionWallProps[];  // Wall objects to generate
    wallThickness: number | null;
    sectionHeight: number;                  // Default wall height
    floorColor: string | null;              // Color or hexadecimal RGB color value
    floorObjects: FloorObjects[] | null;    // Floor objects to generate... In the case of stairs, this will need to line up with a stairs
                                            // object on the connecting floor
  }

interface AdvancedRoomProps {
    // area: [number, number] | null;       // Originally optional param that if left blank would be calculated from subSections
                                            // and could be passed in to indicate walls around parameter... But it makes more sense
                                            // to just treat parameters as roomSections that can be nested into one another.
    sections: AdvancedRoomSectionProps[];   // list of sections
    position: [number, number, number];     // Offset from World Origin position
    floorLevel: number | null;              // Default 0 = ground level... If above 0, will need to retrieve stair/elevator coordinates
  }

const BulkWallComposer = ({ ...props }: AdvancedRoomProps) => {

  return (
    <group>

        {props.sections.map((section, sIndex) => (<group key={sIndex}>
          {section.walls.map((wall, wIndex) => (
            <group key={wIndex}>
            <BulkWallComposer
              key={wIndex}
              intSegments={wall.intSegments}
              extSegments={wall.extSegments}
              interiorWallObjects={wall.interiorWallObjects}
              exteriorWallObjects={wall.exteriorWallObjects}
              className={wall.type}
              wallHeight={section.sectionHeight}
              wallXLength={ wall.type === "north" || wall.type === "south" ? section.area[0] : section.wallThickness?section.wallThickness:.25 }
              wallZLength={ wall.type === "north" || wall.type === "south" ? section.wallThickness?section.wallThickness:.25 : section.area[1]}
              interiorPos={ wall.type === "north" || wall.type === "west" ? 1 : -1}
              segmentDir={ wall.type === "north" || wall.type === "east" ? 1 : -1}
              position={
                wall.type === "east" ? [
                  props.position[0] + section.position[0] + (section.area[0]/2 - (section.wallThickness?section.wallThickness/2:.125)),
                  props.position[1] + section.position[1] + 0,
                  props.position[2] + section.position[2] + 0] :
                wall.type === "west" ? [
                  props.position[0] + section.position[0] + (-1 * (section.area[0]/2 - (section.wallThickness?section.wallThickness/2:.125))),
                  props.position[1] + section.position[1] + 0,
                  props.position[2] + section.position[2] + 0] : 
                wall.type === "south" ? [
                  props.position[0] + section.position[0] + 0,
                  props.position[1] + section.position[1] + 0,
                  props.position[2] + section.position[2] + (1 * (section.area[1]/2 - (section.wallThickness?section.wallThickness/2:.125)))] : [
              // wall.type === "west"
                  props.position[0] + section.position[0] + 0,
                  props.position[1] + section.position[1] + 0,
                  props.position[2] + section.position[2] + (-1 * (section.area[1]/2 - (section.wallThickness?section.wallThickness/2:.125)))] 
              }
              sidePadDivisor={wall.sidePadDivisor}
              // edgeOffsets={wall.edgeOffsets}
              manualOffsets={wall.manualOffsets} 
              // color="#ddeeff"
              />
              </group>
          ))}
          </group>
      ))}
    </group>
  );
};

export default BulkWallComposer;
