const CheckBoxInput = ({ value, handleChange, label }) => {
  return (
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          handleChange(e.target.checked);
        }}
        className="accent-primary focus:accent-primary w-[16px] h-[16px] p-[10px] cursor-pointer border-primary border-solid bg-gray-400 text-primary border-[2px] rounded ring-0 ring-white focus:ring-white"
      />
      <label className="font-normal text-sm text-[#495057]">{label}</label>
    </div>
  );
};

export default CheckBoxInput;
