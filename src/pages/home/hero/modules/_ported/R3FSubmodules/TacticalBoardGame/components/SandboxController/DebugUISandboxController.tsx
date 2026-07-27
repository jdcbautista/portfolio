// DebugUISandboxController.tsx
import React from 'react';
import SandboxController from './SandboxController';

const DebugUISandboxController: React.FC = () => {
    const sandboxController = SandboxController();

    return (
        <div>
            <h3>Sandbox Debugger</h3>
            <button onClick={sandboxController.openStageEditor}>Open Stage Editor</button>
            <button onClick={sandboxController.rebuildStage}>Rebuild Stage</button>
        </div>
    );
};

export default DebugUISandboxController;