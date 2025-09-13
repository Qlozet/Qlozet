"use client";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import classes from "./index.module.css";
import Typography from "@/components/Typography";
import { getRequest } from "@/api/method";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";

interface VerificationParams {
  userid: string;
}

interface VerificationProps {
  params: VerificationParams;
}

const Verication: React.FC<VerificationProps> = ({ params }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const verifyAccount = async (): Promise<void> => {
    try {
      const response = await getRequest(`/vendor/verify/${params.userid}`);
      response && setLoading(false);
      if (response?.success) {
        toast(<Toast text={response?.message} type="success" />);

      } else {
        toast(<Toast text={"An error occured"} type="danger" />);
      }
    } catch (error) {
      toast(<Toast text={error?.message} type="danger" />);
    }
  };
  useEffect(() => {
    verifyAccount();
  }, []);
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      {loading ? (
        <Loader></Loader>
      ) : (
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
                Account created successfully
              </Typography>
            </div>
            <div className="pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200">
              <Typography
                textColor="text-dark"
                textWeight="font-normal"
                textSize=""
                align="text-center"
              >
                Your Altire account has been successfully set up, and we've
                received your information. Our team will thoroughly review the
                details and documents provided. Your account verification status
                will be communicated to you via the email you provided within
                the next 48 hours.
              </Typography>
              <div>
                <p
                  className="text-primary font-medium text-sm center cursor-pointer"
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
      )}
    </section>
  );
};

export default Verication;
