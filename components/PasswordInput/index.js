import { useState } from "react";

import passwordIcon from "../../public/assets/svg/password-icon.svg";
import Image from "next/image";
const PasswordInput = ({
  label,
  setValue,
  value,
  error,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="my-3 relative">
      {leftIcon}
      <label className="text-[14px] font-light my-2 text-dark"> {label}</label>
      <input
        type={showPassword ? "text" : "password"}
        className={`py-3 px-4 w-full border-solid border-[1.5px]  
            focus:outline-none ${
              error && "border-danger"
            } focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 placeholder:text-gray-200 ${
          disabled && "border-0 bg-gray-300 cursor-not-allowed"
        } `}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
      <div
        className="absolute right-2 top-9 w-[24px] flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowPassword(!showPassword);
        }}
      >
        <Image src={passwordIcon} alt="" />
      </div>
      {rightIcon}
      {error && (
        <p className="text-danger text-[12px] font-[400]">
          {label} cannot be empty!
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
