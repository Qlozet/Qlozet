import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import classes from "./index.module.css";
import UploadDocInput from "../../UploadDocInput";
const Step4 = ({ handleSelect, businessLogo }) => {
  return (
    <div className="mx-4">
      <div className="mt-4 mx-4  md:mx-0 pt-5 px-2 p md:px-0 ">
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
          textColor="text-dark"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <ProgressBar step={3} />
        <Typography
          textWeight="font-bold"
          textSize="text-[14px]"
          verticalPadding="my-4"
          textColor="text-dark"
        >
          Upload Business Logo
        </Typography>
        <UploadDocInput
          handleSelect={handleSelect}
          uploadfiles={businessLogo}
          singleUpload={true}
        />
      </div>
    </div>
  );
};
export default Step4;
