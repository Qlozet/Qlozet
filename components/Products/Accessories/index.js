import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import TextInput from "@/components/TextInput";
import icon from "../../../public/assets/svg/document-upload.svg";
import Button from "@/components/Button";
import closeIcon from "../../../public/assets/svg/material-symbols_close-rounded.svg";
import validator from "@/utils/validator";
const AddAcessories = ({ closeModal }) => {
  const [accessories, setAcesssories] = useState({
    name: "",
    type: "",
    image: "",
  });

  const [accessoriesRequired, setAcesssoriesRequired] = useState({
    name: false,
    type: false,
    image: false,
  });

  const [loading, setloading] = useState(false);

  const handleSubmit = async () => {
    const { status, data, id } = validator(accessories, accessoriesRequired);
    if (status) {
      setloading(true);
      try {
      } catch (error) {}
    } else {
      setAcesssoriesRequired((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  return (
    <div className="block md:flex justify-center w-full my-4 bg-white max-w-[728px] m-auto  rounded-[12px] gap-4 overflow-hidden relative">
      <button
        onClick={() => {
          closeModal();
        }}
      >
        <Image src={closeIcon} alt="" className="absolute top-4 right-4" />
      </button>
      <div className="pb-8 flex-1 p-6">
        <Typography
          textColor="text-dark"
          textWeight="font-[700]"
          textSize="text-[24px]"
        >
          Upload Accessories
        </Typography>
        <div>
          <div className="w-full">
            <TextInput
              value={accessories.name}
              label="Accessory name"
              placeholder="Enter accessory name"
              setValue={(data) => {
                setAcesssories((prevData) => {
                  return { ...prevData, name: data };
                });
                if (data) {
                  setAcesssoriesRequired((prevData) => {
                    return { ...prevData, name: false };
                  });
                } else {
                  setAcesssoriesRequired((prevData) => {
                    return { ...prevData, name: true };
                  });
                }
              }}
              error={accessoriesRequired.name}
            />
          </div>
          <div className="w-full">
            <TextInput
              value={accessories.type}
              label="Accessory type"
              placeholder="Enter accessory type"
              setValue={(data) => {
                setAcesssories((prevData) => {
                  return { ...prevData, type: data };
                });
                if (data) {
                  setAcesssoriesRequired((prevData) => {
                    return { ...prevData, type: false };
                  });
                } else {
                  setAcesssoriesRequired((prevData) => {
                    return { ...prevData, type: true };
                  });
                }
              }}
              error={accessoriesRequired.type}
            />
          </div>
          <div>
            <div className="my-3 relative">
              <p className="text-[14px] font-light my-2 text-dark">
                Upload Image
              </p>
              <input
                type="file"
                className={`hidden `}
                onChange={(e) => {
                  setAcesssories((prevData) => {
                    return { ...prevData, image: e.target.files[0] };
                  });
                  setAcesssoriesRequired((prevData) => {
                    return { ...prevData, image: false };
                  });
                }}
                id="accessories"
              ></input>
              <label
                className="py-5 px-4 w-full border-solid border-[1.5px] block rounded-[8px] cursor-pointer relative"
                htmlFor="accessories"
              >
                <Image
                  src={icon}
                  alt=""
                  width={24}
                  height={24}
                  className="absolute top-2 right-2 "
                />
              </label>
              {accessoriesRequired.image && (
                <p className="text-danger text-[12px] font-[400]">
                  Image cannot be empty!
                </p>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Button
              loading={loading}
              children="Upload Accessory"
              btnSize="large"
              variant="primary"
              maxWidth="max-w-[10rem]"
              clickHandler={() => {
                handleSubmit();
              }}
            />
          </div>
        </div>
      </div>
      <div className="pb-8 min-w-[300px] bg-gray-400 flex-1 p-6 ">
        <Typography
          textColor="text-dark"
          textWeight="font-[700]"
          textSize="text-[24px]"
        >
          Preview
        </Typography>
        {accessories.image && (
          <Image
            src={URL.createObjectURL(accessories.image)}
            alt="acces"
            width={50}
            height={50}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        )}
      </div>
    </div>
  );
};
export default AddAcessories;
