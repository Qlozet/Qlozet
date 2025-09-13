import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ColorPicker, useColor, ColorService, IColor } from "react-color-palette";
import colourIcon from "@/public/assets/svg/colour-icon.svg";
import closeIcon from "@/public/assets/svg/material-symbol-close-icon.svg";
import customisationIcon from "@/public/assets/svg/customisation-icon.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
import { getRandomHexColor } from "@/utils/helper";

interface ColorInput2Props {
  label: string;
  error?: boolean;
  setValue: (colors: string[]) => void;
  value: string[];
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  index?: number;
  removeColorHandler: (color: string, index: number) => void;
}

const ColorInput2: React.FC<ColorInput2Props> = ({
  label,
  error,
  setValue,
  value,
  rightIcon,
  leftIcon,
  disabled = false,
  index,
  removeColorHandler
}) => {
  const [color, setColor] = useColor("#561ecb");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#561ecb");
  const [selectedColors, setSelectedColors] = useState(value);

  const colorArray: string[] = [
    "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
    "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
  ];

  const removeColor = (colorToRemove: string, colorIndex: number) => {
    const newColors = selectedColors.filter((c) => c !== colorToRemove);
    setSelectedColors(newColors);
    removeColorHandler(colorToRemove, colorIndex);
  };

  useEffect(() => {
    const uniqueItems = [...new Set(selectedColors)];
    setSelectedColors(uniqueItems);
  }, [value]);

  useEffect(() => {
    if (showColorPicker) {
      const randomCol = getRandomHexColor();
      setColor(ColorService.convert("hex", randomCol));
      setCurrentColor(randomCol);
    }
  }, [showColorPicker]);

  return (
    <div className="relative" style={{ zIndex: index ? index : 30 }}>
      <div className="my-3">
        {leftIcon}
        <label className="text-sm my-2 text-dark">{label}</label>
        <div className="flex items-center w-full">
          <div className={`h-[3rem] px-2 w-full border-solid border-[1.5px] text-dark placeholder-gray-200 focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${error && "border-danger"} border-gray-2 rounded-[8px] overflow-x-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed"}`}>
            <div className={`${classes.scrollbarElement} overflow-x-scroll absolute top-[2rem] flex items-center gap-4 w-[75%]`}>
                {/* Color previews */}
            </div>
          </div>
        </div>
        {error && <p className="text-danger text-xs font-[400]">{label} cannot be empty!</p>}
      </div>

      {showColorPicker && (
         <div className=" fixed top-0 left-0 h-screen w-screen " style={{ zIndex: 1000 }}>
            {/* Color Picker Modal */}
         </div>
      )}
    </div>
  );
};

export default ColorInput2;
