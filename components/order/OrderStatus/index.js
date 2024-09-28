const OrderStatus = ({ text, bgColor, color, addMaxWidth, clickHandler }) => {
  return (
    <div
      className={`${bgColor} ${color} ${addMaxWidth ? "max-w-[10rem]" : ""
        }  flex items-center justify-center px-4 py-2 rounded-[3px] text-[10px] max-w-[10rem] ${clickHandler && "hover:scale-90  cursor-pointer "} `}
      onClick={clickHandler}
    >
      {text}
    </div>
  );
};
export default OrderStatus;
