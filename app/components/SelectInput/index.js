import { useState } from "react";
const { default: Image } = require("next/image");
import arrowDownIcon from "../../../public/assets/svg/arrow-down.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
const SelectInput = ({ value, placeholder, setValue, data, label }) => {
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div className={`bg-white w-full relative`}>
      <div
        className={`${classes.container}  border-solid   `}
        onClick={() => {
          setShowDropDown(true);
        }}
      >
        <label className="text-[12px]">{label}</label>
        <input
          placeholder={placeholder}
          value={value}
          className="w-full p-2 rounded-[12px] outline-none  border-[1px]  border-gray-200 focus:border-primary"
        ></input>
        {/* {value === "" && ( */}
        <div className="absolute top-[35px] right-2 ">
          <Image src={arrowDownIcon} alt="" />
        </div>
        {/* )} */}
      </div>
      {showDropDown && (
        <div className="overflow-hidden border-[1px] border-solid border-primary w-full cursor-pointer absolute top-[66px] bg-white rounded-[12px]">
          <div className="p-2 rounded-b-[12px] ">
            {/* <p className="text-[14px] text-gray-100 font-[200]">
              Reject order menu
            </p> */}
          </div>
          {data.map((item) => (
            <div
              className="p-2  border-t-[1.5px] border-solid border-gray-200 bg-white hover:bg-[#F4F4F4]"
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

export default SelectInput;
