import Image from "next/image";
import documentIcon from "../../public/assets/svg/document-upload.svg";
import { useState } from "react";
import classes from "./index.module.css";
import { uploadSingleImage } from "@/utils/helper";
import { BallTriangle, Oval } from "react-loader-spinner";
import SelectedFile from "./FileContainer";
const FileInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
  fileName,
}) => {
  const [files, setFiles] = useState(value);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isloading, setIsloading] = useState(false);

  const removeItemFromList = (id) => {
    const newImages = files.filter((file, index) => file.asset_id !== id);
    const deletFile = files.filter((file, index) => file.asset_id === id);
    setFiles(newImages);
    setDeletedFiles((prevData) => {
      return [...prevData, deletFile[0]];
    });
    handleSelect(newImages, [...deletedFiles, deletFile[0]]);
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
            return (
              <SelectedFile
                item={item}
                removeItemFromList={() => {
                  removeItemFromList(item.asset_id);
                }}
                key={index}
              />
            );
          })}
          {!isloading ? (
            <label
              className="border-[1px] border-solid border-primary-200 block min-w-[5rem] h-[5rem] rounded-[12px] "
              htmlFor={fileName ? fileName : "file"}
            >
              <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center bg-white">
                <Image src={documentIcon} alt="" />
              </div>
            </label>
          ) : (
            <div className="border-[1px] border-solid border-primary-200 block min-w-[5rem] h-[5rem] rounded-[12px] relative">
              <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center  bg-[rgba-(0,0,0,1)]">
                <Oval
                  visible={true}
                  height={24}
                  width={24}
                  color="rgba(62, 28, 1, 1)"
                  ariaLabel="oval-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
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
