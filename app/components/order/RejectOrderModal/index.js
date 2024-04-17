import { useState } from "react";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import SelectInput from "../../SelectInput";
import TextArea from "../../TextAreaInput";
import Typography from "../../Typography";
import Image from "next/image";
import Button from "../../Button";
const RejectOrderModal = ({ closeModal }) => {
  const [dropDownValue, setDropDownValue] = useState("");

  const dropdownData = [
    {
      text: "Sold out",
      color: "",
    },
    {
      text: "Inadequate information from customer",
      color: "",
    },
    {
      text: "Others",
      color: "",
    },
  ];
  return (
    <div className="p-4 bg-white rounded-[12px] w-[50%] m-auto">
      <div className="pb-6 border-dashed border-gray-200 border-b-[1.5px] flex items-center justify-between">
        <Typography
          textColor="text-primary"
          textWeight="font-bold"
          textSize="text-[14px]"
        >
          Reject Order
        </Typography>
        <div onClick={closeModal} className="cursor-pointer">
          <Image src={closeIcon} />
        </div>
      </div>
      <div className="pt-6 pb-8">
        <Typography
          textColor="text-primary"
          textWeight="font-[300]"
          textSize="text-[14px]"
        >
          Tell us why you’re rejecting this order
        </Typography>
        <div className="mt-4">
          <SelectInput
            placeholder={"Select an option"}
            value={dropDownValue}
            setValue={(data) => {
              setDropDownValue(data);
            }}
            data={dropdownData}
            label="Why are you rejecting this order"
          />
          <div>
            <TextArea
              placeholder="Tell us the reason you’re rejecting this order"
              label="Enter a reason"
            />
          </div>
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Submit"
              btnSize="large"
              variant="primary"
              clickHandler={() => {}}
              maxWidth="max-w-[12rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectOrderModal;
