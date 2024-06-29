import Image from "next/image";
import documentIcon from "../../public/assets/svg/document-upload.svg";
import { useState } from "react";
import classes from "./index.module.css";
const FileInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
  fileName,
}) => {
  const [files, setFiles] = useState(value);
  const removeFile = (fileIndex) => {
    files.filter((file, index) => index !== fileIndex);
    handleSelect(files.filter((file, index) => index !== fileIndex));
    setFiles(files.filter((file, index) => index !== fileIndex));
  };

  return (
    <div className="my-3 w-full">
      <label>{label}</label>
      <div className="overflow-hidden">
        <div
          className={`${classes.scrollbarElement} w-full h-[7rem] flex items-center gap-4 px-4 border-[1.5px] border-solid border-primary-200 rounded-[12px]`}
        >
          {files.map((item, index) => {
            let dataUrl;
            if (typeof item === "string") {
              dataUrl = item;
            } else {
              dataUrl = URL.createObjectURL(item);
            }
            return (
              <div key={index}>
                <Image
                  width={500}
                  height={500}
                  src={dataUrl}
                  style={{ width: "5rem", height: "auto" }}
                  alt=""
                  className="min-w-[5rem] h-[auto]"
                />
              </div>
            );
          })}
          <label
            className="border-[1px] border-solid border-primary-200 block min-w-[5rem] h-[5rem] rounded-[12px]"
            htmlFor={fileName ? fileName : "file"}
          >
            <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center">
              <Image src={documentIcon} alt="" />
            </div>
          </label>
        </div>
      </div>

      <input
        type="file"
        id={fileName ? fileName : "file"}
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
  );
};

export default FileInput;
