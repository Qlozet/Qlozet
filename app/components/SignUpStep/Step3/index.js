import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import classes from "./index.module.css";
import UploadDocInput from "../../UploadDocInput";

const Step3 = ({ handleSelect }) => {
  return (
    <div>
      <Logo />
      <div className="mt-16">
        <Typography
          textColor="text-primary"
          textWeight="font-bold"
          textSize="text-[32px]"
        >
          Sign Up
        </Typography>
        <Typography
          textWeight="font-normal"
          textSize="text-[14px]"
          verticalPadding="my-2"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <ProgressBar step={3} />
        <Typography
          textWeight="font-bold"
          textSize="text-[14px]"
          verticalPadding="my-4"
        >
          Upload Business CAC document
        </Typography>
        <UploadDocInput handleSelect={handleSelect} />
      </div>
    </div>
  );
};
export default Step3;
