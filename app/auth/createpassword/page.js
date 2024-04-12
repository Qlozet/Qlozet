"use client";
import { useState } from "react";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import ProgressBar from "@/app/components/ProgressBar";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { businessSchema } from "@/schema";
import PasswordInput from "@/app/components/PasswordInput";
import PasswordValidate from "@/app/components/PasswordValidation";
import { handlerContainsNumber, handleValidate } from "@/utils/helper";
const CreatePassword = () => {
  const [checkPassword, setCheckPassword] = useState({
    moreThan8: false,
    containSymbol: false,
    containNumber: false,
  });
  const userData = {
    businessName: "prombxd",
    businessEmail: "promiseejiro43@gmail.com",
    phoneNumber: "09030257743",
    businessAddress: "hfedgheejhs",
  };

  function handleContainsSymbolOrCharacter(str) {
    const regex = /[^a-zA-Z0-9]/;
    return regex.test(str);
  }
  const handleCheckPassword = (data) => {
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
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-8 max-w-7xl `}>
        <div className={`${classes.first_Container}`}>
          <Logo />
          <div className="mt-16">
            <Typography
              textColor="text-primary"
              textWeight="font-bold"
              textSize="text-[32px]"
            >
              Create password
            </Typography>
            <Typography
              textWeight="font-normal"
              textSize="text-[14px]"
              verticalPadding="my-2"
            >
              Please fill in the information below to register as a vendor
            </Typography>
            <Typography
              textWeight="font-bold"
              textSize="text-[14px]"
              verticalPadding="my-4"
            >
              Create password to secure your account
            </Typography>
            <ProgressBar step={3} />
            <PasswordInput
              label="Create password"
              setValue={(data) => {
                handleCheckPassword(data);
              }}
            />
            <div className="mt-2">
              <PasswordInput label="Confirm password" />
            </div>
            <div className="mt-4">
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
            <div className="mt-10">
              <Button
                children="Continue"
                btnSize="large"
                variant="primary"
                clickHandler={() => {
                  handleValidate(businessSchema, userData);
                }}
              />
            </div>
          </div>
        </div>
        <div className={`${classes.second_container}`}>
          <Image src={signupImage} alt="" />
        </div>
      </div>
    </section>
  );
};

export default CreatePassword;
