import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../../Typography";
import TextInput from "../../../TextInput";
import SearchInput from "../../../SearchInput";
import SelectInput from "../../../SelectInput";
import Button from "../../../Button";

const RequestCategoryForm = ({ closeModal }) => {
  return (
    <div className="bg-white rounded-[12px] w-full lg:w-[40%] m-auto px-4 py-6 my-6">
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
          label="Company name"
          placeholder="Enter company name"
          setValue={(data) => {}}
        />
        <TextInput
          label="Category type"
          placeholder="Enter category type"
          setValue={(data) => {}}
        />
        <div className="mb-[10rem] mt-6 flex items-center justify-center lg:justify-end">
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

export default RequestCategoryForm;
