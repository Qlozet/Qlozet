import { useEffect } from "react";
import classes from "./index.module.css";

const VerticalBar = ({ date, value, per, color }) => {
  let percentage;

  useEffect(() => {}, []);
  return (
    <div>
      <div className="h-full flex items-end">
        <div className={`${per} ${color} rounded-t-[36px] w-[36px] relative`}>
          <div className="absolute top-[-3.5rem] left-[-10px] font-[400] text-[14px] text-[#495057] bg-[#495057] text-white p-2 rounded-[12px] w-[60px] flex items-center justify-center">
            {value}
          </div>
          <div
            className={`${classes.rotate} absolute  bg-[#495057] top-[-30px] left-[10px] w-[15px] h-[15px] text-white p-2 rounded-[2px] text-[12px] font-[300]`}
          ></div>
        </div>
      </div>
      <div className="flex items-center justify-center font-[400] text-[14px] text-[#495057]">
        {date}
      </div>
    </div>
  );
};

export default VerticalBar;
