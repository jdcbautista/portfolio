// PropObjectTypes.ts

export interface PropObject {
  /** Unique key required by your GeometryInstantiator for each object. */
  key: string;

  position: [number, number, number];
  args: [number, number, number];
  color: string;

  opacity?: number;
  renderTopOnly?: boolean;
  type?: 'Static' | 'Dynamic';
  friction?: number;
  mass?: number;
  triggerOnly?: boolean;
  onCollide?: (e: { entity: string }) => void;
  selectable?: boolean;
  specialProps?: string[];
  slopeGeometry?: {
    direction: 'NS' | 'SN' | 'EW' | 'WE' | 'NESW' | 'NWSE' | 'SWNE' | 'SENW';
    angle: number;
    heightDifference: number;
  };
  slopedTileYOffset: number;
}
