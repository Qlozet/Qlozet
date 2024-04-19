import Image from "next/image";
import closeIcon from "../../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../../Typography";
import TextInput from "../../../TextInput";
import SearchInput from "../../../SearchInput";
import SelectInput from "../../../SelectInput";
import Button from "../../../Button";

const AddNewWarehouseForm = ({ closeModal }) => {
  const dropdownData = [
    {
      text: "Set as default warehouse",
      color: "",
    },
    {
      text: "Set as default warehouse",
      color: "",
    },
  ];
  return (
    <div className="bg-white rounded-[12px] w-[40%] m-auto px-4 py-6 my-6">
      <div>
        <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[14px]"
          >
            {/* Not check when integrating, if Id is available change Add to Edit  */}
            Add new warehouse
          </Typography>
          <Image
            src={closeIcon}
            alt=""
            onClick={closeModal}
            className="cursor-pointer"
          />
        </div>
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Business name"
          placeholder="Enter your business name"
          setValue={(data) => {}}
        />
        <SelectInput
          placeholder={"Select an option"}
          // value={dropDownValue}
          setValue={(data) => {
            //   setDropDownValue(data);
          }}
          data={dropdownData}
          label="Set warehouse status"
        />
        <div className="my-6 flex items-center justify-end">
          <Button
            children="Submit"
            btnSize="small"
            minWidth="min-w-[14rem]"
            variant="primary"
            clickHandler={() => {
              closeModal();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddNewWarehouseForm;
