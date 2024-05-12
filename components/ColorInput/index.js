import colourIcon from "../../public/assets/svg/colour-icon.svg";
import Image from "next/image";
const ColorInput = ({
  label,
  error,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="block">
      <div className="my-3 ">
        {leftIcon}
        <label className="text-[14px] font-light my-2 text-dark">{label}</label>
        <div className="flex items-center w-full">
          <input
            type="text"
            className={`py-3 px-4 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${
            error && "border-danger"
          } border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
              disabled && "border-0 bg-gray-300 cursor-not-allowed "
            } `}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          ></input>
          <div className="relarive top-[2rem] right-0 z-10">
            <Image src={colourIcon} className="translate-x-[-2rem]  " />
          </div>
        </div>

        {rightIcon}
        {error && (
          <p className="text-danger text-[12px] font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
    </div>
  );
};

export default ColorInput;
