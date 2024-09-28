const CheckBoxInput = ({ value, handleChange, label }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          handleChange(e.target.checked);
        }}
        className="accent-primary focus:accent-primary w-[24px] h-[24px] p-[10px] cursor-pointer border-primary border-solid bg-gray-400 text-primary border-[2px] rounded ring-0 ring-white focus:ring-white"
      />
      <label className="font-bold text-[14px] text-[#495057]">{label}</label>
    </div>
  );
};

export default CheckBoxInput;
