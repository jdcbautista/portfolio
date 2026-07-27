const ModalsController: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeModals, setActiveModals] = useState<
    { type: string; position: { x: number; y: number } }[]
  >([]);

  const openModal = (modalType: string) => {
    // Check if the modal is already open
    if (!activeModals.some((modal) => modal.type === modalType)) {
      const newModal = {
        type: modalType,
        position: {
          x: 100 + activeModals.length * 30, // Stagger positions
          y: 0 + activeModals.length * 30, // Avoid overlap
        },
      };
      setActiveModals((prev) => [...prev, newModal]);
    }
  };

  const closeModal = (modalType: string) => {
    setActiveModals((prev) => prev.filter((modal) => modal.type !== modalType));
  };

  return (
    <>
      {isCollapsed ? (
        <div
          className="gameUI-modal-collapsed"
          onClick={() => setIsCollapsed(false)}
          title="Expand Modals Menu"
        >
          <BugReportIcon fontSize="large" />
        </div>
      ) : (
        <Draggable>
          <div className="gameUI-modal-container">
            <div className="gameUI-modal-header">
              <h3 className="gameUI-modal-title">Modals Menu</h3>
              <button
                className="gameUI-modal-minimize"
                onClick={() => setIsCollapsed(true)}
                title="Collapse Modals Menu"
              >
                <MinimizeIcon fontSize="small" />
              </button>
            </div>
            <div className="gameUI-modal-body">
              <button
                className="gameUI-modal-button"
                onClick={() => openModal('CursorPosition')}
              >
                Open Cursor Position
              </button>
              <button
                className="gameUI-modal-button"
                onClick={() => openModal('TrackController')}
              >
                Open Track Controller
              </button>
            </div>
          </div>
        </Draggable>
      )}

      {/* Render Active Modals */}
      {activeModals.map((modal, index) => (
        <ModalRegistry
          key={index}
          modalType={modal.type}
          initialPosition={modal.position}
          closeModal={() => closeModal(modal.type)}
        />
      ))}
    </>
  );
};

export default ModalsController;
