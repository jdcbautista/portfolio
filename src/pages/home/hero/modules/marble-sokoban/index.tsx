import { TileTerrainCanvas } from '../_shared/TileTerrainCanvas'
// Terrain JSON from the ported repo (opaque via #ported alias).
import terrain from '#ported/R3FSubmodules/TacticalBoardGame/components/CanvasRenderer/scenes/configs/dognapped2.json'

/** Hero module: Marble V1 (Sokoban) board, rendered natively via the shared tile canvas. */
export default function MarbleSokobanModule() {
  return <TileTerrainCanvas data={terrain} camera={[10, 9, 10]} />
}
