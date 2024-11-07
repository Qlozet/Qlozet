import { useEffect } from "react";
import style from "./index.module.css";
import { motion, useAnimation } from "framer-motion";
const Modal = ({ content, show }) => {
  const animation = useAnimation();
  return (
    <>{show ? (<motion.div
      animate={{ scale: 1 }}
      transition={{ delay: .1 }}
      initial={{ scale: 0 }}
      className={`${style.modal}  px-4 lg:px-0  h-screen fixed top-0 left-0 w-screen bg-[#00000080] overflow-y-scroll`}
      style={{
        zIndex: 999,
      }}
    >
      {content}
    </motion.div>) : (<motion.div
      animate={{ scale: 0, opacity: 0 }}
      transition={{ delay: .1, duration: .1 }}
      initial={{ scale: 0 }}
        className={`${style.modal}  px-4 lg:px-0  h-screen fixed top-0 left-0 w-screen bg-[#00000080] overflow-y-scroll`}
      style={{
        zIndex: 999,
      }}
    >
      {content}
    </motion.div>)}
    </>
  );
};

export default Modal;
