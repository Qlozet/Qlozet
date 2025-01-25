import ToolTip from "../ToolTip";

const TextArea = ({
  label,
  setValue,
  value,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
  error,
  tooltips
}) => {
  return (
    <div className="my-3 border-solid h-full">
      {leftIcon}
      <div className="flex items-center justify-start gap-2">
        <label className="text-sm my-2 text-dark"> {label}</label>
        {tooltips && <ToolTip text={`${label} is required`} />}
      </div>
      <div className="h-full">
        <textarea
          type="text"
          className={`${error && "border-danger"
            } py-3 px-4 w-full border-solid border-[1.5px] block  h-[160px] lg:h-[324px]  text-dark placeholder:text-gray-200
          focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-sm text-font-light placeholder:font-300 ${disabled && "border-0 bg-gray-300 cursor-not-allowed h-full"
            } `}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        ></textarea>
        {error && (
          <p className="text-danger text-xs font-[400]">
            {label} cannot be empty!
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
