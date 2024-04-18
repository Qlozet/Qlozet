"use client";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import arrowRignt from "../../../public/assets/svg/arrow-right.svg";
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

const SignIn = () => {
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
              <TextInput
                label="Business email address"
                placeholder="Enter your business official email address"
                setValue={(data) => {}}
              />
              <PasswordInput
                label="Create password"
                setValue={(data) => {
                  console.log(data);
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <Typography
                  textColor="text-primary"
                  textWeight="font-[400]"
                  textSize="text-[12px]"
                >
                  Forgot password
                </Typography>
                <Image src={arrowRignt} />
              </div>
              <div className="mt-10">
                <Button
                  children="Sign In"
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
        <div className={`${classes.second_container} `}>
          <Image src={signupImage} alt="" />
        </div>
      </div>
    </section>
  );
};

export default SignIn;
