import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import classes from "./index.module.css";
import { filterSelectedItems } from "@/utils/helper";
const SizeInput = ({
  value,
  // placeholder,
  setValue,
  data,
  label,
  index,
  error,
}) => {
  console.log(value);
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

  const removeItemFromList = (sizeIndex) => {
    const remainingSizes = value.filter((file, index) => index !== sizeIndex);
    setValue(remainingSizes, sizeIndex);
    setSelectedList(remainingSizes);
  };
  useEffect(() => {
    setList(filterSelectedItems(data, value));
  }, [value]);

  return (
    <div
      className={`bg-white w-full relative my-2 h-[4rem]`}
      style={{ zIndex: index ? index : 10 }}
    >
      <div className={`${classes.container}`}>
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
          // placeholder={value.length < 1 && placeholder}
          className={`py-3 ${
            error && "border-danger"
          } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  absolute top-[1.5rem] left-0
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 
           `}
        ></input>
        <div className="absolute top-[2rem] left-[0.5rem] flex items-center gap-2 ">
          {value.map((item, index) => (
            <div
              className="bg-gray-300 rounded-[5px] p-1 w-[6rem] flex items-center justify-center relative"
              key={index}
            >
              {item}
              <div
                className="absolute right-[-0.3rem] top-[-0.3rem] bg-primary-200 rounded-[50%] cursor-pointer"
                onClick={() => {
                  removeItemFromList(index);
                }}
              >
                <Image src={closeIcon} alt={item} width={15} height={15} />
              </div>
            </div>
          ))}
        </div>

        {/* <div className="absolute top-[40px] right-2 ">
          <Image src={arrowDownIcon} alt="" />
        </div> */}
        {error && (
          <p className="text-danger text-[12px] font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
      {showDropDown && (
        <div
          className={`border-[1.5px] border-solid border-primary w-full cursor-pointer absolute top-[72px] bg-white rounded-[12px] max-h-[15rem] overflow-y-scroll ${classes.datalist}`}
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
                setSelectedList((prevData) => [...prevData, item]);
                setValue([...value, item]);
                setShowDropDown(false);
              }}
            >
              <p className="rounded-b-[12px] overflow-hidden">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SizeInput;
