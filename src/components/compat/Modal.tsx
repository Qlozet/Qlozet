import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Compatibility interface that maps old Modal props to new shadcn Dialog
interface CompatModalProps {
  content: React.ReactNode
  show: boolean
  closeModal: () => void
  className?: string
}

export const Modal: React.FC<CompatModalProps> = ({
  content,
  show,
  closeModal,
  className
}) => {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={cn(
          "max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0",
          "sm:rounded-lg",
          className
        )}
        // Prevent default close on overlay click - we handle it with onOpenChange
        onPointerDownOutside={closeModal}
        onEscapeKeyDown={closeModal}
      >
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default Modal