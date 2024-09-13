import colourIcon from "../../public/assets/svg/colour-icon.svg";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import Image from "next/image";
import { ColorPicker, useColor } from "react-color-palette";
import ColorInputContainer from "../ColorPicker";
import Typography from "../Typography";
import classes from "./index.module.css";
import { useState } from "react";
const ColorInput = ({
  label,
  error,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
  index,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#561ecb");
  const [selectedColors, setSelectedColors] = useState(value);
  var colorArray = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
    "#66994D",
    "#B366CC",
    "#4D8000",
    "#B33300",
    "#CC80CC",
    "#66664D",
    "#991AFF",
    "#E666FF",
    "#4DB3FF",
    "#1AB399",
    "#E666B3",
    "#33991A",
    "#CC9999",
    "#B3B31A",
    "#00E680",
    "#4D8066",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#9900B3",
  ];
  const [color, setColor] = useColor("#561ecb");
  return (
    <div
      className="relative"
      style={{
        zIndex: index ? index : 30,
      }}
    >
      <div className="my-3">
        {leftIcon}
        <label className="text-[14px] font-light my-2 text-dark">{label}</label>
        <div className="flex items-center w-full">
          <div
            type="text"
            className={` min-h-[2.8rem] cursor-pointer px-4 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${
            error && "border-danger"
          } border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
              disabled && "border-0 bg-gray-300 cursor-not-allowed "
            } `}
            // value={value}
            // disabled={disabled}
            // placeholder={placeholder}
            // onChange={(e) => {
            //   setValue(e.target.value);
            //}}
            onClick={() => {
              setShowColorPicker(true);
            }}
          >
            <div
              className={`${classes.scrollbarElement} overflow-x-scroll absolute top-[2rem] flex items-center gap-4 w-[75%]`}
            >
              {showColorPicker && (
                <div>
                  <div
                    className="w-[4rem] h-[2rem] rounded"
                    style={{
                      backgroundColor: currentColor,
                    }}
                  ></div>
                </div>
              )}
              {selectedColors.map((color) => (
                <div>
                  <div 
                    className="w-[4rem] h-[2rem] rounded"
                    style={{
                      backgroundColor: color,
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-[2.2rem] right-[-1.5rem] cursor-pointer">
            <Image src={colourIcon} className="translate-x-[-2rem]" alt="" />
          </div>
        </div>
        {rightIcon}
        {error && (
          <p className="text-danger text-[12px] font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
      <div></div>
      <div
        className=""
        style={{
          backgroundColor: "rgb(44, 44, 44)",
        }}
      >
        {showColorPicker && (
          <div className=" fixed top-0 left-0 h-screen w-screen ">
            <div className="relaive overflow-y-scroll top-0 left-0 wfull bg-[rgba(0,0,0,.3)] flex items-center justify-center h-screen w-screen">
              <div className="mx-w-[300px] top-[4.5rem] right-0 bg-[#2c2c2c] p-b-3 border-gray-200 rounded-[5px] border-solid border-[2px] border-[rgba(13,153,255)]">
                <div className="p-4 flex items-center justify-between">
                  <Typography
                    textColor="text-white"
                    textWeight="font-[600]"
                    textSize="text-[14px]"
                  >
                    Custom
                  </Typography>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setValue([currentColor, ...selectedColors]);
                      setSelectedColors([currentColor, ...selectedColors]);
                      setShowColorPicker(false);
                    }}
                  >
                    <Image src={closeIcon} alt="" />
                  </div>
                </div>
                <ColorPicker
                  color={color}
                  onChange={(currentColor) => {
                    setColor(currentColor);

                    setCurrentColor(currentColor.hex);
                  }}
                />
                <div className="border-solid border-gray-200 border-b-[1px] px-2 pb-4">
                  <div className="flex items-center">
                    <div className="w-[25%] h-[1.5rem] flex items-center justify-center px-2">
                      <Typography
                        textColor="text-white"
                        textWeight="font-[500]"
                        textSize="text-[12px]"
                      >
                        Hex
                      </Typography>
                    </div>
                    <div className="w-[75%]  h-[1.5rem] border-solid border-[2px] border-[rgba(13,153,255)] flex items-center">
                      <div className="w-[70%] flex items-center">
                        <p className="font-[500] text-[12px] text-white bg-[rgba(13,153,255,.2)] ml-[1px]">
                          {currentColor}
                        </p>
                      </div>
                      <div className="w-[30%] border-l-[1px] border-solid border-gray-400">
                        <p className="font-[500] text-[14px] text-white pl-[10px]">
                          100%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div>
                    <div>
                      <Typography
                        textColor="text-white"
                        textWeight="font-[600]"
                        textSize="text-[14px]"
                      >
                        Document Colors
                      </Typography>
                      <div className="grid grid-cols-9 gap-2 mt-2 cursor-pointer">
                        {colorArray.map((col, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setCurrentColor(col);
                            }}
                            style={{ backgroundColor: col }}
                            className="w-[1rem] h-[1rem]"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorInput;