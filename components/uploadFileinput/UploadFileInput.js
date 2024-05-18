import Image from "next/image";
import documentIcon from "../../public/assets/svg/document-upload.svg";
import { useState } from "react";
const FileInput = ({
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
    <div className="my-3">
      <label>{label}</label>
      <label
        className="border-[1px] border-solid border-primary-200 block w-[100%] h-[7rem] rounded-[12px]"
        htmlFor="file"
      >
        {value.length < 1 ? (
          <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center">
            <Image src={documentIcon} />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {value.map((item) => {
              const dataUrl = URL.createObjectURL(item);
              return (
                <div>
                  <img src={dataUrl} className="w-[5rem] h-[auto]" />
                </div>
              );
            })}
          </div>
        )}
      </label>
      <input
        type="file"
        id="file"
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
