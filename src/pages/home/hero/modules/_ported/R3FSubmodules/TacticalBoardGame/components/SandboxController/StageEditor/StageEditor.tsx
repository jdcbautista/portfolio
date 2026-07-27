// SandboxController/StageEditor/StageEditor.tsx
import { useGameState } from '../../GameStateController/GameStateController';

export const StageEditorController = (): void => {
    const { updateGameState, requestAction } = useGameState();

    const generateGrid = (): void => {
        const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
        updateGameState('currentGrid', grid);
    };

    const saveGrid = (grid: number[][]): void => {
        updateGameState('savedGrid', grid);
    };

    const rebuildStage = (): void => {
        requestAction('rebuildStage');
    };

    return { generateGrid, saveGrid, rebuildStage };
};

export default StageEditorController;