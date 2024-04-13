"use client";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import PasswordInput from "@/app/components/PasswordInput";
import TextInput from "@/app/components/TextInput";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";

const SignIn = () => {
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
              Sign In
            </Typography>
            <Typography
              textColor="text-primary"
              textWeight="font-normal"
              textSize="text-[14px]"
              verticalPadding="my-1"
            >
              Please enter your login details now
            </Typography>

            <TextInput
              label="Business email address"
              placeholder="Enter your business official email address"
              setValue={(data) => {}}
            />

            <PasswordInput
              label="Password "
              placeholder="Enter your password "
              setValue={(data) => {}}
            />

            <div className="mt-10">
              <Button
                children="Sign In"
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

export default SignIn;
