import Image from "next/image";
import searchIcon from "../../public/assets/svg/search-normal-gray.svg";

const SearchInput = ({
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
      <div className="my-3 relative">
        <Image
          src={searchIcon}
          className="absolute top-[0.8rem] left-2.5"
          alt=""
        />
        <label className="text-[14px] font-light my-2 text-dark">{label}</label>
        <input
          type="text"
          className={`py-3 pl-10 pr-4 w-full border-solid border-[1.5px]  text-dark placeholder-gray-200
      focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 ${error && "border-danger"
            } border-gray-2 rounded-[12px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed "
            } `}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        ></input>
        {rightIcon}
        {error && (
          <p className="text-danger text-xs font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
