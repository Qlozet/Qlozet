import Image from "next/image";
import documentIcon from "../../public/assets/svg/document-upload.svg";
import { useEffect, useState } from "react";
import classes from "./index.module.css";
import { Oval } from "react-loader-spinner";
import SelectedFile from "./FileContainer";
import { uploadSingleImage } from "@/utils/helper";
import { Upload } from "lucide-react";
import ToolTip from "../ToolTip";
const FileInput = ({
  label,
  handleSelect,
  value,
  placeholder,
  disabled = false,
  tooltips
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

  const handleSubmitFile = async (e) => {
    const files = e.target.files
    const filesArr = Array.from(files);
    const imageArray = []
    filesArr.forEach(async (file) => {
      try {
        setIsloading(true);
        const ImageInfo = await uploadSingleImage(file);
        if (ImageInfo
        ) {
          imageArray.push(ImageInfo)
          setFiles((prevData) => {
            return [...prevData, ImageInfo]
          });

        }

        setIsloading(false)
      } catch (error) {

        console.log(error)
      }
    })
    handleSelect(imageArray)
    // Reset Input
    e.target.value = ""
  };


  return (
    <div className="my-3 w-full">
      <div className="flex items-center justify-start gap-2">
        <label className="text-sm my-2 text-dark"> {label}</label>
        {tooltips && <ToolTip text={`${label} is required`} />
        }
      </div>      <div className="overflow-hidden">
        <div
          className={`${classes.scrollbarElement} w-full h-[151px] flex items-center gap-4 px-4 border-[1.5px] border-solid border-primary rounded-[12px] py-4`}
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
              className="border-[1.5px] border-dashed border-gray-200 block  h-full rounded-[12px] min-w-[127px]"
              htmlFor={"files"}
            >
              <div className="h-[100%] cursor-pointer rounded-[12px] flex justify-center  items-center flex-col bg-white gap-4 py-2 px-6">
                <Upload height={24} width={24} />
                <button className="bg-gray-300 rounded-md px-2 py-1 text-[10px]">Add image</button>
                <p className="text-gray-100 font-medium text-xs">Add from URL</p>
              </div>
            </label>
          ) : (
            <div className="border-[1px] border-solid border-primary-200 block w-[106px] h-[100%] rounded-[12px] relative">
              <div className="border-[1px] border-solid border-gray-200 cursor-pointer rounded-[12px] flex justify-center items-center  bg-[rgba-(0,0,0,1)] w-full h-[100%] ">
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
        type="file" name="files" multiple="multiple"
        id={"files"}
        className={`py-3 px-4 w-full border-solid border-[1.5px] 
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed min-h-[82px]"
          } hidden`}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          handleSubmitFile(e);
        }}
      />
    </div>
  );
};

export default FileInput;
