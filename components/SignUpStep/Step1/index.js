import { useState } from "react";
import Logo from "../../Logo";
import Typography from "../../Typography";
import ProgressBar from "../../ProgressBar";
import TextInput from "../../TextInput";
import NumberInput from "../../NumberInput";
import classes from "./index.module.css";
import EmailInptut from "../../EmailInput";
import Image from "next/image";
const step1 = ({
  formData,
  setFormData,
  requiredFormData,
  setRequiredFormData,
}) => {
  return (
    <div>
      <div className="mt-4 mx-4  lg:mx-0 pt-5 px-2 p lg:px-0 ">
        <div className="mb-12"> <Typography
          textColor="text-primary"
          textWeight="font-bold"
          textSize="text-[32px]"
        >
          Sign Up
        </Typography>
          <Typography
            textWeight="font-normal"
            textSize="text-sm"
            verticalPadding="my-1"
            textColor="text-dark"
          >
            Please fill in the information below to register as a vendor
          </Typography>
          <ProgressBar step={1} /></div>
        <TextInput
          value={formData.businessName}
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, businessName: data };
            });
            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessName: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessName: true };
              });
            }
          }}
          error={requiredFormData.businessName}
        />
        <EmailInptut
          value={formData.businessEmail}
          label="Business email "
          placeholder="Enter your business official email address"
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, businessEmail: data };
            });
            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessEmail: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessEmail: true };
              });
            }
          }}
          error={requiredFormData.businessEmail}
        />
        <NumberInput
          value={formData.businessPhoneNumber}
          label="Business phone number "
          placeholder="Enter your business official phone number "
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, businessPhoneNumber: data };
            });
            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessPhoneNumber: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessPhoneNumber: true };
              });
            }
          }}
          error={requiredFormData.businessPhoneNumber}
        />
        <TextInput
          value={formData.businessAddress}
          label="Business address"
          placeholder="Enter your business official address"
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, businessAddress: data };
            });
            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessAddress: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, businessAddress: true };
              });
            }
          }}
          error={requiredFormData.businessAddress}
        />
      </div>
    </div>
  );
};
export default step1;
