import { useEffect, useState, useRef } from "react";
import classes from "./index.module.css";

const VerticalBar = ({ date, value, per, color, highest }) => {
  const [showValue, setShowValue] = useState(false);
  const total = 11000;
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
          // onTouchEnd={() => {
          //   setShowValue(false);
          // }}
        >
          {showValue && (
            <div>
              <div
                className="absolute top-[-3.5rem] left-[-14px] font-[400] text-[14px] text-[#495057] bg-[#495057] text-white p-2 rounded-[12px] w-[60px] flex items-center justify-center"
                style={{ zIndex: 3 }}
              >
                {value}
              </div>
              <div
                className={`${classes.rotate} absolute  bg-[#495057] top-[-30px] left-[6px] w-[15px] h-[13px] text-white p-2 rounded-[2px] text-[12px] font-[300]`}
                style={{ zIndex: 3 }}
              ></div>
            </div>
          )}
        </div>
      </div>
      <div className="translate-x-[-6px] flex items-center justify-center font-[400] text-[14px] text-[#495057]">
        {date.substring(0, 3)}
      </div>
    </div>
  );
};

export default VerticalBar;
