"use client";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import ProgressBar from "@/app/components/ProgressBar";
import TextInput from "@/app/components/TextInput";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { businessSchema } from "@/schema";
import UploadSingleDocInput from "@/app/components/UploadSingleDocInput";
const BusinessInfo = () => {
  const userData = {
    businessName: "prombxd",
    businessEmail: "promiseejiro43@gmail.com",
    // phoneNumber: "09030257743",
    businessAddress: "hfedgheejhs",
  };
  const handleValidate = (schema, formData) => {
    const validatedData = schema.safeParse(formData);
    console.log("Valid data:", validatedData);
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
              Sign Up
            </Typography>
            <Typography
              textWeight="font-normal"
              textSize="text-[14px]"
              verticalPadding="my-2"
            >
              Please fill in the information below to register as a vendor
            </Typography>
            <ProgressBar step={3} />
            <Typography
              textWeight="font-bold"
              textSize="text-[14px]"
              verticalPadding="my-4"
            >
              Upload Business CAC document
            </Typography>
            <UploadSingleDocInput />
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

export default BusinessInfo;
