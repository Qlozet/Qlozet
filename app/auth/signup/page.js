"use client";
import { useEffect, useState } from "react";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Button from "@/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import Step1 from "@/components/SignUpStep/Step1";
import Step2 from "@/components/SignUpStep/step2";
import Step3 from "@/components/SignUpStep/Step3";
import Step5 from "@/components/SignUpStep/Step5";
import { validator } from "@/utils/helper";
import { postRequest } from "@/api/request";
import Step4 from "@/components/SignUpStep/Step4";
import Toast from "@/components/ToastComponent/toast";
import Logo from "@/components/Logo";
import previousIcon from "../../../public/assets/svg/previousicon.svg";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";

const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessLogo, setBusinessLogo] = useState([]);
  const [businessFiles, setBusinessFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    businessAddress: "",
  });
  const [personalInfo, setPersonalInfo] = useState({
    personalName: "",
    phoneName: "",
    nationalIdentityNumber: "",
  });

  const [passwordInfo, setPasswordInfo] = useState({
    password: "",
    confirmPassword: "",
  });

  const [requiredFormData, setrequiredFormData] = useState({
    businessName: false,
    businessEmail: false,
    businessPhoneNumber: false,
    businessAddress: false,
    personalName: false,
    phoneName: false,
    nationalIdentityNumber: false,
    password: false,
    confirmPassword: false,
  });

  const handleBusinessInfo = () => {
    const { status, data, id } = validator(businessInfo, requiredFormData);
    if (status) {
      setStep(step + 1);
    } else {
      setrequiredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  const handlePersonalInfo = () => {
    const { status, data, id } = validator(personalInfo, requiredFormData);
    if (status) {
      setStep(step + 1);
    } else {
      setrequiredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  const handleSelectLogo = (file) => {
    setBusinessLogo(file);
  };

  const handleSelectFile = (files) => {
    setBusinessFiles(files);
  };
  const backHandler = () => {
    setStep(step - 1);
  };
  const handleSubmit = async () => {
    const { status, data, id } = validator(passwordInfo, requiredFormData);
    try {
      if (status) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("businessName", businessInfo.businessName);
        formData.append("businessEmail", businessInfo.businessEmail);
        formData.append(
          "businessPhoneNumber",
          businessInfo.businessPhoneNumber
        );
        formData.append("businessAddress", businessInfo.businessAddress);
        formData.append("personalName", personalInfo.personalName);
        formData.append(
          "personalPhoneNumber",
          personalInfo.personalPhoneNumber
        );
        formData.append(
          "nationalIdentityNumber",
          personalInfo.nationalIdentityNumber
        );
        formData.append("password", passwordInfo.password);
        formData.append("confirmPassword", passwordInfo.confirmPassword);
        formData.append("cacDocument", businessFiles[0]);
        formData.append("businessLogo", businessLogo[0]);
        console.log(businessFiles);
        console.log(businessLogo);
        const response = await postRequest(`/vendor/signup`, formData, true);
        if (response.success) {
          setIsLoading(false);
          toast(<Toast text={response.message} type="success" />);
        } else {
          setIsLoading(false);
          toast(<Toast text={response.message} type="danger" />);
        }
      } else {
        setIsLoading(false);
        setrequiredFormData((prevData) => {
          return { prevData, ...data };
        });
      }
    } catch (error) {
      setIsLoading(false);
      // toast.success("Error", error);
    }
  };
  return (
    <section className={`h-screen overflow-hidden`}>
      <div
        className={`${classes.section}  md:bg-white block md:flex items-center justify-center`}
      >
        <div className="bg-[rgba(0,0,0,.7)] md:bg-white h-screen w-screen 2xl:flex justify-center items-center overflow-y-scroll md:p-4">
          <div>
            <div className="block md:hidden">
              <DasboardNavWithOutSearch
                addSearch={false}
                setValue={(data) => {}}
                hideNav={true}
              />
            </div>
            <div className="block mt-2 mb-4  md:hidden">
              <Logo />
            </div>
            <div className={`${classes.container} flex gap-8 max-w-7xl `}>
              {step === 1 && (
                <div
                  className={`${classes.first_Container} max-w-lg rounded-[12px]	bg-white mx-4 mb-10`}
                >
                  <div className="hidden md:block">
                    <Logo />
                  </div>

                  <div className="mt-12">
                    {/* <Image src={previousIcon} alt="" onClick={backHandler} /> */}
                  </div>
                  <Step1
                    formData={businessInfo}
                    setFormData={setBusinessInfo}
                    setRequiredFormData={setrequiredFormData}
                    requiredFormData={requiredFormData}
                  />
                  <div className="py-10 flex items-center justify-center m-auto max-w-[200px] md:max-w-full ">
                    <Button
                      children="Continue"
                      btnSize="large"
                      variant="primary"
                      clickHandler={() => {
                        handleBusinessInfo();
                      }}
                    />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div
                  className={`${classes.first_Container} max-w-lg rounded-[12px]	bg-white mx-4 mb-10`}
                >
                  <div className="hidden md:block">
                    <Logo />
                  </div>

                  <div className="mt-12 ml-6 md:ml-0">
                    <Image
                      src={previousIcon}
                      alt=""
                      onClick={backHandler}
                      className="cursor-pointer"
                    />
                  </div>
                  <Step2
                    formData={personalInfo}
                    setFormData={setPersonalInfo}
                    requiredData={requiredFormData}
                    setRequiredData={setrequiredFormData}
                  />
                  <div className="py-10 flex items-center justify-center m-auto max-w-[200px] md:max-w-full ">
                    {" "}
                    <Button
                      children="Continue"
                      btnSize="large"
                      variant="primary"
                      clickHandler={() => {
                        handlePersonalInfo();
                      }}
                    />
                  </div>
                </div>
              )}
              {step === 3 && (
                <div
                  className={`${classes.first_Container} max-w-lg rounded-[12px]	bg-white mx-4 mb-10`}
                >
                  <div className="hidden md:block">
                    <Logo />
                  </div>

                  <div className="mt-12 ml-6 md:ml-0">
                    {" "}
                    <Image
                      src={previousIcon}
                      alt=""
                      onClick={backHandler}
                      className="cursor-pointer"
                    />
                  </div>
                  <Step3
                    handleSelect={handleSelectFile}
                    businessFiles={businessFiles}
                  />
                  <div className="py-10 flex items-center justify-center m-auto max-w-[200px] md:max-w-full ">
                    {" "}
                    <Button
                      children="Continue"
                      btnSize="large"
                      variant="primary"
                      clickHandler={() => {
                        setStep(step + 1);
                      }}
                    />
                  </div>
                </div>
              )}
              {step === 4 && (
                <div
                  className={`${classes.first_Container} max-w-lg rounded-[12px]	bg-white mx-4 mb-10`}
                >
                  <div className="hidden md:block">
                    <Logo />
                  </div>
                  <div className="mt-12 ml-6 md:ml-0">
                    {" "}
                    <Image
                      src={previousIcon}
                      alt=""
                      onClick={backHandler}
                      className="cursor-pointer"
                    />
                  </div>
                  <Step4
                    handleSelect={handleSelectLogo}
                    businessLogo={businessLogo}
                  />
                  <div className="py-10 flex items-center justify-center m-auto max-w-[200px] md:max-w-full ">
                    {" "}
                    <Button
                      children="Continue"
                      btnSize="large"
                      variant="primary"
                      clickHandler={() => {
                        setStep(step + 1);
                      }}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div
                  className={`${classes.first_Container} max-w-lg rounded-[12px]	bg-white mx-4 mb-10`}
                >
                  <div className="hidden md:block ">
                    <Logo />
                  </div>

                  <div className="mt-12 ml-6 md:ml-0">
                    {" "}
                    <Image
                      src={previousIcon}
                      alt=""
                      onClick={backHandler}
                      className="cursor-pointer"
                    />
                  </div>

                  <Step5
                    formData={passwordInfo}
                    setFormData={setPasswordInfo}
                    setRequiredData={setrequiredFormData}
                    requiredData={requiredFormData}
                  />
                  <div className="py-10 flex items-center justify-center m-auto max-w-[200px] md:max-w-full ">
                    {" "}
                    <Button
                      loading={isLoading}
                      children="Submit"
                      btnSize="large"
                      variant="primary"
                      clickHandler={() => {
                        handleSubmit();
                      }}
                    />
                  </div>
                </div>
              )}

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

export default SignUp;
