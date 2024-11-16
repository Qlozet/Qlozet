import { BallTriangle } from "react-loader-spinner";
import Loader from "../Loader";

const NumberInput = ({
  label,
  setValue,
  value,
  error,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
  isLoading,
}) => {
  return (
    <div className="my-3 relative">
      {leftIcon}
      <label className="text-sm my-2 text-dark"> {label}</label>
      <input
        className={`py-3 ${error && "border-danger"
          } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed"
          }`}
        value={value}
        disabled={isLoading ? true : false}
        placeholder={placeholder}
        onChange={(e) => {
          const re = /^[0-9\b]+$/;
          if (e.target.value === "" || re.test(e.target.value)) {
            e.target.value && setValue(e.target.value);
          }
        }}
      ></input>
      {rightIcon}
      {error && (
        <p className="text-danger text-xs font-[400]">
          {label} cannot be empty!
        </p>
      )}

      {isLoading && (
        <div className="absolute top-[2rem] right-4">
          <BallTriangle
            height={25}
            width={25}
            radius={5}
            color="rgba(62, 28, 1, 1)"
            ariaLabel="ball-triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
    </div>
  );
};

export default NumberInput;
