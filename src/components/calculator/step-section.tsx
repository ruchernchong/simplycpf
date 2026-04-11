"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

interface StepSectionProps {
  children: ReactNode;
  show: boolean;
  delay?: number;
}

const StepSection = ({ children, show, delay = 0 }: StepSectionProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, delay, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StepSection;
