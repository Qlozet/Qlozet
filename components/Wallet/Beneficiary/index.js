import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Button from "../../Button";
import TextInput from "../../TextInput";
import SelectInput from "../../SelectInput";
import NumberInput from "../../NumberInput";
import CheckBoxInput from "../../CheckboxInput";
import SearchInput from "@/components/SearchInput";
import ArrowRightIcon from "../../../public/assets/svg/forward.svg";
import { useEffect, useState } from "react";
import { getRequest } from "@/api/method";
// import classes from "./index.module.css";
const Beneficiary = ({ closeModal }) => {
  const [beneficairy, setBeneficairy] = useState([]);

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

  const getBeneficiary = async () => {
    try {
      const response = await getRequest("/vendor/beneficiaries");
      let savedBeneneficiaries = [];
      if (response?.data) {
        response?.data?.beneficiaries.map((item) => {
          const beneficairy = {
            bankName: item?.bank,
            accountNumber: item?.accountNumber,
            accountName: item?.accountName,
            amount: `${item?.amount}`,
            naration: item?.naration,
            schedulePayment: item?.schedulePayment,
            billingAddress: false,
          };
          savedBeneneficiaries.push(beneficairy);
        });
        setBeneficairy(savedBeneneficiaries);
      }
    } catch (error) { toast(<Toast text={"An error occured"} type="danger" />); }
  };
  useEffect(() => {
    getBeneficiary();
  }, []);
  return (
    <div className="w-full flex items-center justify-center mt-6 min-h-[50vh]">
      <div className="bg-white p-4 rounded-[12px] w-full lg:w-[35%]  min-h-[80vh] mx-4 lg:mx-0">
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
            <SearchInput placeholder="Search" />
            {beneficairy.map((item) => {
              return (
                <div className="flex items-center justify-between my-4">
                  <div className="flex items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className=" w-[2rem] h-[2rem] rounded-[50%] bg-[#FF9E57] flex items-center justify-center text-white font-medium text-sm">
                          {item.accountName.slice(0, 2)}
                        </div>
                      </div>
                      <div>
                        <Typography
                          textColor="text-dark"
                          textWeight="font-bold"
                          textSize="text-sm"
                        >
                          {item.accountName}
                        </Typography>
                        <div className="flex items-center gap-3">
                          <Typography
                            textColor="text-gray-100"
                            textWeight="font-bold"
                            textSize="text-xs"
                          >
                            {item.accountNumber}
                          </Typography>
                          <div>
                            <div className="w-[.3rem] h-[.3rem] rounded-[50%] bg-gray-200">
                              {" "}
                            </div>
                          </div>
                          <Typography
                            textColor="text-gray-100"
                            textWeight="font-bold"
                            textSize="text-xs"
                          >
                            {item.bankName}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Image src={ArrowRightIcon} alt="" />
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-end mt-10 gap-4">
              <Button
                children="Close"
                btnSize="large"
                variant="outline"
                maxWidth="max-w-[8rem]"
                clickHandler={() => {
                  // setStep(step + 1);
                }}
              />
              <Button
                children="Send money"
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

export default Beneficiary;
