const CheckBoxInput = ({ value, handleChange, label }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value}  // This binds the checked state of the checkbox to the value prop
        onChange={(e) => {
          // handleChange(e.target.checked);  // Pass the checked state to handleChange
        }}
        className="accent-primary focus:accent-primary w-[24px] h-[24px] p-[10px] cursor-pointer bg-gray-200 text-primary border-white rounded ring-0 ring-white focus:ring-white"
      />
      <label className="font-bold text-[14px] text-[#495057]">{label}</label>
    </div>
  );
};

export default CheckBoxInput;
