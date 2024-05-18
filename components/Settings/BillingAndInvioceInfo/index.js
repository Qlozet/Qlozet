import Button from "../../Button";
import CheckBoxInput from "../../CheckboxInput";
import NumberInput from "../../NumberInput";
import TextArea from "../../TextAreaInput";
import TextInput from "../../TextInput";
import FileInput from "../../uploadFileinput/UploadFileInput";

const BillingAndInvioce = () => {
  return (
    <div className="">
      <div className="mx-0 bg-gray-300 md:bg-white p-4  rounded-t-lg md:translate-x-2">
        <CheckBoxInput label="Billing address same as company details" />
      </div>
      <div className="bg-white w-full p-4 mx-0 md:mx-2">
        <div className="block md:flex items-center justify-between  gap-6">
          <div className="w-full">
            <TextInput
              label="Billing contact name"
              placeholder="Enter Billing contact name"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <TextInput
              label="Billing address line 1"
              placeholder="Enter Billing address line 1"
              setValue={(data) => {}}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Bill address line 2"
              placeholder="Enter Bill address line 2"
              setValue={(data) => {}}
            />
          </div>
        </div>
        <div className="block md:flex items-center justify-between  gap-6">
          <div className="w-full">
            <TextInput
              label="State"
              placeholder="Enter State"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <TextInput
              label="Country"
              placeholder="EnterCountry"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <TextInput
              label="Timezone"
              placeholder="Timezone Timezone"
              setValue={(data) => {}}
            />
          </div>
        </div>
        <div className="block md:flex items-center justify-between  gap-6">
          <div className="w-full">
            <TextInput
              label="Billing city"
              placeholder="Enter Billing city"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Billing phone number "
              placeholder="Enter Billing phone number "
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Billing zip code/pin code "
              placeholder="Enter Billing zip code/pin code "
              setValue={(data) => {}}
            />
          </div>
        </div>
        <div className="block md:flex items-center justify-between gap-6">
          <div className="w-full">
            {" "}
            <NumberInput
              label="Tax number/GSTIN"
              placeholder="Enter Tax number/GSTIN"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="NIN"
              placeholder="Enter NIN"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Number of decimals show on invoice"
              placeholder="Enter Number of decimals show on invoice"
              setValue={(data) => {}}
            />
          </div>
        </div>

        <div className="my-4">
          <CheckBoxInput label="Billing address same as company details" />
        </div>
        <div className="block md:flex items-center justify-between gap-6">
          <div className="w-full">
            {" "}
            <TextInput
              label="Invoice prefix"
              placeholder="Enter Invoice prefix"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Starting invoice number"
              placeholder="Starting invoice number"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Number of digits in invoice number"
              placeholder="Enter Number of digits in invoice number"
              setValue={(data) => {}}
            />
          </div>
        </div>
        <div className="my-4"></div>
        <div className="block md:flex items-center justify-between gap-6">
          <div className="w-full">
            <TextArea
              label="Invoice message 1"
              placeholder="Invoice message 1"
              setValue={(data) => {}}
            />
          </div>
          <div className="w-full">
            <TextArea
              label="Invoice message 2"
              placeholder="Enter Invoice message 2"
              setValue={(data) => {}}
            />{" "}
          </div>
          <div className="w-full">
            <NumberInput
              label="Number of digits in invoice number"
              placeholder="Enter Number of digits in invoice number"
              setValue={(data) => {}}
            />
          </div>
        </div>
        <div className="my-4">
          <Button
            children="Save"
            btnSize="large"
            variant="primary"
            maxWidth="max-w-[10rem]"
            clickHandler={() => {
              // setStep(step + 1);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingAndInvioce;
