import React, { useState } from "react";
import Image from "next/image";
import { ColorPicker, useColor, IColor } from "react-color-palette";
import colourIcon from "../../public/assets/svg/colour-icon.svg";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import customisationIcon from "../../public/assets/svg/customisation-icon.svg";
import Typography from "../Typography";
import classes from "./index.module.css";

interface ColorInputProps {
  label: string;
  error?: boolean;
  setValue: (colors: string[]) => void;
  value: string[];
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  index?: number;
  removeColorHandler: (color: string, index: number) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({
  label,
  error,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
  index,
  removeColorHandler,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#561ecb");
  const [selectedColors, setSelectedColors] = useState(value);
  const [color, setColor] = useColor("#561ecb");

  const colorArray: string[] = [
    "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
    "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
    "#80B300", "#809900", "#E6B3B3", "#6680B3", "#66991A",
    "#FF99E6", "#CCFF1A", "#FF1A66", "#E6331A", "#33FFCC",
    "#66994D", "#B366CC", "#4D8000", "#B33300", "#CC80CC",
    "#66664D", "#991AFF", "#E666FF", "#4DB3FF", "#1AB399",
    "#E666B3", "#33991A", "#CC9999", "#B3B31A", "#00E680",
    "#4D8066", "#809980", "#E6FF80", "#1AFF33", "#999933",
    "#FF3380", "#CCCC00", "#66E64D", "#4D80CC", "#9900B3",
  ];

  const removeColor = (colorToRemove: string, colorIndex: number) => {
    setSelectedColors(selectedColors.filter((c) => c !== colorToRemove));
    removeColorHandler(colorToRemove, colorIndex);
  };

  return (
    <div>
      <div className="my-3">
        {leftIcon}
        <label className="text-sm font-light my-2 text-dark">{label}</label>
        <div
          className={`flex items-center min-h-[2.8rem] cursor-pointer px-2 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${error && "border-danger"} border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed "} `}>
          <div className={`${classes.scrollbarElement} overflow-x-scroll  flex items-center gap-4 w-[99%]`}>
            {selectedColors.map((c, i) => (
              <div className="relative my-2" key={i}>
                <div className="absolute top-[-5px] right-[-5px] bg-primary-100 rounded-[50%] p-[1px]" style={{ zIndex: 200 }}>
                  <Image alt="Remove color" src={closeIcon} width={15} height={15} onClick={() => removeColor(c, i)} />
                </div>
                <div className="w-[4rem] h-[2rem] rounded" style={{ backgroundColor: c }}></div>
              </div>
            ))}
            <div className="w-[4rem] h-[2rem] rounded border-[1.5px] border-solid flex items-center justify-center cursor-pointer" onClick={() => setShowColorPicker(true)}>
              <Image src={customisationIcon} alt="Add color" width={25} height={25} />
            </div>
          </div>
          <div className="cursor-pointer">
            <Image src={colourIcon} alt="Color picker icon" />
          </div>
        </div>
        {error && <p className="text-danger text-xs font-[400]">{label} cannot be empty!</p>}
      </div>

      {showColorPicker && (
        <div className="fixed top-0 left-0 h-screen w-screen" style={{ zIndex: index }}>
          <div className="relative overflow-y-scroll top-0 left-0 w-full bg-[rgba(0,0,0,.3)] flex items-center justify-center h-screen w-screen">
            <div className="mx-w-[300px] top-[4.5rem] right-0 bg-[#2c2c2c] p-b-3 border-gray-200 rounded-[5px] border-solid border-[2px] border-[rgba(13,153,255)]">
              <div className="p-4 flex items-center justify-between">
                <Typography textColor="text-white" textWeight="font-[600]" textSize="text-sm">Custom</Typography>
                <div className="cursor-pointer" onClick={() => {
                  setValue([currentColor, ...selectedColors]);
                  setSelectedColors([currentColor, ...selectedColors]);
                  setShowColorPicker(false);
                }}>
                  <Image src={closeIcon} alt="Close color picker" />
                </div>
              </div>
              <ColorPicker color={color} onChange={(newColor: IColor) => {
                setColor(newColor);
                setCurrentColor(newColor.hex);
              }} />
              <div className="border-solid border-gray-200 border-b-[1px] px-2 pb-4">
                 {/* Hex display */}
              </div>
              <div className="p-4">
                <Typography textColor="text-white" textWeight="font-[600]" textSize="text-sm">Document Colors</Typography>
                <div className="grid grid-cols-9 gap-2 mt-2 cursor-pointer">
                  {colorArray.map((col, i) => (
                    <div key={i} onClick={() => setCurrentColor(col)} style={{ backgroundColor: col }} className="w-[1rem] h-[1rem]"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorInput;