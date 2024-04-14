const OrderStatus = ({ text, bgColor, color, addMaxWidth }) => {
  return (
    <div
      className={`${bgColor} ${color} ${
        addMaxWidth ? "max-w-[10rem]" : ""
      }  flex items-center justify-center px-4 py-2 rounded-[8px] text-[10px]`}
    >
      {text}
    </div>
  );
};
export default OrderStatus;
