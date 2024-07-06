"use client";
import { useState } from "react";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import arrowRight from "../../../public/assets/svg/arrow-right.svg";
import Image from "next/image";
import Logo from "@//components/Logo";
import Typography from "@//components/Typography";
import PasswordInput from "@//components/PasswordInput";
import Button from "@//components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import EmailInptut from "@//components/EmailInput";
import validator from "@/utils/validator";
import { postRequest } from "@/api/method";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import { setToken } from "@/utils/localstorage";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
const SignIn = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ businessEmail: "", password: "" });
  const [requiredFormData, setReqiuredFormData] = useState({
    businessEmail: false,
    password: false,
  });

  const handleLogin = async () => {
    const { status, data, id } = validator(formData, requiredFormData);
    if (status) {
      try {
        setIsLoading(true);
        const response = await postRequest(`/vendor/login`, {
          businessEmail: formData.businessEmail,
          password: formData.password,
        });
        response && setIsLoading(false);
        console.log(response);
        if (response.success === true) {
          setToken(JSON.stringify(response.data));
          console.log(response);
          router.push("/dashboard");
          toast(<Toast text={response.message} type="success" />);
        } else {
          toast(<Toast text={response.message} type="danger" />);
        }
      } catch (error) {
        console.log(error);
        error && setIsLoading(false);
        // toast(<Toast text={error.message} type="danger" />);
      }
    } else {
      setReqiuredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  return (
    <section className={`h-screen overflow-hidden`}>
      <div
        className={`${classes.section}  lg:bg-white block lg:flex items-center justify-center`}
      >
        <div className="bg-[rgba(0,0,0,.7)] lg:bg-white h-screen w-screen 2xl:flex justify-center items-center overflow-y-scroll lg:p-4">
          <div>
            <div className="block lg:hidden"></div>
            <div className="block mt-2 mb-4  lg:hidden">
              <Logo />
            </div>
            <div className={`${classes.container} flex lg:gap-8 max-w-7xl `}>
              <div
                className={`${classes.first_Container} max-w-lg	p-4 lg:p-0  rounded-[12px]	bg-white mx-4 mb-10`}
              >
                <Logo />
                <div className="flex h-[100%]  items-center translate-y-[-20%]">
                  <div className="mt-[6rem] md:mt-16">
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
                    <EmailInptut
                      label="Business email address"
                      placeholder="Enter your business official email address"
                      setValue={(data) => {
                        setFormData((prevData) => {
                          return { ...prevData, businessEmail: data };
                        });
                        if (data) {
                          setReqiuredFormData((prevData) => {
                            return { ...prevData, businessEmail: false };
                          });
                        } else {
                          setReqiuredFormData((prevData) => {
                            return { ...prevData, businessEmail: true };
                          });
                        }
                      }}
                      error={requiredFormData.businessEmail}
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="************"
                      setValue={(data) => {
                        setFormData((prevData) => {
                          return { ...prevData, password: data };
                        });

                        if (data) {
                          setReqiuredFormData((prevData) => {
                            return { ...prevData, password: false };
                          });
                        } else {
                          setReqiuredFormData((prevData) => {
                            return { ...prevData, password: true };
                          });
                        }
                      }}
                      error={requiredFormData.password}
                    />
                    <div
                      className="flex items-center justify-end gap-2 cursor-pointer"
                      onClick={() => {
                        router.push("/auth/forgetpassword");
                      }}
                    >
                      <Typography
                        textColor="text-primary"
                        textWeight="font-[400]"
                        textSize="text-[12px]"
                      >
                        Forgot password
                      </Typography>
                      <Image src={arrowRight} alt="" />
                    </div>
                    <div className="mt-10">
                      <Button
                        loading={isLoading}
                        children="Sign In"
                        btnSize="large"
                        variant="primary"
                        clickHandler={() => {
                          handleLogin();
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
