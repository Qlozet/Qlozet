import { useState, useRef } from "react";
const { default: Image } = require("next/image");
import arrowDownIcon from "../../public/assets/svg/arrow-down.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
const SelectInput = ({
  value,
  placeholder,
  setValue,
  data,
  label,
  index,
  error,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const dropDownRef = useRef();
  const [list, setList] = useState(data);
  const filterList = (e) => {
    setValue(e.target.value);
    setList(
      data.filter((bank) =>
        bank.text.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };
  return (
    <div
      className={`bg-white w-full relative my-2`}
      style={{ zIndex: index ? index : 10 }}
    >
      <div className={`${classes.container}  border-solid   `}>
        <label className="text-[14px] text-dark">{label}</label>
        <input
          onChange={filterList}
          onClick={() => {
            setShowDropDown(true);
          }}
          onBlur={(e) => {
            if (!dropDownRef.current.contains(e.relatedTarget)) {
              setShowDropDown(false);
            }
          }}
          placeholder={placeholder}
          value={value}
          className={`py-3 ${
            error && "border-danger"
          } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
            focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 
           `}
        ></input>
        <div className="absolute top-[40px] right-2 ">
          <Image src={arrowDownIcon} alt="" />
        </div>
        {error && (
          <p className="text-danger text-[12px] font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
      {showDropDown && (
        <div
          className={`border-[2px] border-solid border-primary w-full cursor-pointer absolute top-[72px] bg-white rounded-[12px] max-h-[15rem] ${classes.datalist}`}
          ref={dropDownRef}
        >
          {list.map((item, index) => (
            <div
              key={index}
              tabIndex={0}
              className={`p-2 ${
                index !== 0
                  ? "border-t-[1.5px] border-solid border-gray-200"
                  : ""
              } bg-white hover:bg-[#F4F4F4]`}
              onClick={() => {
                console.log(item.text);
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
