import style from "./index.module.css";
const Modal = ({ content }) => {
  return (
    <div
      className={`${style.modal} fixed top-0 left-0 w-full bg-[#00000080] h-screen overflow-y-scroll z-50 px-4 lg:px-0 `}
      style={{
        zIndex: 50,
      }}
    >
      {content}
    </div>
  );
};

export default Modal;
