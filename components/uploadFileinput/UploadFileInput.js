import Image from "next/image";
import documentIcon from "../../public/assets/svg/document-upload.svg";
import { useState } from "react";
import classes from "./index.module.css";
import closeIcon from "../../public/assets/svg/material-symbol-close-icon.svg";
import { uploadSingleImage } from "@/utils/helper";
import { BallTriangle } from "react-loader-spinner";
const FileInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
  fileName,
}) => {
  const [files, setFiles] = useState(value);
  const [deletedFile, setDeletedFile] = useState([]);
  const [isloading, setIsloading] = useState(false);
  let deletedFiles = [];
  const removeItemFromList = (fileIndex) => {
    files.filter((file, index) => file !== fileIndex);
    setFiles(files.filter((file, index) => index !== fileIndex));
    const deletedFile = files.filter((file, index) => index === fileIndex);
    deletedFiles.push(deletedFile);
    console.log(deletedFiles);
    handleSelect(
      files.filter((file, index) => index !== fileIndex),
      deletedFiles
    );
  };

  const handleSubmitFile = async (file) => {
    setIsloading(true);
    const ImageInfo = await uploadSingleImage(file);
    ImageInfo && setIsloading(false);
    handleSelect([...files, ImageInfo]);
    setFiles((prevData) => [...prevData, ImageInfo]);
  };
  return (
    <div className="my-3 w-full">
      <label>{label}</label>
      <div className="overflow-hidden">
        <div
          className={`${classes.scrollbarElement} w-full h-[7rem] flex items-center gap-4 px-4 border-[1.5px] border-solid border-primary-200 rounded-[12px]`}
        >
          {files.map((item, index) => {
            console.log(item);
            return (
              <div key={index} className="relative">
                <div
                  className="absolute right-[-0.3rem] top-[-0.3rem] rounded-[50%] cursor-pointer bg-primary"
                  onClick={() => {
                    removeItemFromList(index);
                  }}
                >
                  <Image src={closeIcon} alt={item} width={20} height={20} />
                </div>
                <Image
                  width={500}
                  height={500}
                  src={item.secure_url}
                  style={{ width: "5rem", height: "auto" }}
                  alt=""
                  className="min-w-[5rem] h-[auto]"
                />
              </div>
            );
          })}
          {!isloading ? (
            <label
              className="border-[1px] border-solid border-primary-200 block min-w-[5rem] h-[5rem] rounded-[12px]"
              htmlFor={fileName ? fileName : "file"}
            >
              <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center bg-white">
                <Image src={documentIcon} alt="" />
              </div>
            </label>
          ) : (
            <div className="border-[1px] border-solid border-primary-200 block min-w-[5rem] h-[5rem] rounded-[12px]">
              <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center bg-white">
                <BallTriangle
                  height={60}
                  width={60}
                  radius={5}
                  color="rgba(62, 28, 1, 1)"
                  ariaLabel="ball-triangle-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            </div>
          )}
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
          handleSubmitFile(e.target.files[0]);
        }}
      />
    </div>
  );
};

export default FileInput;
