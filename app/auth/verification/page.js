"use client";
import Logo from "@/components/Logo";
import classes from "./index.module.css";
import Typography from "@/components/Typography";
import { useRouter } from "next/navigation";
import { getRequest } from "@/api/method";
import { useEffect } from "react";

const Verication = ({ params }) => {
  console.log(params);
  const router = useRouter();
  const verifyCode = async () => {
    const response = await getRequest("/vendor/verify");
  };

  useEffect(() => {
    verifyCode();
  });
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      <div className={`${classes.container}  max-w-[735px] `}>
        <div className="py-16 flex justify-center">
          <Logo />
        </div>
        <div className={`${classes.sub_container} py-6 rounded-[16px] `}>
          <div className="pb-2">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[24px]"
              align="text-center"
            >
              Account created successfully
            </Typography>
          </div>
          <div className="pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[16px]"
              align="text-center"
            >
              Your Altire account has been successfully set up, and we've
              received your information. Our team will thoroughly review the
              details and documents provided. Your account verification status
              will be communicated to you via the email you provided within the
              next 48 hours.
            </Typography>
            <div>
              <p
                className="text-primary font-[500] text-[14px] center cursor-pointer"
                onClick={() => {
                  router.push("/auth/signin");
                }}
              >
                Return to login
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verication;
