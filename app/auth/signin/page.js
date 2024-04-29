"use client";
import { useState } from "react";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import arrowRight from "../../../public/assets/svg/arrow-right.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import PasswordInput from "@/app/components/PasswordInput";
import TextInput from "@/app/components/TextInput";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import ProgressBar from "@/app/components/ProgressBar";
import NumberInput from "@/app/components/NumberInput";
import EmailInptut from "@/app/components/EmailInput";
import validator from "@/utils/validator";
import { postRequest } from "@/api/request";
const SignIn = () => {
  const [formData, setFormData] = useState({ businessEmail: "", password: "" });
  const [requiredFormData, setReqiuredFormData] = useState({
    businessEmail: false,
    password: false,
  });

  const handleLogin = async () => {
    const { status, data, id } = validator(formData, requiredFormData);
    if (status) {
      const response =await postRequest(``)
    } else {
      setReqiuredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };
  const router = useRouter();
  return (
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-6 max-w-7xl `}>
        <div className={`${classes.first_Container} max-w-lg	`}>
          <Logo />
          <div className="flex  h-[100%]  items-center translate-y-[-20%]">
            <div className="mt-16">
              <Typography
                textColor="text-primary"
                textWeight="font-bold"
                textSize="text-[32px]"
              >
                Sign In
              </Typography>
              <Typography
                textWeight="font-normal"
                textSize="text-[14px]"
                verticalPadding="my-1"
              >
                Please enter your login details below
              </Typography>
              <EmailInptut
                label="Business email address"
                placeholder="Enter your business official email address"
                setValue={(data) => {
                  setFormData((prevData) => {
                    return { ...prevData, businessEmail: data };
                  });
                  if (data) {
                    setReqiuredFormData((prevData) => {
                      return { ...prevData, businessEmail: false };
                    });
                  } else {
                    setReqiuredFormData((prevData) => {
                      return { ...prevData, businessEmail: true };
                    });
                  }
                }}
                error={requiredFormData.businessEmail}
              />
              <PasswordInput
                label="Password"
                placeholder="************"
                setValue={(data) => {
                  setFormData((prevData) => {
                    return { ...prevData, password: data };
                  });

                  if (data) {
                    setReqiuredFormData((prevData) => {
                      return { ...prevData, password: false };
                    });
                  } else {
                    setReqiuredFormData((prevData) => {
                      return { ...prevData, password: true };
                    });
                  }
                }}
                error={requiredFormData.password}
              />
              <div className="flex items-center justify-end gap-2">
                <Typography
                  textColor="text-primary"
                  textWeight="font-[400]"
                  textSize="text-[12px]"
                >
                  Forgot password
                </Typography>
                <Image src={arrowRight} alt="" />
              </div>
              <div className="mt-10">
                <Button
                  children="Sign In"
                  btnSize="large"
                  variant="primary"
                  clickHandler={() => {
                    handleLogin();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`${classes.second_container} `}>
          <Image src={signupImage} alt="" />
        </div>
      </div>
    </section>
  );
};

export default SignIn;
