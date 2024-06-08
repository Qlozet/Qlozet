import Image from "next/image";
import { useState } from "react";
import classes from "./index.module.css";
import trashIcon from "../../public/assets/svg/trash.svg";
import imageicon from "../../public/assets/svg/image.svg";
const MaterialInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
}) => {
  const [files, setFiles] = useState(value);
  const removeFile = (fileIndex) => {
    files.filter((file, index) => index !== fileIndex);
    handleSelect(files.filter((file, index) => index !== fileIndex));
    setFiles(files.filter((file, index) => index !== fileIndex));
  };
  return (
    <div>
      <label>{label}</label>
      <div className="border-[1.5px] border-solid border-gray-200 relative h-[2.6rem] rounded-[8px]">
        <div className="absolute top-2 right-2 cursor-pointer  gap-4 flex justify-center items-center">
          <label className="" htmlFor="material">
            <div className="">
              <Image src={imageicon} alt="" />
            </div>
          </label>
          <div className="">
            <Image src={trashIcon} alt="" />
          </div>
        </div>
        <div
          className={` ${classes.scrollbarElement} flex items-center gap-4 h-full pl-4`}
        >
          {files.map((item) => {
            console.log(item);
            let dataUrl;
            if (typeof item === "string") {
              dataUrl = item;
            } else {
              dataUrl = URL.createObjectURL(item);
            }
            return (
              <div>
                <Image
                  width={500}
                  height={500}
                  src={dataUrl}
                  style={{ width: "5rem", height: "1.5rem" }}
                  alt=""
                  className="w-[2rem] h-[auto]"
                />
              </div>
            );
          })}
        </div>
        <input
          type="file"
          id="material"
          className={`py-3 px-4 w-full border-solid border-[1.5px] 
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
              disabled && "border-0 bg-gray-300 cursor-not-allowed min-h-[82px]"
            } hidden`}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setFiles((prevData) => {
              handleSelect([...prevData, e.target.files[0]]);
              return [...prevData, e.target.files[0]];
            });
          }}
        />
      </div>
    </div>
  );
};

export default MaterialInput;
