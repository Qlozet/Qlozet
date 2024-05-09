const Modal = ({ content }) => {
  return (
    <div className="fixed top-0 left-0 w-full bg-[#00000080] h-screen overflow-y-scroll z-50 px-4 md:px-0">
      {content}
    </div>
  );
};

export default Modal;
