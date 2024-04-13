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

const SignUp = () => {
  const [step, setStep] = useState(1);

  const router = useRouter();
  return (
    <section
      className={`${classes.section} w-full bg-white p-4 flex items-center justify-center `}
    >
      <div className={`${classes.container} flex gap-8 max-w-7xl `}>
        {step === 1 && (
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Step1 />
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
        {step === 2 && (
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Step2 />
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
        {step === 3 && (
          <div className={`${classes.first_Container} max-w-lg	`}>
            <Step3 />
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
            <Step3 />
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
            <Step5 />
            <div className="mt-10">
              <Button
                children="Submit"
                btnSize="large"
                variant="primary"
                clickHandler={() => {
                  // setStep(step + 1);
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
