import colourIcon from "../../public/assets/svg/colour-icon.svg";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import Image from "next/image";
import { ColorPicker, ColorService, useColor } from "react-color-palette";
import Typography from "../Typography";
import classes from "./index.module.css";
import customisationIcon from "../../public/assets/svg/customisation-icon.svg";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import styles from "./index.module.css"
import { filterExcludedItems } from "@/utils/filteringExistingItem";
import ToolTip from "../ToolTip";

const SelectMultipleInput = ({
  label,
  error,
  setValue,
  value,
  disabled = false,
  zIndex,
  data,
  tooltips
}) => {
  const dropDownRef = useRef();
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedColors, setSelectedColors] = useState(value);
  const [list, setList] = useState(data);
  const [selectedList, setSelectedList] = useState([]);

  const handleClickOutside = (event) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setShowDropDown(false);
    }
  };

  useEffect(() => {
    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  const removeItem = (id) => {
    const item = selectedList.find(item => item.id === id)
    setList([...list, item])
    setSelectedList(selectedList.filter(item => item.id !== id))
  }

  useEffect(() => {

    setList(filterExcludedItems(list, selectedList, "id"))
  }, [selectedList])

  return (
    <div
      className="relative w-full"
      style={{
        zIndex: zIndex ? zIndex : 30,
      }}
      ref={dropDownRef}
    >
      <div className="flex item-center gap-4 my-1">
        <label className="text-sm text-dark ">{label}</label>    {tooltips && <ToolTip text={`${label} is required`} />
        }
      </div>
      <div className={`flex items-center gap-2 w-full border-solid border-[1.5px]  rounded-[8px] text-dark  ${showDropDown ? "bg-[#DDE2E5] border-primary-100" : "border-gray-2"}`}>
        <div className={`w-full flex items-center gap-4 text-sm text-font-light placeholder:font-300 px-2`} onClick={() => { setShowDropDown(!showDropDown); }} >
          <div className={`${styles.scrollContainer} overflow-x-auto flex items-center gap-4 w-[95%] py-2`}>
            {selectedList.length > 0 ? selectedList.map((item) => (
              <span className="flex items-center gap-1 p-1 bg-gray-700 rounded-[6px] text-sm" onClick={() => { removeItem(item.id) }} key={item.id}>{item.text} <button><X width={16} height={16} color={"#777777"} /></button></span>
            )) : (<span className="h-8"></span>)}
          </div>
          <button className="w-[5%]">{showDropDown ? <ChevronUp /> : <ChevronDown />}</button>
        </div>
      </div>
      {showDropDown && (
        <div
          className={` cursor-pointer absolute top-[75px] bg-white rounded-lg max-h-[15rem] ${classes.datalist} shadow-md  w-full`}
        >
          {list.length > 0 ? <>{list.map((item, index) => (
            <div
              key={index}
              tabIndex={0}
              className={`px-2 py-3 ${index !== 0
                ? "border-t-[1px] border-solid border-gray-200"
                : ""
                } hover:bg-[#F4F4F4]`}
              onClick={() => {
                setSelectedList([...selectedList, item]);
                // setList(filterExcludedItems(list, [...selectedList, item], "id"))
                setShowDropDown(false);
              }}
            >
              <p className="rounded-b-[12px] overflow-hidden text-xs pl-1">{item.text}</p>
            </div>
          ))}</> : (<p className="text-sm p-2 rounded-sm">No Available item</p>)}
        </div>
      )}

    </div>
  );
};

export default SelectMultipleInput;