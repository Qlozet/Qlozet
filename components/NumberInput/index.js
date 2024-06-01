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
      <label className="text-[14px] font-light my-2 text-dark"> {label}</label>
      <input
        type="number"
        className={`py-3 ${
          error && "border-danger"
        } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
            disabled && "border-0 bg-gray-300 cursor-not-allowed"
          }`}
        value={value}
        disabled={isLoading ? true : false}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
      {rightIcon}
      {error && (
        <p className="text-danger text-[12px] font-[400]">
          {label} cannot be empty!
        </p>
      )}
      {isLoading && (
        <div className="absolute top-[2rem] right-4">
          <Loader small={true} width={30} height={30} />
        </div>
      )}
    </div>
  );
};

export default NumberInput;
