import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import classes from "./index.module.css";
import { filterSelectedItems } from "@/utils/helper";
import { X } from "lucide-react";
const SizeInput = ({
  value,
  // placeholder,
  setValue,
  data,
  label,
  index,
  error,
  disabled,
  removeSizeFromVariant,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const dropDownRef = useRef();
  const [list, setList] = useState(data);
  const [selectedList, setSelectedList] = useState([]);

  const filterList = (e) => {
    setValue(e.target.value);
    setList(
      data.filter((bank) =>
        bank.text.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const removeItemFromList = (sizeIndex, item) => {
    removeSizeFromVariant(item);
    const remainingSizes = value.filter((file, index) => index !== sizeIndex);
    setValue(remainingSizes, sizeIndex);
    setSelectedList(remainingSizes);
  };

  useEffect(() => {
    setList(
      filterSelectedItems(
        data,
        value.map((item) => item.size)
      )
    );
  }, [value]);

  return (
    <div
      className={`w-full relative my-2 h-[4rem]`}
      style={{ zIndex: index ? index : 10 }}
    >
      <div className={`${classes.container}`}>
        <label className="text-sm text-dark">{label}</label>
        <input
          readOnly
          onChange={filterList}
          onClick={() => {
            !disabled && setShowDropDown(true);
          }}
          onBlur={(e) => {
            if (!disabled) {
              if (!dropDownRef.current.contains(e.relatedTarget)) {
                setShowDropDown(false);
              }
            }
          }}
          className={`py-3 ${disabled ? "bg-gray-300" : "bg-white"} ${error && "border-danger"
            } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  absolute top-[1.5rem] left-0
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 
           `}
        ></input>
        <div className="absolute top-[2rem] left-[0.5rem] flex items-center gap-2 ">
          {value.map((item, index) => (
            <div
              className="bg-gray-300 rounded-[5px] p-1 flex items-center justify-center relative gap-2"
              key={index}
            >
              {item.size}
              <button
                onClick={() => {
                  removeItemFromList(index, item);
                }}
                className="bg-transparent border-none outline-none"
              >
                <X className="h-4 w-4 cursor-pointer" />
              </button>
            </div>
          ))}
        </div>

        {/* <div className="absolute top-[40px] right-2 ">
          <Image src={arrowDownIcon} alt="" />
        </div> */}
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
              className={`px-2 py-3 w-full ${index !== 0 ? "border-t-[1px] border-solid border-gray-200" : ""
                } hover:bg-[#F4F4F4]`}
              onClick={() => {
                setSelectedList((prevData) => [...prevData, item]);
                setValue([...value, item]);
                setShowDropDown(false);
              }}
            >
              <p className="rounded-b-[12px] overflow-hidden text-xs pl-1">
                {item}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SizeInput;
