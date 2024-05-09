import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import TextInput from "../../TextInput";
import NumberInput from "../../NumberInput";
import classes from "./index.module.css";
import Button from "../../Button";
const Step2 = ({ formData, setFormData, requiredData, setRequiredData }) => {
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
          verticalPadding="my-1"
          textColor="text-dark"
        >
          Please fill in the information below to register as a vendor
        </Typography>
        <ProgressBar step={2} />
        <TextInput
          label="Personal name"
          placeholder="Enter your name"
          value={formData.personalName}
          error={requiredData.personalName}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, personalName: data };
            });
            if (data) {
              setRequiredData((prevData) => {
                return { ...prevData, personalName: false };
              });
            } else {
              setRequiredData((prevData) => {
                return { ...prevData, personalName: true };
              });
            }
          }}
        />

        <TextInput
          label="Phone number "
          placeholder="Enter your phone number "
          error={requiredData.phoneName}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, phoneName: data };
            });
            if (data) {
              setRequiredData((prevData) => {
                return { ...prevData, phoneName: false };
              });
            } else {
              setRequiredData((prevData) => {
                return { ...prevData, phoneName: true };
              });
            }
          }}
        />
        <TextInput
          label="National Identity Number"
          placeholder="Enter your business official phone number"
          error={requiredData.nationalIdentityNumber}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, nationalIdentityNumber: data };
            });
            if (data) {
              setRequiredData((prevData) => {
                return { ...prevData, nationalIdentityNumber: false };
              });
            } else {
              setRequiredData((prevData) => {
                return { ...prevData, nationalIdentityNumber: true };
              });
            }
          }}
        />
      </div>
    </div>
  );
};
export default Step2;
