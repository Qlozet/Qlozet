import { useState, useRef, useEffect } from "react";
import React from "react";
import Image from "next/image";
import closeIcon from "@/public/assets/svg/material-symbol-close-icon.svg";
import { filterSelectedItems } from "@/utils/helper";
import { X } from "lucide-react";

interface SizeItem {
  size: string;
  [key: string]: any;
}

interface SizeInputProps {
  value: SizeItem[];
  setValue: (value: SizeItem[], index?: number) => void;
  data: string[];
  label?: string;
  index?: number;
  error?: boolean;
  disabled?: boolean;
  removeSizeFromVariant: (item: SizeItem) => void;
}

const SizeInput: React.FC<SizeInputProps> = ({
  value,
  setValue,
  data,
  label,
  index,
  error,
  disabled,
  removeSizeFromVariant,
}) => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<string[]>(data);
  const [selectedList, setSelectedList] = useState<SizeItem[]>([]);

  const filterList = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value as any);
    setList(
      data.filter((bank: string) =>
        bank.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const removeItemFromList = (sizeIndex: number, item: SizeItem): void => {
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
      <div className="w-full relative">
        <label className="text-sm text-dark">{label}</label>
        <input
          readOnly
          onChange={filterList}
          onClick={() => {
            !disabled && setShowDropDown(true);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            if (!disabled) {
              if (!dropDownRef.current?.contains(e.relatedTarget as Node)) {
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
          {value.map((item: SizeItem, index: number) => (
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
          className="cursor-pointer absolute top-[73px] bg-white rounded-lg max-h-[15rem] datalist-scroll shadow-md w-full"
          ref={dropDownRef}
        >
          {list.map((item: string, index: number) => (
            <div
              key={index}
              tabIndex={0}
              className={`px-2 py-3 w-full ${index !== 0 ? "border-t-[1px] border-solid border-gray-200" : ""
                } hover:bg-[#F4F4F4]`}
              onClick={() => {
                const sizeItem: SizeItem = { size: item };
                setSelectedList((prevData) => [...prevData, sizeItem]);
                setValue([...value, sizeItem]);
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
