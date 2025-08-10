import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import style from "./index.module.css";

interface ModalProps {
  content: React.ReactNode;
  show: boolean;
  closeModal: () => void; // Assuming closeModal is a function that takes no arguments
}

const Modal: React.FC<ModalProps> = ({ content, show, closeModal }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${style.modal} px-4 lg:px-0 h-screen fixed top-0 left-0 w-screen bg-[#00000080] overflow-y-scroll border-solid border border-primary`}
          style={{ zIndex: 9999 }}
          onClick={closeModal} // Close modal on overlay click
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()} // Prevent content click from closing modal
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;