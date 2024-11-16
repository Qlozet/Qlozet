import { useEffect, useState } from "react";
import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import PasswordInput from "../../PasswordInput";
import PasswordValidate from "../../PasswordValidation";
import {
  handlerContainsNumber,
  handleContainsSymbolOrCharacter,
} from "@/utils/helper";
const Step5 = ({ formData, setFormData, requiredData, setRequiredData }) => {
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

  useEffect(() => {
    handleCheckPassword(formData.password);
  }, []);
  return (
    <div>
      <div className="mt-4 mx-4  lg:mx-0 pt-5 px-2 p lg:px-0 ">
        <Typography
          textColor="text-primary"
          textWeight="font-bold"
          textSize="text-[32px]"
        >
          Create password
        </Typography>
        <Typography
          textWeight="font-normal"
          textSize="text-sm"
          verticalPadding="my-2"
          textColor="text-dark"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <Typography
          textWeight="font-bold"
          textSize="text-sm"
          verticalPadding="my-4"
          textColor="text-dark"
        >
          Create password to secure your account
        </Typography>
        <ProgressBar step={5} />
        <PasswordInput
          value={formData.password}
          label="Create password"
          placeholder="*********"
          setValue={(data) => {
            handleCheckPassword(data);
            setFormData((prevData) => {
              return { ...prevData, password: data };
            });
            if (data) {
              setRequiredData((prevData) => {
                return { ...prevData, password: false };
              });
            } else {
              setRequiredData((prevData) => {
                return { ...prevData, password: true };
              });
            }
          }}
          error={requiredData.password}
        />
        <div className="mt-2">
          <PasswordInput
            value={formData.confirmPassword}
            placeholder="*********"
            label="Confirm password"
            setValue={(data) => {
              setFormData((prevData) => {
                return { ...prevData, confirmPassword: data };
              });
              if (data) {
                setRequiredData((prevData) => {
                  return { ...prevData, confirmPassword: false };
                });
              } else {
                setRequiredData((prevData) => {
                  return { ...prevData, confirmPassword: true };
                });
              }
            }}
            error={requiredData.confirmPassword}
          />
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

export default Step5;
