"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@//components/Button";
import Logo from "@//components/Logo";
import TextInput from "@//components/TextInput";
import Typography from "@//components/Typography";
import classes from "./index.module.css";
import validator from "@/utils/validator";
import { postRequest } from "@/api/method";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import { 
  ForgotPasswordData, 
  ApiResponse, 
  ValidationResult 
} from "@/types";

interface ForgotPasswordFormValidation {
  businessEmail: boolean;
}

const Page: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordData>({ businessEmail: "" });
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [reqiuredFormData, setRequiredFormData] = useState<ForgotPasswordFormValidation>({
    businessEmail: false,
  });
  const submitEmail = async (): Promise<void> => {
    const { status, data } = validator(formData, reqiuredFormData) as ValidationResult;
    if (status) {
      setIsloading(true);
      try {
        const response = await postRequest(`/vendor/forgot-password`, {
          businessEmail: formData.businessEmail,
        }) as ApiResponse;
        if (response.success) {
          toast(<Toast text={response.message} type="success" />);
          router.push("/auth/createnewpassword");
        } else {
          toast(<Toast text={response.message} type="danger" />);
        }
        setIsloading(false);
      } catch (error) {
        toast(<Toast text="An error occurred" type="danger" />);
        setIsloading(false);
      }
    } else {
      setRequiredFormData((prevData) => {
        return { ...prevData, ...data };
      });
    }
  };
  return (
    <section
      className={`  h-screen overflow-y-scroll 2xl:flex justify-center items-center`}
    >
      <div className={`${classes.section} w-full lg:bg-white block`}>
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
              setValue={(data: string) => {
                setFormData((prevData) => {
                  return { ...prevData, businessEmail: data };
                });

                if (data) {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, businessEmail: false };
                  });
                } else {
                  setRequiredFormData((prevData) => {
                    return { ...prevData, businessEmail: true };
                  });
                }
              }}
              error={reqiuredFormData.businessEmail}
            />
            <div className="my-[3rem]">
              <Button
                loading={isLoading}
                children="Send password reset link"
                btnSize="large"
                variant="primary"
                clickHandler={() => {
                  submitEmail();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
