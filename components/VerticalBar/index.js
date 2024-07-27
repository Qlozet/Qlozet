import { useEffect, useState, useRef } from "react";
import classes from "./index.module.css";

const VerticalBar = ({ date, value, per, color, highest, heightValue }) => {
  const [showValue, setShowValue] = useState(false);
  const total = heightValue;
  const ref = useRef(null);
  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setShowValue(false);
    }
  };

  return (
    <div
      ref={ref}
      onClick={(e) => {
        handleClickOutside(e);
      }}
    >
      <div className="h-full flex items-end">
        <div
          style={{
            height: `${(value * 100) / total}%`,
          }}
          className={`${per} ${
            highest ? "bg-primary" : "bg-primary-200"
          } rounded-t-[36px] lg:w-[20px] relative w-[20px]`}
          onMouseEnter={() => {
            setShowValue(true);
          }}
          onMouseLeave={() => {
            setShowValue(false);
          }}
          onTouchStart={() => {
            setShowValue(true);
          }}
        >
          {showValue && (
            <div>
              <div
                className="absolute top-[-2.6rem] left-[-17px] font-[400] text-[12px] text-[#495057] bg-[#495057] text-white px-2 py-1 rounded-[12px] min-w-[60px] flex items-center justify-center"
                style={{ zIndex: 60 }}
              >
                {value.toLocaleString()}
              </div>
              <div
                className={`${classes.rotate} absolute  bg-[#495057] top-[-28px] left-[8px] w-[13px] h-[13px] text-white p-2 rounded-[2px] text-[12px] font-[300]`}
                style={{ zIndex: 58 }}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="translate-x-[-0px] flex items-center justify-center font-[400] text-[12px] text-[#495057] cursor-pointer">
        {date.substring(0, 3)}
      </div>
    </div>
  );
};

export default VerticalBar;
