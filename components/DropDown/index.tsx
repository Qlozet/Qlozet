import { useEffect, useState, useRef } from "react";
import React from "react";
import arrowDownIcon from "../../public/assets/svg/arrow-down.svg";
import Image from "next/image";
import moment from "moment";

interface DropDownProps {
  placeholder?: string;
  setValue: (start?: number, end?: number | string, value?: string) => void;
  data: string[];
  maxWidth?: string;
  bg?: string;
  zIndex?: number;
}

const DropDown: React.FC<DropDownProps> = ({ placeholder, setValue, data, maxWidth, bg, zIndex }) => {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [option, setOption] = useState<string>("");
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  const handleSetValue = (value: string, option?: string): void => {
    const today = moment();
    if (value === "This week") {
      const startOfWeek = moment().startOf("week").valueOf();
      const endOfWeek = moment().endOf("week").valueOf();
      setValue(startOfWeek, endOfWeek, value);
    }
    if (value === "Last week") {
      const startOfPreviousWeek = moment()
        .subtract(1, "weeks")
        .startOf("week")
        .valueOf();
      const endOfPreviousWeek = moment()
        .subtract(1, "weeks")
        .endOf("week")
        .valueOf();
      setValue(startOfPreviousWeek, endOfPreviousWeek, value);
    }
    if (value === "This month") {
      const endOfMonth = moment().endOf("month").valueOf();
      const startOfMonth = moment().startOf("month").valueOf();
      setValue(startOfMonth, endOfMonth);
    }
    if (value === "Last month") {
      const startOfPreviousMonth = moment()
        .subtract(1, "months")
        .startOf("month")
        .valueOf();
      const endOfPreviousMonth = moment()
        .subtract(1, "months")
        .endOf("month")
        .valueOf();
      setValue(startOfPreviousMonth, endOfPreviousMonth, value);
    }
    if (value === "Choose month") {
      option = "Choose month";
      setValue(today.subtract(62, "days").valueOf());
    }
    if (value === "Custom") {
      option = "Custom";
      setValue(today.subtract(62, "days").valueOf(), "", value);
    }
    setOption(value);

    setShowDropDown(false); // Close the dropdown when an option is selected
  };



  useEffect(() => {
    const handleScroll = (): void => {
      setShowDropDown(false);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent): void => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
      setShowDropDown(false);
    }
  };
  useEffect(() => {
    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  return (
    <div
      className={` bg-gray-300 ${maxWidth} block max-w-48 ${showDropDown ? "shadow-2xl" : ""
        } rounded-lg `}
      style={{
        zIndex: zIndex ? zIndex : 20,
      }}
    >
      <div className={`relative ${bg ? bg : ""}`}>
        <Image src={arrowDownIcon} className="absolute top-2 right-3" alt="" />
        <input
          readOnly
          onChange={() => { }}
          onClick={() => {
            setShowDropDown(true);
          }}
          value={option}
          placeholder={placeholder}
          className={`${showDropDown
            ? "rounded-t-lg bg-gray-300 border-solid border-[2px] border-primary"
            : "rounded-[10px] "
            } ${option ? "bg-primary text-white" : "bg-gray-400 text-black"
            }  w-full p-2 outline-none text-xs  placeholder-gray-200 text-dark border-[1.5px] border-solid border-gray-200`}
        />
        <div className="absolute top-[10px] right-2 z-50"></div>
        {showDropDown && (
          <div
            ref={dropDownRef}
            className="bg-white w-full absolute rounded-b-lg shadow-sm border-b-[1px]"
          >
            {data.map((item: string, index: number) => (
              <div
                tabIndex={0}
                key={index}
                className={`cursor-pointer text-xs px-2 py-3 hover:bg-gray-400  ${index < data.length - 1 &&
                  "border-solid border-gray-200 border-b-[1px] w-full "
                  }`}
                onClick={() => handleSetValue(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropDown;
