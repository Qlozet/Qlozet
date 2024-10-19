import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import dropdownIcon from "../../public/assets/svg/arrow-down-gray.svg";
import dropdownDarkIcon from "../../public/assets/svg/arrow-down-dark.svg";
import deviceIcon from "../../public/assets/svg/folderIcon.svg";
import driveIcon from "../../public/assets/svg/drive.svg";
import dropboxIcon from "../../public/assets/svg/dropbox.svg";
import fomLinkIcon from "../../public/assets/svg/form-link.svg";
import closeCircle from "../../public/assets/svg/close-circle.svg";
import Button from "../Button";
import classes from "./index.module.css";

function UploadDocInput({ handleSelect, uploadfiles, singleUpload }) {
  // state
  const [showDropDown, setShowDropDown] = useState(false);
  const [files, setFiles] = useState(uploadfiles);
  // functions
  const showdropDownHandler = () => {
    setShowDropDown(!showDropDown);
  };
  const removeFile = (fileIndex) => {
    files.filter((file, index) => index !== fileIndex);
    handleSelect(files.filter((file, index) => index !== fileIndex));
    setFiles(files.filter((file, index) => index !== fileIndex));
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevData) => {
      handleSelect([...prevData, acceptedFiles[0]]);
      return [...prevData, acceptedFiles[0]];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });

  return (
    <div
      className="border-[1.5px] border-dashed border-gray-200 py-14 rounded-[8px] px-6 text-black"
      {...getRootProps()}
    >
      {files.length < 1 ? (
        <div
          className={`flex items-center bg-dark cursor-pointer ${showDropDown ? "rounded-t-lg" : "rounded-[8px]"
            }  justify-between py-2 mb-6 relative`}
          onClick={showdropDownHandler}
        >
          <p className="text-white px-4 ">Choose file</p>
          <span className="px-4 border-l-[1px]">
            <Image src={dropdownIcon} alt=""></Image>
          </span>
          {showDropDown && (
            <div
              className={`absolute left-0 top-[100%] w-full cursor-pointer text-black`}
            >
              <div
                className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid text-[16px] text-black"
                onClick={open}
              >
                <Image src={deviceIcon} alt=""></Image>
                <span className="text-gray-100 font-bold ">From Device</span>
              </div>
              <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid">
                <Image src={driveIcon} alt=""></Image>
                <span className="text-gray-100 font-bold ">From Drive</span>
              </div>
              <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid">
                <Image src={dropboxIcon} alt=""></Image>
                <span className="text-gray-100 font-bold ">From Dropbox</span>
              </div>

              <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 rounded-b-lg border-t-[2px] border-white border-solid">
                <Image src={fomLinkIcon} alt=""></Image>
                <span className="text-gray-100 font-bold ">From Link</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="my-4">
            {files.map((item, index) => {
              return (
                <div
                  key={index}
                  className="relative bg-gray-300 flex items-center justify-between py-2 px-5 rounded-[8px] mt-1 "
                >
                  <p className="font-bold text-[16px] pt-[3px] h-[30px]  overflow-hidden text-ellipsis text-dark">
                    {item.name}
                  </p>
                  <div
                    className="absolute rounded-[8px] right-4 top-0  w-[50px] h-[100%] flex items-center justify-center cursor-pointer bg-gray-300"
                    onClick={() => {
                      removeFile(index);
                    }}
                  >
                    <Image
                      src={closeCircle}
                      alt=""
                      className="w-[24px] h-[24px]"
                    ></Image>
                  </div>
                </div>
              );
            })}
          </div>
          {!singleUpload && (
            <div className={`${classes.select_file_container} gap-4`}>
              <div
                className={`flex-1 flex items-center bg-white border-[1.5px] cursor-pointer border-solid h-[50px] border-gray-200 ${showDropDown ? "rounded-t-lg" : "rounded-[8px]"
                  }  justify-between py-2 mb-6 relative`}
                onClick={showdropDownHandler}
              >
                <p className="text-dark font-medium px-4 flex  ">
                  <span className="h-[30px] flex items-center overflow-hidden truncate text-dark">
                    {" "}
                    Add more file
                  </span>
                </p>
                <span className="px-4  border-l-[1.5px] border-dark">
                  <Image src={dropdownDarkIcon} alt=""></Image>
                </span>
                {showDropDown && (
                  <div className={`absolute left-0 top-[100%] w-full`}>
                    <div
                      className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid text-[16px]"
                      onClick={open}
                    >
                      <Image src={deviceIcon} alt=""></Image>
                      <span className="text-gray-100 font-bold ">
                        From Device
                      </span>
                    </div>
                    <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid">
                      <Image src={driveIcon} alt=""></Image>
                      <span className="text-gray-100 font-bold ">
                        From Drive
                      </span>
                    </div>
                    <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid">
                      <Image src={dropboxIcon} alt=""></Image>
                      <span className="text-gray-100 font-bold ">
                        From Dropbox
                      </span>
                    </div>

                    <div className="px-6 py-3 bg-gray-300 flex items-center gap-5 rounded-b-lg border-t-[2px] border-white border-solid">
                      <Image src={fomLinkIcon} alt=""></Image>
                      <span className="text-gray-100 font-bold">From Link</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Button children="Continue" btnSize="large" variant="primary" />
              </div>
            </div>
          )}
        </div>
      )}
      <div>

        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center font-[700] text-[14px] text-dark">
            Drop the files here ...
          </p>
        ) : (
          <div>
            <p className="text-center font-[700] text-[14px]  text-dark">
              You can also
            </p>
            <p className="text-center font-[700] text-[14px]  text-dark">
              Drag and drop your file here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadDocInput;
