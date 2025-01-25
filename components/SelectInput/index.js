import { useState, useRef } from "react";
const { default: Image } = require("next/image");
import arrowDownIcon from "../../public/assets/svg/arrow-down.svg";
import Typography from "../Typography";
import classes from "./index.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import ToolTip from "../ToolTip";
const SelectInput = ({
  value,
  placeholder,
  setValue,
  data,
  label,
  index,
  error,
  readOnly,
  tooltips
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
        <div className="flex items-center justify-start gap-2">
          <label className="text-sm my-2 text-dark"> {label}</label>
          {tooltips && <ToolTip text={`${label} is required`} />
          }
        </div>        <input
          readOnly={readOnly}
          onChange={filterList}
          onClick={() => {
            setShowDropDown(true);
          }}
          onBlur={(e) => {
            if (!dropDownRef?.current?.contains(e.relatedTarget)) {
              setShowDropDown(false);
            }
          }}
          placeholder={placeholder}
          value={value}
          className={`py-3 ${error && "border-danger"
            } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
            focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 
           `}
        ></input>
        <div className="absolute top-[36px] right-2 ">
          {showDropDown ? <ChevronUp /> : <ChevronDown />}
        </div>
        {error && (
          <p className="text-danger text-xs font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
      {showDropDown && (
        <div
          className={` cursor-pointer absolute top-[73px] bg-white rounded-lg max-h-[15rem] ${classes.datalist} shadow-md  w-full`}
          ref={dropDownRef}
        >
          {list.map((item, index) => (
            <div
              key={index}
              tabIndex={0}
              className={`px-2 py-3 ${index !== 0
                ? "border-t-[1px] border-solid border-gray-200"
                : ""
                } hover:bg-[#F4F4F4]`}
              onClick={() => {
                setValue(item.text);
                setShowDropDown(false);
              }}
            >
              <p className="rounded-b-[12px] overflow-hidden text-xs pl-1">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
