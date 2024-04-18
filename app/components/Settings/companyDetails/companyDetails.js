import Button from "../../Button";
import NumberInput from "../../NumberInput";
import TextInput from "../../TextInput";
import FileInput from "../../uploadFileinput/UploadFileInput";

const CompanyDetails = () => {
  return (
    <div className="bg-white w-full p-4 mx-2">
      <div className="flex items-center justify-between my-4">
        <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
        <div className="min-w-[9rem] flex items-center justify-center">
          Company info
        </div>
        <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
      </div>
      <div className="flex items-center justify-between  gap-6">
        <div className="w-full">
          <TextInput
            label="Company name"
            placeholder="Company name"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full">
          <TextInput
            label="Address line 1"
            placeholder="Address line 1"
            setValue={(data) => {}}
          />
        </div>
        <div className="w-full">
          <TextInput
            label="Address line 2"
            placeholder="Enter Address line 2"
            setValue={(data) => {}}
          />
        </div>
      </div>
      <div className="flex items-center justify-between  gap-6">
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
      <div className="flex items-center justify-between  gap-6">
        <div className="w-full">
          <TextInput
            label="City"
            placeholder="Enter City"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full">
          <NumberInput
            label="Phone number"
            placeholder="EnterPhone number"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full">
          <TextInput
            label="Email address"
            placeholder="Enter Email address"
            setValue={(data) => {}}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-6">
        <div className="w-full">
          {" "}
          <TextInput
            label="BVN"
            placeholder="Enter BVN"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full">
          <TextInput
            label="NIN"
            placeholder="Enter NIN"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full"></div>
        <div></div>
      </div>
      <div className="flex items-center justify-between my-6">
        <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
        <div className="min-w-[11rem] flex items-center justify-center ">
          Upload Documents
        </div>
        <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="w-full">
          <FileInput
            label="Upload company logo"
            // placeholder="Enter NIN"
            setValue={(data) => {}}
          />{" "}
        </div>
        <div className="w-full">
          <FileInput label="Upload CAC Document" setValue={(data) => {}} />
        </div>
        <div className="w-full"></div>
        <div></div>
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
  );
};

export default CompanyDetails;
