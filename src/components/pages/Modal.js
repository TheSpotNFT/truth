const Modal = ({ isOpen, close, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg max-w-screen-lg w-full" style={{ maxHeight: '80vh' }}>
          <button onClick={close} className="absolute top-0 right-0 m-4">X</button>
          {children}
        </div>
      </div>
    );
  };