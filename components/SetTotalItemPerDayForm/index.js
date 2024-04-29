import Typography from "../Typography";
import Image from "next/image";
import closeIcon from "../../public/assets/svg/material-symbols_close-rounded.svg";
import NumberInput from "../NumberInput";
import Button from "../Button";

const SetTotalOrderPerDay = ({ closeModal }) => {
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
            <div onClick={closeModal}>
              <Image src={closeIcon} />
            </div>
          </div>
          <div></div>
          <div className="border-dashed border-gray-200 border-t-[1px] mt-4 pt-6">
            <Typography
              textColor="text-black"
              textWeight="font-[300]"
              textSize="text-[14px]"
            >
              You can set the number of orders you want to receive for your
              customisable/tailored outflit
            </Typography>
            <div className="mt-4">
              <NumberInput
                label="Set number of orders you want to receive in a day"
                placeholder="Enter number"
              />
            </div>
            <div className="mt-10 flex items-center justify-end">
              <Button
                children="Continue"
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

export default SetTotalOrderPerDay;
