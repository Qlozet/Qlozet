const OrderStatus = ({ text, bgColor, color, addMaxWidth, clickHandler }) => {
  return (
    <div
      className={`${bgColor} ${color} ${
        addMaxWidth ? "max-w-[10rem]" : ""
      }  flex items-center justify-center px-4 py-2 rounded-[5px] text-[10px] cursor-pointer max-w-[10rem]`}
      onClick={clickHandler}
    >
      {text}
    </div>
  );
};
export default OrderStatus;
