import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbols_close-rounded.svg";
import Typography from "../../../Typography";
import TextInput from "../../../TextInput";
import SearchInput from "../../../SearchInput";
import SelectInput from "../../../SelectInput";
import Button from "../../../Button";
import { useEffect, useState } from "react";
import validator from "@/utils/validator";
import { postRequest } from "@/api/method";
import toast, { ToastBar } from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
const AddNewWarehouseForm = ({ closeModal }) => {
  const [isLoading, setIsloading] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: "",
    warehouseName: "",
    warehouseAddress: "",
    contactName: "",
    contactPhoneNumber: "",
    contactEmail: "",
    warehouseStatus: "",
  });
  const [requiredFormData, setRequiredFormData] = useState({
    vendorName: false,
    warehouseName: false,
    warehouseAddress: false,
    contactName: false,
    contactPhoneNumber: false,
    contactEmail: false,
    warehouseStatus: false,
  });
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

  const handleSubmit = async () => {
    try {
      const { status, data } = validator(formData, requiredFormData);
      if (status) {
        setIsloading(true);
        const response = await postRequest(`/vendor/warehouse/add`, {
          vendorName: formData.vendorName,
          warehouseName: formData.warehouseName,
          warehouseAddress: formData.warehouseAddress,
          contactName: formData.contactName,
          contactPhoneNumber: formData.contactPhoneNumber,
          contactEmail: formData.contactEmail,
          warehouseStatus: "alternative",
        });

        response && setIsloading(false);
        if (response?.data) {
          console.log(response);
          closeModal();
          toast(<Toast text={response.message} type="success" />);
        } else {
          toast(<Toast text={response.message} type="danger" />);
        }
      } else {
        setRequiredFormData((prevData) => {
          return { prevData, ...data };
        });
      }
    } catch (error) {
      error && setIsloading(false);
    }
  };
  useEffect(() => {}, []);
  return (
    <div className="bg-white rounded-[12px] w-full lg:w-[40%]  m-auto px-4 py-6 my-6">
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
          label="Warehouse name"
          placeholder="Enter your Warehouse name"
          value={formData.warehouseName}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, warehouseName: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseName: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseName: true };
              });
            }
          }}
          error={requiredFormData.warehouseName}
        />
        <TextInput
          label="Vendor name"
          placeholder="Enter your endor name"
          value={formData.vendorName}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, vendorName: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, vendorName: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, vendorName: true };
              });
            }
          }}
          error={requiredFormData.vendorName}
        />
        <TextInput
          label="Warehouse name"
          placeholder="Enter your warehouse address"
          value={formData.warehouseAddress}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, warehouseAddress: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseAddress: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseAddress: true };
              });
            }
          }}
          error={requiredFormData.warehouseAddress}
        />
        <TextInput
          label="Contact name"
          placeholder="Enter your contact name"
          value={formData.contactName}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, contactName: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactName: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactName: true };
              });
            }
          }}
          error={requiredFormData.contactName}
        />
        <TextInput
          label="Contact phone number"
          placeholder="Enter your phone number"
          value={formData.contactPhoneNumber}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, contactPhoneNumber: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactPhoneNumber: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactPhoneNumber: true };
              });
            }
          }}
          error={requiredFormData.contactPhoneNumber}
        />
        <TextInput
          label="Contact email address"
          placeholder="Enter your email address"
          value={formData.contactEmail}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, contactEmail: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactEmail: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, contactEmail: true };
              });
            }
          }}
          error={requiredFormData.contactEmail}
        />
        <SelectInput
          placeholder={"Select warehouse status"}
          // value={dropDownValue}
          value={formData.warehouseStatus}
          setValue={(data) => {
            setFormData((prevData) => {
              return { ...prevData, warehouseStatus: data };
            });

            if (data) {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseStatus: false };
              });
            } else {
              setRequiredFormData((prevData) => {
                return { ...prevData, warehouseStatus: true };
              });
            }
          }}
          error={requiredFormData.warehouseStatus}
          data={dropdownData}
          label="Set warehouse status"
        />
        <div className="my-6 flex items-center justify-end">
          <Button
            loading={isLoading}
            children="Submit"
            btnSize="small"
            minWidth="min-w-[14rem]"
            variant="primary"
            clickHandler={() => {
              handleSubmit();
              // closeModal();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AddNewWarehouseForm;
