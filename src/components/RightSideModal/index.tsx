import { useEffect, useRef } from "react";
import React from "react";
import { motion, useAnimation } from "framer-motion";

interface RightSideModalProps {
  content: React.ReactNode;
  show: boolean;
  closeModal: () => void;
}

const RightSideModal: React.FC<RightSideModalProps> = ({ content, show, closeModal }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const animation = useAnimation();


  return (
    <>{show ? (<motion.div
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      transition={{ delay: 0, duration: 0 }}
      className="modal-scrollbar px-4 lg:px-0 h-screen fixed top-0 left-0 w-screen bg-[rgba(0,0,0,.2)]"
      style={{
        zIndex: 9999,
      }}
    >
      <div ref={contentRef} className="">{content}</div>
    </motion.div>) : (<motion.div ref={contentRef}
      animate={{ scale: 0, opacity: 0 }}
      transition={{ delay: 0, duration: 0 }}
      initial={{ scale: 0 }}
      className="modal-scrollbar px-4 lg:px-0 h-screen fixed top-0 left-0 w-screen bg-[#00000080] overflow-y-scroll"
      style={{
        zIndex: 999,
      }}
    >
      <div ref={contentRef} className="border-solid border-primary border-4">{content}</div>
    </motion.div>)}
    </>
  );
};

export default RightSideModal;
