import { useThree } from '@react-three/fiber';
import React, { useEffect, useState } from 'react';
import { useEventController } from '../Globals/EventController';

const DebugRendererInfo: React.FC = () => {
  const { gl } = useThree(); // Access the renderer
  const { globalCanvasState } = useEventController()
  const [inView, setInView] = useState<boolean>();  
  // console.log(globalCanvasState)

  useEffect(()=> {
    if ("canvasInView" in globalCanvasState && globalCanvasState["canvasInView"] != inView) {
      setInView(globalCanvasState["canvasInView"] as boolean);
      console.log("UPDATING IN VIEW", globalCanvasState["canvasInView"], inView)
    }
    },[inView, globalCanvasState.canvasInView, globalCanvasState])

  useEffect(() => {
    if (!inView) return;
    
    const logRendererInfo = () => {
      if (!inView) return; 
      console.log('Renderer Info:', gl.info);
      console.log(inView)
    };

    // Log on mount and periodically for debugging
    logRendererInfo();
    const interval = setInterval(logRendererInfo, 5000); // Logs every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [gl, inView]);

  return null;
};

export default DebugRendererInfo;
