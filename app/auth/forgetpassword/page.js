"use client";
import Button from "@/app/components/Button";
import Logo from "@/app/components/Logo";
import TextInput from "@/app/components/TextInput";
import Typography from "@/app/components/Typography";
import classes from "./index.module.css";
const Page = () => {
  return (
    <div className="bg-[#F8F9FA] h-screen">
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
            label="Business email address"
            placeholder="Enter your business official email address"
            setValue={(data) => {}}
          />
          <div className="my-[3rem]">
            <Button
              children="Send password reset link"
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
