import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import TextInput from "../../TextInput";
import NumberInput from "../../NumberInput";
import classes from "./index.module.css";

const step1 = () => {
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
        <ProgressBar step={1} />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business email "
          placeholder="Enter your business official email address"
          setValue={(data) => {}}
        />
        <NumberInput
          label="Business phone number "
          placeholder="Enter your business official phone number "
          setValue={(data) => {}}
        />
        <TextInput
          label="Business address"
          placeholder="Enter your business official address"
          setValue={(data) => {}}
        />
      </div>
    </div>
  );
};
export default step1;
