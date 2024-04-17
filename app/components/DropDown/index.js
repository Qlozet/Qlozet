import { useState } from "react";
const { default: Image } = require("next/image");
import arrowDownIcon from "../../../public/assets/svg/arrow-down.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
const DropDown = ({ value, placeholder, setValue, data }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div
      className={`bg-white max-w-48 ${showDropDown ? "shadow-2xl" : ""} z-50`}
    >
      <div
        className={`${classes.container} relative border-solid ${
          showDropDown ? "rounded-t-lg border-b-0" : "rounded-[12px]"
        } border-[1px]  border-gray-200`}
        onClick={() => {
          setShowDropDown(true);
        }}
      >
        <input
          placeholder={placeholder}
          value={value}
          className="w-full p-2 rounded-[12px] outline-none disable"
        ></input>

        <div className="absolute top-[10px] right-2 z-50">
          {value === "" && <Image src={arrowDownIcon} alt="" />}
        </div>
      </div>
      {showDropDown && (
        <div className="rounded-b-[12px] overflow-hidden fixed top-[350px] right-[16px] z-10 bg-white translate-y-[-42px] min-w-[192px] cursor-pointer border-x-[1px] border-solid border-gray-200 border-b-[1px]">
          {data.map((item) => (
            <div
              className="p-2 rounded-b-[12px] border-t-[1.5px] border-solid border-gray-200 max-w-48"
              onClick={() => {
                setValue(item.text);
                setShowDropDown(false);
              }}
            >
              <p className="rounded-b-[12px] overflow-hidden">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;
