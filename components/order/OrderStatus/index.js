const OrderStatus = ({ text, bgColor, color, addMaxWidth, clickHandler, fontSize, fontWeight }) => {
  return (
    <div
      className={`${addMaxWidth ? "max-w-[93px]" : ""
        }  flex items-center justify-center px-2 py-1 lg:py-2 rounded-[8px]  max-w-[10rem] ${clickHandler && "hover:scale-90  cursor-pointer "} `}
      onClick={clickHandler}
      style={{ backgroundColor: bgColor, color: color, fontSize: fontSize ? fontSize : "10px", fontWeight: fontWeight ? fontWeight : "400" }}>
      {text}
    </div>
  );
};
export default OrderStatus;
