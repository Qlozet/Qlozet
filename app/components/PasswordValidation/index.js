const PasswordValidate = ({ checked, text }) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-[20px] h-[20px] p-[2px] rounded-[50%] border-gray-200 border-solid bg-primary-300 flex items-center justify-center`}
      >
        {checked && (
          <div
            className={`w-[100%] h-[100%] rounded-[50%]  border-solid bg-primary-100`}
          ></div>
        )}
      </div>
      <p className="font-[400] text-[12px]">{text}</p>
    </div>
  );
};

export default PasswordValidate;
