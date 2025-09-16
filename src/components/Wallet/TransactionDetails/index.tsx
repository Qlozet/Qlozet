import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "@/public/assets/svg/material-symbols_close-rounded.svg";
import NumberInput from "../../NumberInput";
import Button from "../../Button";
import TextInput from "../../TextInput";
import OrderStatus from "../../order/OrderStatus";

const TransactionDetails = ({ closeModal, details }) => {
  return (
    <div className="w-full flex items-center justify-center mt-6">
      <div className="bg-white p-4 rounded-[12px] w-[40%]">
        <div>
          <div className="flex items-center justify-between">
            <Typography
              textColor="text-black"
              textWeight="font-[700]"
              textSize="text-[18px]"
            >
              Transaction details
            </Typography>

            <div onClick={closeModal} className="cursor-pointer">
              <Image src={closeIcon} alt="" />
            </div>
          </div>

          <div className="border-dashed border-gray-200 border-t-[1px] mt-4 pt-6">
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Transaction ID
                </Typography>
              </div>

              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                {details.transactionId}
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Amount
                </Typography>
              </div>

              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                {details.amount}
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Date
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                {details.date}
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Transaction type
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                {details.transactionType}
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Beneficiary
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                Kola Olushola
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Beneficiary account/bank
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                3109876543 - Firstbank
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Narration
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                {details.narration}
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Balance before
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                NGN 200,000
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Balance after
                </Typography>
              </div>
              <Typography
                textColor="text-black"
                textWeight="font-[700]"
                textSize="text-sm"
              >
                NGN 200,000
              </Typography>
            </div>
            <div className="flex items-center gap-8 border-b-[1.5px] border-solid border-gray-300 py-4">
              <div className="w-[40%]">
                <Typography
                  textColor="text-black"
                  textWeight="font-medium"
                  textSize="text-sm"
                >
                  Status
                </Typography>
              </div>
              <OrderStatus
                text="Pending"
                bgColor="bg-[#FFF7DE]"
                color="text-[#FFB020]"
                addMaxWidth={true}
              />
            </div>
            <div className="mt-10 flex items-center justify-end">
              <Button
                children="Close"
                btnSize="large"
                variant="primary"
                clickHandler={() => { }}
                maxWidth="max-w-[12rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
