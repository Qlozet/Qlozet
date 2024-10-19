import Image from "next/image";
import { useState } from "react";
import classes from "./index.module.css";
import trashIcon from "../../public/assets/svg/trash.svg";
import imageicon from "../../public/assets/svg/image.svg";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import { Oval } from "react-loader-spinner";
const MaterialInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
  removeMaterialHandler,
  loading,
}) => {
  console.log(value)
  return (
    <div>
      <label className="text-[14px] text-dark">{label}</label>
      <div className="border-[1.5px] border-solid border-gray-200 relative h-[3rem] rounded-[8px]">
        <div className="absolute top-2 right-2 cursor-pointer  gap-4 flex justify-center items-center">
          <div className="">
            <Image src={trashIcon} alt="" />
          </div>
        </div>
        <div
          className={` ${classes.scrollbarElement} flex items-center gap-4 h-full pl-2`}
        >
          {value.map((item, index) => {
            let dataUrl = item && item;
            if (item) {
              return (<div
                key={index}
                className="relative my-2 w-[3.5rem] h-[2rem] rounded-[2px]"
                style={{
                  backgroundImage: `url('${dataUrl}')`,
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[-5px] right-[-5px] bg-primary-100 rounded-[50%] p-[1px]"
                >
                  <Image
                    alt="close"
                    src={closeIcon}
                    width={15}
                    height={15}
                    onClick={() => {
                      removeMaterialHandler(item, index);
                    }}
                  />
                </div>
              </div>)
            }
          })}
          <label
            htmlFor="material"
            className="w-[4rem] h-[2rem] rounded border-[1.5px] border-solid flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <Oval
                visible={true}
                height={18}
                width={18}
                color="rgba(62, 28, 1, 1)"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : (
              <Image src={imageicon} alt="" width={25} height={25} />
            )}
          </label>
        </div>
        <input
          type="file"
          id="material"
          className={`py-3 px-4 w-full border-solid border-[1.5px] 
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed min-h-[82px]"
            } hidden`}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            handleSelect(e.target.files[0]);
          }}
        />
      </div>
    </div>
  );
};

export default MaterialInput;
