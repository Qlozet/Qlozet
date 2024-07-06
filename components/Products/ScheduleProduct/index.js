import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import SelectInput from "@/components/SelectInput";
import TextArea from "@/components/TextAreaInput";
import TimeInput from "@/components/TimeInput";
import Typography from "@/components/Typography";
import closeicon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import "react-calendar/dist/Calendar.css";
import Image from "next/image";
import { useState } from "react";
const ShecduleProduct = ({ closeSchedule }) => {
  const [schedule, setSchedule] = useState({ date: "", time: "" });
  const [dateinputIsActive, setDateInputIsactive] = useState(false);
  const timearray = [
    { text: "00:00" },
    { text: "00:30" },
    { text: "01:00" },
    { text: "01:30" },
    { text: "02:00" },
    { text: "02:30" },
    { text: "03:00" },
    { text: "03:30" },
    { text: "04:00" },
    { text: "04:30" },
    { text: "05:00" },
    { text: "05:30" },
    { text: "06:00" },
    { text: "06:30" },
    { text: "07:00" },
    { text: "07:30" },
    { text: "08:00" },
    { text: "08:30" },
    { text: "09:00" },
    { text: "09:30" },
    { text: "10:00" },
    { text: "10:30" },
    { text: "11:00" },
    { text: "11:30" },
    { text: "12:00" },
    { text: "12:30" },
    { text: "13:00" },
    { text: "13:30" },
    { text: "14:00" },
    { text: "14:30" },
    { text: "15:00" },
    { text: "15:30" },
    { text: "16:00" },
    { text: "16:30" },
    { text: "17:00" },
    { text: "17:30" },
    { text: "18:00" },
    { text: "18:30" },
    { text: "19:00" },
    { text: "19:30" },
    { text: "20:00" },
    { text: "20:30" },
    { text: "21:00" },
    { text: "21:30" },
    { text: "22:00" },
    { text: "22:30" },
    { text: "23:00" },
    { text: "23:30" },
  ];
  return (
    <div>
      <div className="mt-4 mx-auto lg:max-w-[30%]">
        <div className="bg-white rounded-[12px] w-full  m-auto px-4 py-6 my-6 shadow lg:min-w-[50%]">
          <div>
            <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
              <Typography
                textColor="text-primary"
                textWeight="font-bold"
                textSize="text-[14px]"
              >
                Schedule product activation
              </Typography>
              <Image
                src={closeicon}
                alt=""
                onClick={closeSchedule}
                className="cursor-pointer"
              />
            </div>

            <DateInput
              placeholder={"Select Date"}
              // value={""}
              setValue={(data) => {
                console.log(data);
              }}
              label="Date"
              onFocus={() => {
                setDateInputIsactive(true);
              }}
              onBlur={() => {
                setDateInputIsactive(false);
              }}
            />
            <div
              className="w-full"
              style={{
                display: dateinputIsActive ? "none" : "block",
              }}
            >
              <SelectInput
                index={10}
                placeholder={"Product Tags"}
                label="Tags"
                value={schedule.time}
                setValue={(data) => {
                  setSchedule((prevData) => {
                    return { ...prevData, time: data };
                  });
                }}
                data={timearray}
              />
            </div>
            <div className="my-6 flex items-center justify-center lg:justify-end ">
              <Button
                children="Schedule activation"
                btnSize="small"
                minWidth="min-w-[100%]"
                variant="primary"
                clickHandler={() => {
                  closeSchedule();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShecduleProduct;
