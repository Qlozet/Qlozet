"use client"

import { Check } from "lucide-react";

const SelectedCheckBox = ({ top, left, right }) => {
  return <span className="absolute w-4 h-4 bg-primary rounded-[4px] flex items-center justify-center" style={{
    left: `${left}px`,
    top: `${top}px`,
    ...({ right: `${right}px` })

  }}><Check size={10} className="text-white font-extrabold" /></span>;
};

export default SelectedCheckBox;
