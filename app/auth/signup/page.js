"use client";
import { useState } from "react";
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

const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessLogo, setBusinessLogo] = useState("");
  const [businessFiles, setBusinessFiles] = useState("");
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
    setBusinessLogo(file[0]);
  };

  const handleSelectFile = (files) => {
    setBusinessFiles(files[0]);
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
        formData.append("cacDocument", businessFiles);
        formData.append("businessLogo", businessLogo);
        const response = await postRequest(`/vendor/signup`, formData, true);
        if (response.success) {
          setIsLoading(false);
          toast(<Toast text={response.message} type="success" />);
          // toast.success(response.message);
        } else {
          setIsLoading(true);
          toast(<Toast text={response.message} type="dander" />);
        }
        console.log(response);
      } else {
        setrequiredFormData((prevData) => {
          return { prevData, ...data };
        });
      }
    } catch (error) {
      toast.success("Error", error);
    }
  };

  return (
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-8 max-w-7xl `}>
        {step === 1 && (
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Logo />
            <div className="mt-12">
              {/* <Image src={previousIcon} alt="" onClick={backHandler} /> */}
            </div>
            <Step1
              formData={businessInfo}
              setFormData={setBusinessInfo}
              setRequiredFormData={setrequiredFormData}
              requiredFormData={requiredFormData}
            />
            <div className="mt-10">
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
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Logo />
            <div className="mt-12">
              <Image src={previousIcon} alt="" onClick={backHandler} />
            </div>
            <Step2
              formData={personalInfo}
              setFormData={setPersonalInfo}
              requiredData={requiredFormData}
              setRequiredData={setrequiredFormData}
            />
            <div className="mt-10">
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
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Logo />
            <div className="mt-12">
              <Image src={previousIcon} alt="" onClick={backHandler} />
            </div>
            <Step3 handleSelect={handleSelectFile} />
            <div className="mt-10">
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
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Logo />
            <div className="mt-12">
              <Image src={previousIcon} alt="" onClick={backHandler} />
            </div>
            <Step4 handleSelect={handleSelectLogo} />
            <div className="mt-10">
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
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Logo />
            <div className="mt-12">
              <Image src={previousIcon} alt="" onClick={backHandler} />
            </div>
            <Step5
              formData={passwordInfo}
              setFormData={setPasswordInfo}
              setRequiredData={setrequiredFormData}
              requiredData={requiredFormData}
            />
            <div className="mt-10">
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
    </section>
  );
};

export default SignUp;
