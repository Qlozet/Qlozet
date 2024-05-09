import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../../Typography";
import TextInput from "../../../TextInput";
import SearchInput from "../../../SearchInput";
import SelectInput from "../../../SelectInput";
import Button from "../../../Button";

const AddNewUserAndPermissionForm = ({ closeModal }) => {
  const dropdownData = [
    {
      text: "Super admin",
      color: "",
    },
    {
      text: "Customer support",
      color: "",
    },
    {
      text: "Operations",
      color: "",
    },
    {
      text: "Marketing",
      color: "",
    },
    {
      text: "Data analyst",
      color: "",
    },
    {
      text: "Sales",
      color: "",
    },
  ];
  return (
    <div className="bg-white rounded-[12px] w-full md:w-[40%] m-auto px-4 py-6 my-6">
      <div>
        <div className="flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4">
          <Typography
            textColor="text-primary"
            textWeight="font-bold"
            textSize="text-[14px]"
          >
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
          label="Full name"
          placeholder="Enter full name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Email  address"
          placeholder="Enter email address"
          setValue={(data) => {}}
        />
        <TextInput
          label="Phone number"
          placeholder="Enter phone number"
          setValue={(data) => {}}
        />
        <SelectInput
          placeholder={"Select an option"}
          // value={dropDownValue}
          setValue={(data) => {
            //   setDropDownValue(data);
          }}
          data={dropdownData}
          label="User role"
        />
        <div className="mb-[10rem] mt-6 flex items-center justify-end">
          <Button
            children="Add user"
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

export default AddNewUserAndPermissionForm;
