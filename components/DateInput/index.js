import { useState } from "react";
import Calendar from "react-calendar";
import calenderIcon from "../../public/assets/svg/calendar.svg";
import Image from "next/image";
import moment from "moment";
const DateInput = ({
  label,
  setValue,
  value,
  error,
  rightIcon,
  leftIcon,
  placeholder,
  disabled = false,
}) => {
  const [dateValue, onChange] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [showCalender, setShowCalender] = useState(false);

  return (
    <div className="my-3 relative">
      {leftIcon}
      <label className="text-[14px] font-light my-2 text-dark"> {label}</label>
      <input
        onFocus={() => {
          setShowCalender(true);
        }}
        type="number"
        className={`py-3 ${
          error && "border-danger"
        } px-4 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
            focus:outline-none focus:bg-[#DDE2E5] focus:border-primary-100 border-gray-2 rounded-[8px] overflow-hidden text-[14px] text-font-light placeholder:font-300 ${
              disabled && "border-0 bg-gray-300 cursor-not-allowed"
            } `}
        value={date}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
      <Image
        src={calenderIcon}
        className="absolute top-[2.3rem] right-[1rem] cursor-pointer"
        onClick={() => {}}
      />
      {showCalender && (
        <div className="absolute top-[1rem] right-[4rem] bg-white w-full">
          <Calendar
            onChange={(e) => {
              console.log(moment(e).format("YYYY-MM-DD"));
              setDate(moment(e).format("YYYY-MM-DD"));
              setShowCalender(false);
              onChange();
            }}
            value={value}
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
