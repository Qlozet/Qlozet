const VendorStatus = ({ text, bgColor, color }) => {
  return (
    <div
      className={`${bgColor} ${color} max-w-[10rem] flex items-center justify-center px-4 py-2 rounded-[8px] text-xs`}
    >
      {text}
    </div>
  );
};
export default VendorStatus;
