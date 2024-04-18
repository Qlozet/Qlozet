"use client";
import { useState } from "react";
import Button from "@/app/components/Button";
import Logo from "@/app/components/Logo";
import TextInput from "@/app/components/TextInput";
import Typography from "@/app/components/Typography";
import classes from "./index.module.css";
import PasswordInput from "@/app/components/PasswordInput";
import PasswordValidate from "@/app/components/PasswordValidation";
import {
  handleContainsSymbolOrCharacter,
  handlerContainsNumber,
} from "@/utils/helper";
const Page = () => {
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
            }}
          />
          <PasswordInput
            label="New password"
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
            }}
          />
          <PasswordInput
            label="Confirm password"
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
              handleCheckPassword(data);
            }}
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
              clickHandler={() => {
                setStep(step + 1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
