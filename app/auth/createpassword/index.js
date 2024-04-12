"use client";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import ProgressBar from "@/app/components/ProgressBar";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import PasswordInput from "@/app/components/PasswordInput";
import RadioInput from "@/app/components/RadioInput";

const createpassword = () => {
  const router = useRouter();
  return (
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-8 max-w-7xl `}>
        <div className={`${classes.first_Container} max-w-lg	`}>
          <Logo />
          <div className="mt-16">
            <Typography
              textColor="text-primary"
              textWeight="font-bold"
              textSize="text-[32px]"
            >
              Create Password
            </Typography>
            <Typography
              textWeight="font-normal"
              textSize="text-[14px]"
              verticalPadding="my-1"
            >
              Create password to secure your account
            </Typography>
            <ProgressBar step={4} />
            <PasswordInput
              label="Create Password "
              placeholder="Enter your name"
              setValue={(data) => {}}
            />

            <PasswordInput
              label="Confirm Password "
              placeholder="Enter your phone number "
              setValue={(data) => {}}
            />

            <RadioInput label="Password must contain at least 8 characters " />
            <RadioInput label="Password must contain a symbol or character " />
            <RadioInput label="Password must contain a number " />

            <div className="mt-10">
              <Button
                children="Continue"
                btnSize="large"
                variant="primary"
                clickHandler={() => {
                  router.push(`#`);
                }}
              />
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

export default createpassword;
