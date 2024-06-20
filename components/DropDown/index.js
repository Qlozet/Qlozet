import { useEffect, useState, useRef } from "react";
import arrowDownIcon from "../../public/assets/svg/arrow-down.svg";
import Image from "next/image";
const DropDown = ({ placeholder, setValue, data, maxWidth, bg }) => {
  const dropDownRef = useRef();
  const [options, setOption] = useState("");
  const [showDropDown, setShowDropDown] = useState(true);
  const handleSetValue = (value) => {
    setOption(value);
    setOption(value);
  };
  useEffect(() => {
    setShowDropDown(false);
  }, [options]);
  return (
    <div
      className={`${maxWidth} block bg-gray-300 max-w-48 ${
        showDropDown ? "shadow-2xl" : ""
      } rounded-lg `}
      style={{
        zIndex: 20,
      }}
    >
      <div className={`relative ${bg ? bg : ""}`}>
        <Image src={arrowDownIcon} className="absolute top-2 right-3" alt="" />
        <input
          onChange={() => {}}
          onClick={() => {
            setShowDropDown(true);
          }}
          onBlur={(e) => {
            // if (!dropDownRef.current.contains(e.relatedTarget)) {
            setShowDropDown(false);
            // }
          }}
          placeholder={placeholder}
          value={options}
          className={`${
            showDropDown
              ? "rounded-t-lg bg-gray-300 border-solid border-[2px] border-primary"
              : "rounded-[10px] "
          } bg-gray-400 w-full p-2 outline-none disable text-[12px] focus:bg-[#f4f4f4] placeholder-gray-200 text-dark border-[1px] border-solid border-gray-200`}
        ></input>

        <div className="absolute top-[10px] right-2 z-50">
          {/* {options === "" && <Image src={arrowDownIcon} alt="" />} */}
        </div>
        {showDropDown && (
          <div
            ref={dropDownRef}
            className="bg-white w-full absolute rounded-b-lg border-solid border-gray-200 border-b-[1px] border-r-[1px] border-l-[1px] "
          >
            {data.map((item, index) => (
              <div
                tabIndex={0}
                key={index}
                className={`cursor-pointer text-[12px] p-2 ${
                  index < data.length - 1 &&
                  "border-solid border-gray-200 border-b-[1px] w-full "
                }`}
                onClick={() => {
                  handleSetValue(item);
                }}
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
