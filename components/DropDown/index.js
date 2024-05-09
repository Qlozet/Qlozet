import { useState } from "react";
const { default: Image } = require("next/image");
import arrowDownIcon from "../../public/assets/svg/arrow-down.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
const DropDown = ({ value, placeholder, setValue, data }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div
      className={`bg-white max-w-48 ${
        showDropDown ? "shadow-2xl" : ""
      } z-50 rounded-lg block`}
    >
      <div
        className={`${classes.container} border-solid ${
          showDropDown ? "rounded-t-lg  border-b-0" : "rounded-[12px]"
        } border-[1px]  border-gray-200 overflow-hidden`}
        onClick={() => {
          setShowDropDown(true);
        }}
      >
        <input
          placeholder={placeholder}
          value={value}
          className="w-full p-2 outline-none disable text-[12px] focus:bg-[#f4f4f4] placeholder-gray-200 text-dark  "
        ></input>

        <div className="absolute top-[10px] right-2 z-50">
          {value === "" && <Image src={arrowDownIcon} alt="" />}
        </div>
      </div>
      {showDropDown && (
        <div
          className={`absolute top-[343px] z-10 bg-white translate-y-[-42px] min-w-[160px] cursor-pointer border-x-[1px] border-solid border-gray-200 border-b-[1px] ${
            showDropDown && "rounded-b-lg overflow-hidden"
          } `}
        >
          {data.map((item, index) => (
            <div
              className={`${
                index === data.length - 1 && "rounded-b-lg overflow-hidden"
              } p-2 border-t-[1.5px] border-solid border-gray-300 max-w-48 text-[12px] hover:bg-[#f4f4f4]`}
              onClick={() => {
                setValue(item.text);
                setShowDropDown(false);
              }}
            >
              <p className="">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;
