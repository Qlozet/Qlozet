import React, { useCallback, useState, } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import dropdownIcon from "../../public/assets/svg/arrow-down-gray.svg";
import dropdownDarkIcon from "../../public/assets/svg/arrow-down-dark.svg";
import deviceIcon from "../../public/assets/svg/folderIcon.svg";
import driveIcon from "../../public/assets/svg/drive.svg";
import dropboxIcon from "../../public/assets/svg/dropbox.svg";
import fomLinkIcon from "../../public/assets/svg/form-link.svg";
import closeCircle from "../../public/assets/svg/close-circle.svg";
import DropboxChooser from "react-dropbox-chooser";
import classes from "./index.module.css";
import useDrivePicker from 'react-google-drive-picker'

function UploadDocInput({ handleSelect, uploadfiles, singleUpload }) {
  // state
  const [showDropDown, setShowDropDown] = useState(false);
  const [files, setFiles] = useState(uploadfiles);

  const [openPicker, authResponse] = useDrivePicker();


  // functions
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  const handleOpenPicker = () => {
    openPicker({
      clientId: "932740940236-n3muogdmfum11u63oqdue9dl86fhtp9p.apps.googleusercontent.com",
      developerKey: "AIzaSyAU7Ae3aKeyrntyKo_ijv-vZwsQKEPzRrw",
      viewId: "DOCS",
      // token: token, // pass oauth token in case you already have one
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        }
        if (data.docs) {
          setFiles((prevData) => {
            handleSelect([...prevData, data.docs[0]]);
            return [...prevData, data.docs[0]];
          });
        }
      },
    })
  }
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

  function handleSuccess(files) {
    if (files) {
      setFiles((prevData) => {
        handleSelect([...prevData, files[0]]);
        return [...prevData, files[0]];
      });
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });


  const option = [
    {
      text: "From Device",
      icon: deviceIcon,
      function: () => { open() }
    },
    {
      text: "From Drive",
      icon: driveIcon,
      function: () => { handleOpenPicker() }
    },
    {
      text: "From Dropbox",
      icon: dropboxIcon,
      function: () => { open() }
    },
    {
      text: "From Link",
      icon: fomLinkIcon,
      function: () => { open() }
    },
  ]
  const DROPBOX_APP_KEY = "yc9t3c75udyuzjj"
  return (
    <div
      className="border-[1.5px] border-dashed border-gray-200 py-14 rounded-[8px] px-6 text-black"
      {...getRootProps()}
    >
      {files.length < 1 ? (
        <div
          className={`flex items-center bg-dark cursor-pointer ${showDropDown ? "rounded-t-lg" : "rounded-[8px]"
            }  justify-between py-3 mb-6 relative`}
          onClick={showdropDownHandler}
        >
          <p className="text-white px-6 ">Choose file</p>
          <span className="px-4 border-l-[1px]">
            <Image src={dropdownIcon} alt=""></Image>
          </span>
          {showDropDown && (
            <div
              className={`absolute left-0 top-[100%] w-full border-solid border-[2px] border-gray-200 rounded-b-lg overflow-hidden`}
            >
              {option.map((item, index) => {
                if (item.text === "From Dropbox") {
                  return (

                    <div key={index}><DropboxChooser
                      appKey={DROPBOX_APP_KEY}
                      success={handleSuccess}
                      // extensions={[".pdf", ".doc", ".docx"]}
                      linkType="direct"
                      cancel={() => console.log("closed")}
                      folderselect={true}
                      multiselect={true}
                    >
                      <div
                        className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid  text-black"
                      >
                        <Image src={item.icon} alt=""></Image>
                        <span className="text-gray-100 font-normal">{item.text}</span>
                      </div>
                    </DropboxChooser></div>)
                } else {
                  return (
                    <div key={index}
                      className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid  text-black"
                      onClick={item.function}
                    >
                      <Image src={item.icon} alt=""></Image>
                      <span className="text-gray-100 font-normal">{item.text}</span>
                    </div>
                  )
                }

              })}


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
                  <p className="font-bold  pt-[3px] h-[30px]  overflow-hidden text-ellipsis text-dark">
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
                    Add more file
                  </span>
                </p>
                <span className="px-4  border-l-[1.5px] border-dark">
                  <Image src={dropdownDarkIcon} alt=""></Image>
                </span>
                {showDropDown && (
                  <div className={`absolute left-0 top-[100%] w-full border-solid border-[2px] border-gray-200 rounded-b-lg overflow-hidden`}>
                    {option.map((item, index) => {
                      if (item.text === "From Dropbox") {
                        return (

                          <div key={index}><DropboxChooser
                            appKey={DROPBOX_APP_KEY}
                            success={handleSuccess}
                            // extensions={[".pdf", ".doc", ".docx"]}
                            linkType="direct"
                            cancel={() => console.log("closed")}
                            folderselect={true}
                            multiselect={true}
                          >
                            <div
                              className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid  text-black"
                            >
                              <Image src={item.icon} alt=""></Image>
                              <span className="text-gray-100 font-normal">{item.text}</span>
                            </div>
                          </DropboxChooser></div>)
                      } else {
                        return (
                          <div key={index}
                            className="px-6 py-3 bg-gray-300 flex items-center gap-5 border-t-[2px] border-white border-solid  text-black"
                            onClick={item.function}
                          >
                            <Image src={item.icon} alt=""></Image>
                            <span className="text-gray-100 font-normal">{item.text}</span>
                          </div>
                        )
                      }

                    })}
                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      )}
      <div>

        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center font-[700] text-sm text-dark">
            Drop the files here ...
          </p>
        ) : (
          <div>
            {files.length === 0 && (<div>  <p className="text-center font-[700] text-sm  text-dark">
              You can also
            </p>
              <p className="text-center font-[700] text-sm  text-dark">
                Drag and drop your file here
              </p></div>)}

          </div>
        )}
      </div>
    </div>
  );
}

export default UploadDocInput;
