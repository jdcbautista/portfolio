import React from 'react';

// Lazy loading canvases
const ArtGalleryCanvas = React.lazy(() => import('./ArtGalleryCanvas'));
const TacticalBoardCanvas = React.lazy(() => import('./TacticalBoardCanvas'));
const SokobanCanvas = React.lazy(() => import('./SokobanCanvas'));

interface Canvas {
  id: number;
  name: string;
  component: React.ElementType; // Dynamically typed component
}

// Return the list of canvases
const R3FCanvasIndex = (): Canvas[] => {
  return [
    { id: 0, name: 'Art Gallery', component: ArtGalleryCanvas },
    { id: 1, name: 'Tactical Board', component: TacticalBoardCanvas },
    { id: 2, name: 'Sokoban Game', component: SokobanCanvas },
  ];
};

export default R3FCanvasIndex;
