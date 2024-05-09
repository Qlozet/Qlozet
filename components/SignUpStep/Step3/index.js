import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import UploadDocInput from "../../UploadDocInput";
const Step3 = ({ handleSelect }) => {
  return (
    <div>
     
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
          Upload Business CAC document
        </Typography>
        <UploadDocInput handleSelect={handleSelect} />
      </div>
    </div>
  );
};
export default Step3;
