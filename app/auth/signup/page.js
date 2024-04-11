"use client";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import ProgressBar from "@/app/components/ProgressBar";
import TextInput from "@/app/components/TextInput";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
  return (
    <section className="w-full bg-white p-4 flex items-center justify-center ">
      <div className={`flex gap-8 max-w-7xl `}>
        <div className={`${classes.first_Container} max-w-lg	`}>
          <Logo />
          <div className="mt-16">
            <Typography
              textColor="text-primary"
              textWeight="font-bold"
              textSize="text-[32px]"
            >
              Sign Up
            </Typography>
            <Typography
              textWeight="font-normal"
              textSize="text-[14px]"
              verticalPadding="my-1"
            >
              Please fill in the information below to register as a vendor
            </Typography>
            <ProgressBar step={1} />
            <TextInput
              label="Business name"
              placeholder="Enter your business name"
              setValue={(data) => {}}
            />
            <TextInput
              label="Business email "
              placeholder="Enter your business official email address"
              setValue={(data) => {}}
            />
            <TextInput
              label="Business phone number "
              placeholder="Enter your business official phone number "
              setValue={(data) => {}}
            />
            <TextInput
              label="Business address"
              placeholder="Enter your business official address"
              setValue={(data) => {}}
            />
            <div className="mt-10">
              <Button
                children="Continue"
                btnSize="large"
                variant="primary"
                clickHandler={() => {
                  router.push(`../auth/businessinfo`);
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

export default SignUp;
