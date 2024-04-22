import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Button from "../../Button";
import lineargradient from "../../../../public/assets/image/lineargradient.png";
import topImage from "../../../../public/assets/image/Group-33956.png";
import groupIcon from "../../../../public/assets/svg/group-icon.svg";
import customerIcon from "../../../../public/assets/svg/customergradient.svg";
import TextInput from "../../TextInput";
import SelectInput from "../../SelectInput";
import NumberInput from "../../NumberInput";
import CheckBoxInput from "../../CheckboxInput";
// import classes from "./index.module.css";
const SendMoneyForm = ({ closeModal }) => {
  const dropdownData = [
    {
      text: "Set as default warehouse",
      color: "",
    },
    {
      text: "Set as default warehouse",
      color: "",
    },
  ];
  return (
    <div className="w-full flex items-center justify-center mt-6 min-h-[50vh]">
      <div className="bg-white p-4 rounded-[12px] w-[35%]  min-h-[80vh]">
        <div>
          <div className="flex items-center justify-between">
            <Typography
              textColor="text-black"
              textWeight="font-[700]"
              textSize="text-[18px]"
            >
              Send Money
            </Typography>

            <div onClick={closeModal} className="cursor-pointer">
              <Image src={closeIcon} />
            </div>
          </div>
          <div
            className={`border-dashed border-gray-200 border-t-[1.5px] mt-4 pt-6`}
          >
            <SelectInput
              placeholder={"Select an option"}
              // value={dropDownValue}
              setValue={(data) => {
                //   setDropDownValue(data);
              }}
              data={dropdownData}
              label="Select bank"
            />
            <NumberInput
              label="Account number"
              placeholder="Enter Account number"
              setValue={(data) => {}}
            />

            <TextInput
              label="Account name"
              placeholder="Enter Account number"
              setValue={(data) => {}}
            />
            <NumberInput
              label="Amount"
              placeholder="Enter Amount"
              setValue={(data) => {}}
            />
            <TextInput
              label="Narration"
              placeholder="Enter Narration"
              setValue={(data) => {}}
            />
            <TextInput
              label="Schedule payment"
              placeholder="Enter Schedule payment"
              setValue={(data) => {}}
            />
            <CheckBoxInput label="Billing address same as company details" />
            <div className="flex items-center justify-end mt-10">
              <Button
                children="Continue"
                btnSize="large"
                variant="primary"
                maxWidth="max-w-[8rem]"
                clickHandler={() => {
                  // setStep(step + 1);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoneyForm;
