import Typography from "../../Typography";
import Image from "next/image";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import Button from "../../Button";
import TextInput from "../../TextInput";
import SelectInput from "../../SelectInput";
import NumberInput from "../../NumberInput";
import CheckBoxInput from "../../CheckboxInput";
import { useEffect, useState } from "react";
import { getRequest, postRequest } from "@/api/method";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
// import classes from "./index.module.css";
const SendMoneyForm = ({ closeModal, banks }) => {
  const [fetchingAccountName, setFetchingAccountName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    amount: "",
    naration: "",
    schedulePayment: "",
    billingAddress: false,
  });

  const [requiredFormData, setRequiredFormData] = useState({
    bankName: false,
    accountNumber: false,
    accountName: false,
    amount: false,
    naration: false,
    schedulePayment: false,
  });
  const [bankCode, setBankCode] = useState("");
  const addBeneficiary = async () => {
    try {
      console.log(formData);
      const response = await postRequest("/vendor/beneficiaries", {
        bank: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        amount: formData.amount,
        naration: formData.naration,
        schedulePayment: formData.schedulePayment,
      });
      if (response.data) {
        closeModal("");
        toast(<Toast text={response?.message} type="success" />);
      }
    } catch (error) {}
  };

  const getUserAccountName = async () => {
    if (formData.accountNumber.length === 10) {
      try {
        console.log(bankCode);
        setFetchingAccountName(true);
        const response = await getRequest(
          `vendor/transfer/name-enquiry?bankCode=${bankCode}&accountNumber=${formData.accountNumber}`
        );
        response && setFetchingAccountName(false);
        if (response?.data) {
          setFormData((prevData) => {
            return {
              ...prevData,
              accountName: response?.data?.data?.data?.account_name,
            };
          });
        }
      } catch (error) {}
    }
  };
  useEffect(() => {
    getUserAccountName();
  }, [formData.accountNumber]);
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
              <Image src={closeIcon} alt="" />
            </div>
          </div>
          <div
            className={`border-dashed border-gray-200 border-t-[1.5px] mt-4 pt-6`}
          >
            <SelectInput
              error={requiredFormData.bankName}
              placeholder={"Select an option"}
              // value={dropDownValue}
              setValue={(data) => {
                setFormData((prevData) => {
                  return { ...prevData, bankName: data };
                });
                if (data) {
                  setBankCode(
                    banks.filter((item) => item.name == data)[0]?.code
                  );
                  setRequiredFormData((prevData) => {
                    return { ...prevData, bankName: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, bankName: true };
                  });
                }
              }}
              data={banks.map((item) => {
                return { text: item.name, color: "" };
              })}
              label="Select bank"
              value={formData.bankName}
            />
            <NumberInput
              label="Account number"
              placeholder="Enter Account number"
              setValue={(data) => {
                if (data) {
                  if (data.length < 11) {
                    setFormData((prevData) => {
                      return { ...prevData, accountNumber: data };
                    });
                  }
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, accountNumber: true };
                  });
                }
              }}
              error={requiredFormData.accountNumber}
              value={formData.accountNumber}
              isLoading={fetchingAccountName}
            />

            <TextInput
              label="Account name"
              placeholder="Enter Account number"
              setValue={(data) => {
                setFormData((prevData) => {
                  return { ...prevData, accountName: data };
                });
                if (data) {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, accountName: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, accountName: true };
                  });
                }
              }}
              error={requiredFormData.accountName}
              value={formData.accountName}
            />
            <NumberInput
              label="Amount"
              placeholder="Enter Amount"
              setValue={(data) => {
                setFormData((prevData) => {
                  return { ...prevData, amount: data };
                });
                if (data) {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, amount: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, amount: true };
                  });
                }
              }}
              error={requiredFormData.amount}
              value={formData.amount}
            />
            <TextInput
              label="Narration"
              placeholder="Enter Narration"
              setValue={(data) => {
                setFormData((prevData) => {
                  return { ...prevData, naration: data };
                });
                if (data) {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, naration: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, naration: true };
                  });
                }
              }}
              error={requiredFormData.naration}
              value={formData.naration}
            />
            <TextInput
              label="Schedule payment"
              placeholder="Enter Schedule payment"
              setValue={(data) => {
                setFormData((prevData) => {
                  return { ...prevData, schedulePayment: data };
                });
                if (data) {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, schedulePayment: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, schedulePayment: true };
                  });
                }
              }}
              error={requiredFormData.schedulePayment}
              value={formData.schedulePayment}
            />
            <CheckBoxInput label="Save recipient as beneficiary" />

            <div className="flex items-center justify-end mt-10">
              <Button
                loading={isLoading}
                children="Continue"
                btnSize="large"
                variant="primary"
                maxWidth="max-w-[8rem]"
                clickHandler={() => {
                  addBeneficiary();
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
