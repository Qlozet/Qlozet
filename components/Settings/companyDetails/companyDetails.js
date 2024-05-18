import Image from "next/image";
import Button from "../../Button";
import NumberInput from "../../NumberInput";
import TextInput from "../../TextInput";
import FileInput from "../../uploadFileinput/UploadFileInput";
import userIcon from "../../../public/assets/svg/Frame.svg";
import Typography from "@/components/Typography";
import DashedComponent from "@/components/DashedComponent";
const CompanyDetails = () => {
  return (
    <div className=" w-full mx-0 md:mx-2 py-2 md:bg-white">
      <div className="block items-center justify-center md:hidden p-4 shadow my-4 rounded-[12px] bg-white">
        <Image src={userIcon} alt="" className="my-2 mx-auto" />
        <div className="p-1 flex justify-center items-center">
          <Typography
            textColor="text-dark"
            textWeight="font-[500]"
            textSize="text-[20px]"
          >
            Agate Sator
          </Typography>
        </div>
        <div className="flex justify-center items-center">
          <Typography
            textColor="text-gray-100"
            textWeight="font-[500]"
            textSize="text-[20px]"
          >
            ALTIRE-115009
          </Typography>
        </div>
        <div className="flex justify-center items-center">
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-[16px]"
          >
            www.altire.cloth/agate-sator
          </Typography>
        </div>
      </div>
      <DashedComponent name={"Company info"} />

      <div className="showdow bg-white">
        <div className="bg-gray-300 p-4 rounded-t-[12px] md:hidden">
          <Typography
            textColor="text-dark"
            textWeight="font-[700]"
            textSize="text-[16px]"
          >
            Company Info
          </Typography>
        </div>
        <div className="block md:flex items-center justify-between gap-6 mx-2">
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
        <div className="block md:flex items-center justify-between  gap-6 mx-2">
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
        <div className="block md:flex items-center justify-between  gap-6 mx-2">
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
        <div className="block md:flex items-center justify-between gap-6 mx-2">
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
        <div className="flex items-center justify-between my-6 mx-2">
          <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
          <div className="min-w-[11rem] flex items-center justify-center ">
            Upload Documents
          </div>
          <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
        </div>
        <div className="block md:flex items-center justify-between gap-6 mx-2">
          <div className="w-full">
            <FileInput
              label="Upload company logo"
              // placeholder="Enter NIN"
              setValue={(data) => {}}
              value={[]}
            />
          </div>
          <div className="w-full">
            <FileInput
              label="Upload CAC Document"
              setValue={(data) => {}}
              value={[]}
            />
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
    </div>
  );
};

export default CompanyDetails;
