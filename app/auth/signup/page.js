"use client";
import { useState } from "react";
import signupImage from "../../../public/assets/svg/signupImage.svg";
import Image from "next/image";
import Logo from "@/app/components/Logo";
import Typography from "@/app/components/Typography";
import ProgressBar from "@/app/components/ProgressBar";
import TextInput from "@/app/components/TextInput";
import Button from "@/app/components/Button";
import classes from "./index.module.css";
import { useRouter } from "next/navigation";
import NumberInput from "@/app/components/NumberInput";
import Step1 from "@/app/components/SignUpStep/Step1";
import Step2 from "@/app/components/SignUpStep/step2";
import Step3 from "@/app/components/SignUpStep/Step3";
import Step5 from "@/app/components/SignUpStep/Step5";
import { validator } from "@/utils/helper";
import { postRequest } from "@/api/request";
import Step4 from "@/app/components/SignUpStep/Step4";
const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessLogo, setBusinessLogo] = useState("");
  const [businessFiles, setBusinessFiles] = useState("");

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

  const handleSubmit = async () => {
    console.log('clicked');
    const { status, data, id } = validator(passwordInfo, requiredFormData);
    if (status) {
      const formData = new FormData();
      formData.append("businessName", businessInfo.businessName);
      formData.append("businessEmail", businessInfo.businessEmail);
      formData.append("businessPhoneNumber", businessInfo.businessPhoneNumber);
      formData.append("businessAddress", businessInfo.businessAddress);
      formData.append("personalName", personalInfo.personalName);
      formData.append("personalPhoneNumber", personalInfo.personalPhoneNumber);
      formData.append(
        "nationalIdentityNumber",
        personalInfo.nationalIdentityNumber
      );
      formData.append("password", passwordInfo.password);
      formData.append("confirmPassword", passwordInfo.confirmPassword);
      formData.append("cacDocument", businessFiles);
      formData.append("businessLogo", businessLogo);
      const response = await postRequest(`/vendor/signup`, formData, true);
      console.log(response);
    } else {
      setrequiredFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  return (
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-8 max-w-7xl `}>
        {step === 1 && (
          <div className={`${classes.first_Container} max-w-lg	`}>
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
            <Step5
              formData={passwordInfo}
              setFormData={setPasswordInfo}
              setRequiredData={setrequiredFormData}
              requiredData={requiredFormData}
            />
            <div className="mt-10">
              <Button
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
