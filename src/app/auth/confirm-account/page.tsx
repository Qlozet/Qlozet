"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import classes from "./index.module.css";
import Typography from "@/components/Typography";
import { useAppSelector } from "@/redux/store";
const Verication: React.FC = () => {
  const email = useAppSelector((state) => state.filter.email);
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      <div className={`${classes.container}  max-w-[735px] `}>
        <div className="py-16 flex justify-center">
          <Logo brown={true} />
        </div>
        <div className={`${classes.sub_container} py-6 rounded-[16px] `}>
          <div className="pb-2">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[24px]"
              align="text-center"
            >
              Confirm Your Email
            </Typography>
          </div>
          <div className="pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize=""
              align="text-center"
            >
              We've sent a verification email to <span className="font-medium">{email}</span>. Please check your inbox for the email and click the verification link inside to activate your account.
              If you haven't received the email, please check your spam or junk folder.           </Typography>
            <div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verication;
