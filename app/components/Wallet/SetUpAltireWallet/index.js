import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import NumberInput from "../../NumberInput";
import Button from "../../Button";
import TextInput from "../../TextInput";

const SetUpAltireWallet = ({ closeModal }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center ">
      <div className="bg-white p-4 rounded-[12px] w-[40%]">
        <div>
          <div className="flex items-center justify-between">
            <Typography
              textColor="text-black"
              textWeight="font-[500]"
              textSize="text-[14px]"
            >
              Set total order per day
            </Typography>
            <div onClick={closeModal} className="cursor-pointer">
              <Image src={closeIcon} />
            </div>
          </div>
          <div></div>
          <div className="border-dashed border-gray-200 border-t-[1px] mt-4 pt-6">
            <div className="mt-4">
              <NumberInput
                label="Bank verification number"
                placeholder="1234567891"
              />
            </div>
            <div className="mt-4">
              <TextInput
                label="Name"
                placeholder="Enter name"
                setValue={(data) => {}}
              />
            </div>
            <div className="mt-4">
              <NumberInput label="Phone number" placeholder="08012345678" />
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
    </div>
  );
};

export default SetUpAltireWallet;
