import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import TextInput from "../../TextInput";
import NumberInput from "../../NumberInput";
import classes from "./index.module.css";
import Button from "../../Button";

const Step2 = () => {
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
          verticalPadding="my-1"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <ProgressBar step={2} />
        <TextInput
          label="Personal name"
          placeholder="Enter your name"
          setValue={(data) => {}}
        />

        <TextInput
          label="Phone number "
          placeholder="Enter your phone number "
          setValue={(data) => {}}
        />
        <TextInput
          label="National Identity Number"
          placeholder="Enter your business official phone number"
          setValue={(data) => {}}
        />
      </div>
    </div>
  );
};
export default Step2;
