const CheckBoxInput = ({ value, handleChange, label }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="accent-primary focus:accent-primary w-[24px] h-[24px] p-[10px] cursor-pointer"
      />
      <label className="font-bold text-[14px]">{label}</label>
    </div>
  );
};

export default CheckBoxInput;
