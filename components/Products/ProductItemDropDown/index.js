import { useEffect, useState } from "react";
import arrowDownIcon from "../../../public/assets/svg/arrow-down.svg";
import Typography from "@/components/Typography";
import classes from "./index.module.css";
import Image from "next/image";
const ProductItemDropDown = ({ data, handleSelect }) => {
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
      className={`border-[1px] border-solid border-gray-200 bg-white rounded-[8px] min-w-[12rem]`}
    >
      <div>
        <div className="">
          {/* {options === "" && <Image src={arrowDownIcon} alt="" />} */}
        </div>

        <div className=" w-full rounded-b-lg ">
          {data.map((item, index) => (
            <div
              key={index}
              className={`hover:bg-gray-400 cursor-pointer text-[14px] p-4 ${
                index < data.length - 1 &&
                "border-b-[1px] border-solid border-gray-300"
              }    ${
                item === "Deactivate product" || item === "Delete product"
                  ? "text-danger"
                  : "text-dark"
              }`}
              onClick={() => {
                handleSelect(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductItemDropDown;
