"use client";
import { useState } from "react";
import Button from "@//components/Button";
import Logo from "@//components/Logo";
import TextInput from "@//components/TextInput";
import Typography from "@//components/Typography";
import classes from "./index.module.css";
import PasswordInput from "@//components/PasswordInput";
import PasswordValidate from "@//components/PasswordValidation";
import validator from "@/utils/validator";
import { postRequest } from "@/api/request";
import { useRouter } from "next/navigation";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
import {
  handleContainsSymbolOrCharacter,
  handlerContainsNumber,
} from "@/utils/helper";
const Page = () => {
  const router = useRouter();
  const [isLoading, setRequesLoading] = useState(false);
  const [checkPassword, setCheckPassword] = useState({
    moreThan8: false,
    containSymbol: false,
    containNumber: false,
    match: false,
  });

  const [formData, setFormData] = useState({
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [requiredFormData, setRequiredFormData] = useState({
    resetCode: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleCheckPassword = (data) => {
    console.log(data);
    const containsCharacter = handleContainsSymbolOrCharacter(data);
    const containsNumber = handlerContainsNumber(data);
    if (containsCharacter) {
      setCheckPassword((prevData) => {
        return { ...prevData, containSymbol: true };
      });
    }
    if (containsNumber) {
      setCheckPassword((prevData) => {
        return { ...prevData, containNumber: true };
      });
    }

    if (data.length > 7) {
      setCheckPassword((prevData) => {
        return { ...prevData, moreThan8: true };
      });
    }
    if (!containsCharacter) {
      setCheckPassword((prevData) => {
        return { ...prevData, containSymbol: false };
      });
    }
    if (!containsNumber) {
      setCheckPassword((prevData) => {
        return { ...prevData, containNumber: false };
      });
    }
    if (data.length < 8) {
      setCheckPassword((prevData) => {
        return { ...prevData, moreThan8: false };
      });
    }
  };

  const handleSubmit = async () => {
    const { status, data, id } = validator(formData, requiredFormData);
    if (status) {
      try {
        setRequesLoading(true);
        const response = await postRequest(`/vendor/reset-password`, {
          resetCode: formData.resetCode,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });
        response && setRequesLoading(false);
        console.log(response);
        if (response.success) {
          toast(<Toast text={response.message} type="success" />);
          router.push("/auth/signin");
        } else {
          toast(<Toast text={response.message} type="danger" />);
        }
      } catch (error) {
        console.log(error);
        toast(<Toast text={error.message} type="danger" />);
      }
    } else {
      setRequiredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  return (
    <div className="bg-[#F8F9FA] h-screen overflow-y-scroll">
      <div className="flex items-center justify-center pt-6">
        <Logo />
      </div>
      <div
        className={`${classes.sub_container} mx-auto rounded-[12px] mt-[5rem]`}
      >
        <div className="border-b-[1.5px] border-gray-200 border-solid  p-4 ">
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[32px]"
          >
            Forgot Password
          </Typography>
        </div>
        <div className="p-4 ">
          <TextInput
            label="Reset code"
            placeholder="Enter reset code sent to your email"
            setValue={(data) => {
              setFormData((prevData) => {
                console.log(prevData);
                return { ...prevData, resetCode: data };
              });

              if (data) {
                setRequiredFormData((prevData) => {
                  return { ...prevData, resetCode: false };
                });
              } else {
                setRequiredFormData((prevData) => {
                  return { ...prevData, resetCode: true };
                });
              }
            }}
            error={requiredFormData.resetCode}
          />
          <PasswordInput
            label="New password"
            placeholder="**********"
            setValue={(data) => {
              handleCheckPassword(data);
              if (data == formData.confirmPassword) {
                setCheckPassword((prevData) => {
                  return { ...prevData, match: true };
                });
              } else {
                setCheckPassword((prevData) => {
                  return { ...prevData, match: false };
                });
              }
              setFormData((prevData) => {
                return { ...prevData, newPassword: data };
              });
              if (data) {
                setRequiredFormData((prevData) => {
                  return { ...prevData, newPassword: false };
                });
              } else {
                setRequiredFormData((prevData) => {
                  return { ...prevData, newPassword: true };
                });
              }
            }}
            error={requiredFormData.newPassword}
          />
          <PasswordInput
            label="Confirm password"
            placeholder="**********"
            setValue={(data) => {
              if (data == formData.newPassword) {
                setCheckPassword((prevData) => {
                  return { ...prevData, match: true };
                });
              } else {
                setCheckPassword((prevData) => {
                  return { ...prevData, match: false };
                });
              }
              setFormData((prevData) => {
                return { ...prevData, confirmPassword: data };
              });
              if (data) {
                setRequiredFormData((prevData) => {
                  return { ...prevData, confirmPassword: false };
                });
              } else {
                setRequiredFormData((prevData) => {
                  return { ...prevData, confirmPassword: true };
                });
              }
              handleCheckPassword(data);
            }}
            error={requiredFormData.confirmPassword}
          />
          <div className="mt-2">
            <PasswordValidate
              text="Password must contain at least 8 characters"
              checked={checkPassword.moreThan8}
            />
          </div>
          <div className="mt-2">
            <PasswordValidate
              text="Password must contain a symbol or character"
              checked={checkPassword.containSymbol}
            />
          </div>
          <div className="mt-2">
            <PasswordValidate
              text="Password must contain a number"
              checked={checkPassword.containNumber}
            />
          </div>
          <div className="mt-2">
            <PasswordValidate
              text="Password must match"
              checked={checkPassword.match}
            />
          </div>
          <div className="my-[3rem]">
            <Button
              children="Create new password"
              btnSize="large"
              variant="primary"
              loading={isLoading}
              clickHandler={() => {
                handleSubmit();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
