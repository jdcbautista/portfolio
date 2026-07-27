import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import './DebugModals.css'; // Use shared modal styles

import { useTrackController } from '../../Camera/TrackController.tsx';
import { useEventController } from '../../Globals/EventController';

const TrackControllerUI: React.FC = () => {
  const { requestAction } = useEventController();

  const handlePlay = () => requestAction("playSequence", true);
  const handlePause = () => requestAction("pauseSequence", true);
  const handleReset = () => console.log('Reset triggered');
  const handleStepBack = () => console.log('Step Back triggered');
  const handleStepForward = () => console.log('Step Forward triggered');

  return (
    <div className="sub-modal-body">
      <h3 className="sub-modal-title">Track Controller</h3>
      <div className="track-controller-buttons">
        <button
          className="debug-modal-button"
          onClick={handlePlay}
          title="Play"
        >
          <PlayArrowIcon />
        </button>
        <button
          className="debug-modal-button"
          onClick={handlePause}
          title="Pause"
        >
          <PauseIcon />
        </button>
        <button
          className="debug-modal-button"
          onClick={handleReset}
          title="Reset"
        >
          <RestartAltIcon />
        </button>
        <button
          className="debug-modal-button"
          onClick={handleStepBack}
          title="Step Back"
        >
          <ArrowBackIcon />
        </button>
        <button
          className="debug-modal-button"
          onClick={handleStepForward}
          title="Step Forward"
        >
          <ArrowForwardIcon />
        </button>
        <button
          className="debug-modal-button disabled"
          disabled
          title="Edit (Not implemented)"
        >
          <EditIcon />
        </button>
      </div>
    </div>
  );
};

export default TrackControllerUI;
