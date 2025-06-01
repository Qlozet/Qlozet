import { BallTriangle } from "react-loader-spinner";
import Loader from "../Loader";
import ToolTip from "../ToolTip";

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
  tooltips
}) => {
  return (
    <div className="my-3 relative w-full">
      {leftIcon}
      <div className="flex items-center justify-start gap-2">
        <label className="text-sm my-2 text-dark"> {label}</label>
        {tooltips && <ToolTip text={`${label} is required`} />
        }
      </div>      <input
        className={`py-3 px-4 w-full border-solid border-[1.5px] text-dark placeholder-gray-200
          focus:bg-white focus:outline focus:outline-4 focus:outline-[#3E1C0114] focus:border-primary-100 ${error && "border-danger"
          } border-gray-200 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed "
            } `}
        value={value}
        disabled={isLoading ? true : false}
        placeholder={placeholder}
        onChange={(e) => {
          const re = /^[0-9\b]+$/;
          if (e.target.value === "" || re.test(e.target.value)) {
            setValue(e.target.value);
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
