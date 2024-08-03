import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Button from "../../Button";
import lineargradient from "../../../public/assets/image/lineargradient.png";
import topImage from "../../../public/assets/image/Group-33956.png";
import groupIcon from "../../../public/assets/svg/group-icon.svg";
import customerIcon from "../../../public/assets/svg/customergradient.svg";
import classes from "./index.module.css";
const SendMoney = ({ closeModal }) => {
  return (
    <div className="w-full flex items-center justify-center mt-6 min-h-[50vh]">
      <div className="bg-white p-4 rounded-[12px] w-full  lg:w-[35%]  min-h-[80vh]">
        <div>
          <div className="flex items-center justify-between">
            <Typography
              textColor="text-black"
              textWeight="font-[700]"
              textSize="text-[18px]"
            >
              Transaction details
            </Typography>
            <div
              onClick={() => {
                closeModal("");
              }}
              className="cursor-pointer"
            >
              <Image src={closeIcon} />
            </div>
          </div>
          <div
            className={`border-dashed border-gray-200 border-t-[1.5px] mt-4 pt-6`}
          >
            <div
              className={`flex items-center gap-4 relative mb-6 cursor-pointer`}
              onClick={() => {
                closeModal("Manually");
              }}
            >
              <Image src={topImage} className="absolute top-0 right-2" />
              <div className="absolute top-0 left-0">
                <div className="flex items-center gap-5 h-[77px] pl-6">
                  <Image src={groupIcon} />
                  <Typography
                    textColor="text-white"
                    textWeight="font-[700]"
                    textSize="text-[18px]"
                  >
                    Send manually
                  </Typography>
                </div>
              </div>
              <Image
                src={lineargradient}
                alt=""
                className="h-[77px] w-[100%]"
              />
            </div>
            <div
              className={`flex items-center gap-4 relative cursor-pointer`}
              onClick={() => {
                closeModal("Beneficiaries");
              }}
            >
              <Image src={topImage} className="absolute top-0 right-2" />
              <div className="absolute top-0 left-0">
                <div className="flex items-center gap-5 h-[77px] pl-6">
                  <Image src={customerIcon} />
                  <Typography
                    textColor="text-white"
                    textWeight="font-[700]"
                    textSize="text-[18px]"
                  >
                    Select from beneficiaries
                  </Typography>
                </div>
              </div>
              <Image
                src={lineargradient}
                alt=""
                className="h-[77px] w-[100%]"
              />
            </div>
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

export default SendMoney;
