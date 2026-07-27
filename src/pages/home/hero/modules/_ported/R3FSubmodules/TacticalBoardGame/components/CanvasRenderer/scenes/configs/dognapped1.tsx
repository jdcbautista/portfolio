export const gridTiles = [
  {
    coords: [0,10] as [number,number],
    heightPos: 0,
    heightScale: 100,
    type:"grass",
    initEntity:"playerStart"
  },
  {
    coords: [0,-10] as [number,number],
    heightPos: 1,
    heightScale: 100,
    type:"snow"
  },
  {
    coords: [-10,0] as [number,number],
    heightPos: 2,
    heightScale: 100,
    type:"water"
  },
  {
    coords: [10,0] as [number,number],
    heightPos: 3,
    heightScale: 100,
    type:"grass"
  },
]