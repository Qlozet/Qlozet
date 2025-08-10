import React from 'react';
import Image from "next/image";
import uploadIcon from "../../../public/assets/svg/UploadIcon.svg";

interface FileUploadInputProps {
  width?: string;
  onFileSelect: (file: File) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ width, onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`px-[16px] py-[30px] border-solid border-primary-300 border-[1.5px] ${width ? width : 'w-[340px]'}`}>
      <p className="text-[400]">Upload File</p>
      <p className="text-[300] text-xs">Upload File</p>
      <div className="bg-[#F8F8F8] border-dashed border-2 border-[#DDE2E5] flex items-center justify-center gap-2 flex-col my-3 py-[40px] relative">
        <input 
          type="file" 
          className="absolute w-full h-full opacity-0 cursor-pointer" 
          onChange={handleFileChange} 
        />
        <Image src={uploadIcon} alt="Upload file" />
        <p className="text-[#ACB5BD]">
          <span className="text-[#4BA9FF]">Browse </span>or drag a file here
        </p>
      </div>
    </div>
  );
};

export default FileUploadInput;