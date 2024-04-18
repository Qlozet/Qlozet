const TextArea = ({
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
      <label className="text-[14px] font-light my-2"> {label}</label>
      <textarea
        type="text"
        className={`py-3 px-4 w-full border-solid border-[1.5px]  
          focus:outline-none focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
            disabled && "border-0 bg-gray-300 cursor-not-allowed min-h-[130px]"
          } `}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></textarea>
      {rightIcon}
    </div>
  );
};

export default TextArea;
