import Image from "next/image";
import documentIcon from "../../../public/assets/svg/document-upload.svg";
const FileInput = ({
  label,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="my-3">
      {leftIcon}
      <label> {label} </label>

      <label
        className="border-[1px] border-solid border-primary-200 block w-[100%] h-[7rem] rounded-[12px]"
        htmlFor="file"
      >
        <div className="border-[1px] border-solid border-gray-200 h-[100%] cursor-pointer rounded-[12px] flex justify-center items-center">
          <Image src={documentIcon} />
        </div>
      </label>

      <input
        type="file"
        id="file"
        className={`py-3 px-4 w-full border-solid border-[1.5px] 
            focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
              disabled && "border-0 bg-gray-300 cursor-not-allowed min-h-[82px]"
            } hidden`}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      {rightIcon}
    </div>
  );
};

export default FileInput;
