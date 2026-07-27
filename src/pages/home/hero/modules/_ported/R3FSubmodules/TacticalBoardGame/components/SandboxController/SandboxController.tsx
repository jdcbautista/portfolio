// SandboxController/SandboxController.tsx
import { useGameState } from '../GameStateController/GameStateController';

export const SandboxController = (): void => {
    const { updateGameState, requestAction } = useGameState();

    const openStageEditor = (): void => {
        updateGameState('activeModal', 'StageEditor');
    };

    const rebuildStage = (): void => {
        requestAction('rebuildStage');
    };

    return { openStageEditor, rebuildStage };
};

export default SandboxController;