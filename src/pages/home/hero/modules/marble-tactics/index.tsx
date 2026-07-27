import { TileTerrainCanvas } from '../_shared/TileTerrainCanvas'
// Terrain JSON from the ported repo (opaque via #ported alias).
import terrain from '#ported/R3FSubmodules/TacticalBoardGame/components/CanvasRenderer/scenes/configs/tbg-orbonne.json'

/** Hero module: Marble V2 (Tactics) board, rendered natively via the shared tile canvas. */
export default function MarbleTacticsModule() {
  return <TileTerrainCanvas data={terrain} camera={[13, 11, 13]} />
}
