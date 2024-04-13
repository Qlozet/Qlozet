import { useState } from "react";
import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import PasswordInput from "../../PasswordInput";
import PasswordValidate from "../../PasswordValidation";
import {
  handlerContainsNumber,
  handleContainsSymbolOrCharacter,
} from "@/utils/helper";
const Step4 = () => {
  const [checkPassword, setCheckPassword] = useState({
    moreThan8: false,
    containSymbol: false,
    containNumber: false,
  });
  const handleCheckPassword = (data) => {
    const containsCharacter = handleContainsSymbolOrCharacter(data);
    const containsNumber = handlerContainsNumber(data);
    if (containsCharacter) {
      setCheckPassword((prevData) => {
        return { ...prevData, containSymbol: true };
      });
    }
    if (containsNumber) {
      setCheckPassword((prevData) => {
        return { ...prevData, containNumber: true };
      });
    }
    if (data.length > 7) {
      setCheckPassword((prevData) => {
        return { ...prevData, moreThan8: true };
      });
    }
    if (!containsCharacter) {
      setCheckPassword((prevData) => {
        return { ...prevData, containSymbol: false };
      });
    }
    if (!containsNumber) {
      setCheckPassword((prevData) => {
        return { ...prevData, containNumber: false };
      });
    }
    if (data.length < 8) {
      setCheckPassword((prevData) => {
        return { ...prevData, moreThan8: false };
      });
    }
  };
  return (
    <div>
      <Logo />
      <div className="mt-16">
        <Typography
          textColor="text-primary"
          textWeight="font-bold"
          textSize="text-[32px]"
        >
          Create password
        </Typography>
        <Typography
          textWeight="font-normal"
          textSize="text-[14px]"
          verticalPadding="my-2"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <Typography
          textWeight="font-bold"
          textSize="text-[14px]"
          verticalPadding="my-4"
        >
          Create password to secure your account
        </Typography>
        <ProgressBar step={4} />
        <PasswordInput
          label="Create password"
          setValue={(data) => {
            handleCheckPassword(data);
          }}
        />
        <div className="mt-2">
          <PasswordInput label="Confirm password" />
        </div>
        <div className="mt-4">
          <PasswordValidate
            text="Password must contain at least 8 characters"
            checked={checkPassword.moreThan8}
          />
        </div>
        <div className="mt-2">
          <PasswordValidate
            text="Password must contain a symbol or character"
            checked={checkPassword.containSymbol}
          />
        </div>
        <div className="mt-2">
          <PasswordValidate
            text="Password must contain a number"
            checked={checkPassword.containNumber}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4;
