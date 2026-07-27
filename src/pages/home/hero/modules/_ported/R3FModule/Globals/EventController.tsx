import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode
} from 'react';

interface GlobalCanvasState {
  [stateName: string]: unknown; 
}

interface EventRequest {
  [actionName: string]: unknown;
}

interface StateValues {
  [stateValueName: string]: unknown;
}

interface GlobalCanvasContextType {
  globalCanvasState: GlobalCanvasState;
  stateValues:  StateValues;
  eventRequest: EventRequest;
  eventLog: EventRequest;
  updateGlobalCanvasState: <T>(stateName: string, state: T) => void;
  updateStateValues:  <T>(stateValueName: string, value: T) => void;
  requestAction: <T>(stateValueName: string, value: T) => void;
  removeAction: (actionName: string) => void;
  // updateAction: <T>(actionName: string, state: T) => void;
  // clearRequests: () => void;
}

type ActionPayload = boolean | Record<string, unknown>;

const EventControllerContext = createContext<GlobalCanvasContextType | undefined>(undefined);

export const useEventController = (): GlobalCanvasContextType => {
  const context = useContext(EventControllerContext);
  if (!context) {
    throw new Error('useEventController must be used within an EventControllerProvider');
  }
  return context;
};

const EventControllerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalCanvasState, setGlobalCanvasState] = useState<GlobalCanvasState>({});  // Higher priority persistent global state values
  const [stateValues, setStateValues] = useState<StateValues>({});                    // Lower priority, impermanent state values
  const [eventRequest, setEventRequest] = useState<EventRequest>({});                 // Consumable event requests
  const [eventLog, setEventLog] = useState<EventRequest>({});                 // Consumable event requests
  
  const updateGlobalCanvasState = <T,>(stateName: string, state: T): void => {
    setGlobalCanvasState((prev) => ({
      ...prev,
      [stateName]: state,
    }));
  };

  // Update to be a request queue or something
  const requestAction = (actionName: string, payload?: ActionPayload): void => {
      if (!eventRequest.actionName) {
        setEventRequest(prev => ({
          ...prev,
          [actionName]: payload ?? true }));
    }
  };

  const removeAction = (actionName: string, payload?: ActionPayload) => {
    // //console.log("EventController.removeAction request received.")
    // if (eventRequest.actionName) {
    setEventLog(prev => ({
        ...prev,
        [actionName]: payload ?? true }));
        
    setEventRequest((prev) => {
      // //console.log(`EventController.removeAction: ${actionName.toString()} (payload: ${payload?.toString()}) request processing complete == ${eventRequest[actionName]}.  Removing request.`)
      const { [actionName]: _, ...newState } = prev; // Remove the action by excluding it
      return newState;
    });
  };

  const updateStateValues = useCallback(<T,>(stateValueName: string, value: T): void => {
    // Avoiding mid-render updates with microtask deferral
    Promise.resolve().then(() => {
      setStateValues((prev) => ({
        ...prev,
        [stateValueName]: value,
      }));
    });
  }, []);
  
  useEffect(() => {
    //console.log("Updated EventRequest:", eventRequest);
  }, [eventRequest]);

  useEffect (() => {
    updateGlobalCanvasState("collisionDebug", false)
    updateGlobalCanvasState("cameraMode", 'track')
    updateGlobalCanvasState("canvasInView", true)
    updateGlobalCanvasState("currentCanvas", 0)
  }, [])

  return (
    <EventControllerContext.Provider
      value={{
        globalCanvasState: { ...globalCanvasState }, // Ensure reference changes
        stateValues: { ...stateValues },
        eventRequest: { ...eventRequest },
        eventLog: {... eventLog},
        updateGlobalCanvasState,
        updateStateValues,
        requestAction,
        removeAction,
        // clearRequests
      }}
    >
      {children}
      {/* <ControlPanel /> */}
    </EventControllerContext.Provider>
  );
};

export default EventControllerProvider;
