import { useState } from "react";
import Calendar from "react-calendar";
import calenderIcon from "../../public/assets/svg/calendar.svg";
import Image from "next/image";
import moment from "moment";
const DateInput = ({
  label,
  setValue,
  value,
  leftIcon,
  showCalender,
  showCalendeHandler,
}) => {
  const [dateValue, onChange] = useState(new Date());
  const [date, setDate] = useState(new Date());

  return (
    <div className="my-3 relative">
      {leftIcon}
      <label className="text-[14px] font-light my-2 text-dark"> {label}</label>
      <input
        value={value}
        className={`border-solid border-[1.5px] placeholder-gray-200 text-dark block w-full p-2 focus:border-primary-100 border-gray-2 rounded-[8px] focus:outline-none focus:bg-[#DDE2E5] text-[14px]`}
        onChange={() => {
          setValue(e.target.value);
        }}
        onClick={() => {
          // passing " " will display calender because the data type is empty
          showCalendeHandler("")
        }}
      />
      <Image
        alt=""
        src={calenderIcon}
        className="absolute top-[2.3rem] right-[1rem] cursor-pointer"
      />
      {showCalender && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-[rgba(0,0,0,.5)]" style={{ zIndex: 2000 }}>
          <div className="w-full h-full border-1 border-solid border-b-dark flex items-center justify-center" style={{ zIndex: 2000 }}>
            <Calendar
              onChange={(e) => {
                const isValidDate = Date.parse(e)
                if (isValidDate) {
                  setDate(moment(e).format("YYYY-MM-DD"));
                  showCalendeHandler(isValidDate);
                  onChange();
                  setValue(moment(e).format("YYYY-MM-DD"));
                } else {
                  // Don't remove calender
                  showCalendeHandler(isValidDate);

                }
              }}
              value={value}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput;
