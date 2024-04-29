import Image from "next/image";
const { default: Typography } = require("../Typography");
import uploadIcon from "../../../public/assets/svg/UploadIcon.svg";
const FileUploadInput = ({ width }) => {
  return (
    <div className="px-[16px] py-[30px] border-solid border-primary-300 border-[1.5px] w-[340px]">
      <p className="text-[400] text-[16px]">Upload File</p>
      <p className="text-[300] text-[12px]">Upload File</p>
      <div className="bg-[#F8F8F8] border-dashed border-2 border-[#DDE2E5] flex items-center justify-center gap-2 flex-col my-3 py-[40px]">
        <Image src={uploadIcon} alt="profile" />
        <p className="text-[#ACB5BD]">
          <span className="text-[#4BA9FF]">Browse </span>or drag a file here
        </p>
      </div>
    </div>
  );
};

export default FileUploadInput;
