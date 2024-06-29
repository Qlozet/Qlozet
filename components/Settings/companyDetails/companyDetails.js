import { useState } from "react";
import Image from "next/image";
import Button from "../../Button";
import NumberInput from "../../NumberInput";
import TextInput from "../../TextInput";
import FileInput from "../../uploadFileinput/UploadFileInput";
import userIcon from "../../../public/assets/svg/Frame.svg";
import Typography from "@/components/Typography";
import DashedComponent from "@/components/DashedComponent";
import { uploadSingleImage } from "@/utils/helper";
const CompanyDetails = ({
  shopDetails,
  setShopDetails,
  requiredShopDetails,
  setRequiredShopDetails,
  submitCompanyInfo,
  isLoading,
}) => {
  const handleSelectLogo = async (files) => {
    const ImageInfo = await uploadSingleImage(files[0]);
    // setUploadeFiles((prevData) => {
    //   return [...prevData, ImageInfo];
    // });
    // setFile(files);
    // setProductFormData((prevData) => {
    //   return { ...prevData, images: files };
    // });
  };
  const handleSelectDoc = async (files) => {
    const ImageInfo = await uploadSingleImage(files[0]);
    console.log(ImageInfo);
    // setUploadeFiles((prevData) => {
    //   return [...prevData, ImageInfo];
    // });
    // setFile(files);
    // setProductFormData((prevData) => {
    //   return { ...prevData, images: files };
    // });
  };
  return (
    <div className=" w-full mx-0 lg:mx-2 py-2 lg:bg-white">
      <div className="block items-center justify-center lg:hidden p-4 shadow my-4 rounded-[12px] bg-white">
        <Image src={userIcon} alt="" className="my-2 mx-auto" />
        <div className="p-1 flex justify-center items-center">
          <Typography
            textColor="text-dark"
            textWeight="font-[500]"
            textSize="text-[20px]"
          >
            {shopDetails.vendorName}
          </Typography>
        </div>
        <div className="flex justify-center items-center">
          <Typography
            textColor="text-gray-100"
            textWeight="font-[500]"
            textSize="text-[20px]"
          >
            {shopDetails.companyName}
          </Typography>
        </div>
        <div className="flex justify-center items-center">
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-[16px]"
          >
            {shopDetails.email}
          </Typography>
        </div>
      </div>
      <DashedComponent name={"Company info"} />

      <div className="showdow bg-white">
        <div className="bg-gray-300 p-4 rounded-t-[12px] lg:hidden">
          <Typography
            textColor="text-dark"
            textWeight="font-[700]"
            textSize="text-[16px]"
          >
            Company Info
          </Typography>
        </div>
        <div className="block lg:flex items-center justify-between gap-6 mx-2">
          <div className="w-full">
            <TextInput
              label="Company name"
              placeholder="Company name"
              value={shopDetails.companyName}
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, companyName: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, companyName: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, companyName: true };
                  });
                }
              }}
              error={requiredShopDetails.companyName}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Address line 1"
              placeholder="Address line 1"
              value={shopDetails.addressLine1}
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, addressLine1: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, addressLine1: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, addressLine1: true };
                  });
                }
              }}
              error={requiredShopDetails.addressLine1}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Address line 2"
              placeholder="Enter Address line 2"
              value={shopDetails.addressLine2}
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, addressLine2: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, addressLine2: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, addressLine2: true };
                  });
                }
              }}
              error={requiredShopDetails.addressLine2}
            />
          </div>
        </div>
        <div className="block lg:flex items-center justify-between  gap-6 mx-2">
          <div className="w-full">
            <TextInput
              value={shopDetails.country}
              label="Country"
              placeholder="EnterCountry"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, country: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, country: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, country: true };
                  });
                }
              }}
              error={requiredShopDetails.country}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="State"
              placeholder="Enter State"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, state: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, state: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, state: true };
                  });
                }
              }}
              error={requiredShopDetails.state}
              value={shopDetails.state}
            />{" "}
          </div>
          <div className="w-full">
            <TextInput
              label="City"
              placeholder="Enter City"
              value={shopDetails.city}
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, city: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, city: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, city: true };
                  });
                }
              }}
              error={requiredShopDetails.city}
            />{" "}
          </div>
        </div>
        <div className="block lg:flex items-center justify-between  gap-6 mx-2">
          <div className="w-full">
            <TextInput
              label="Timezone"
              placeholder="Timezone Timezone"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, timeZone: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, timeZone: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, timeZone: true };
                  });
                }
              }}
              error={requiredShopDetails.timeZone}
            />
          </div>
          <div className="w-full">
            <NumberInput
              label="Phone number"
              placeholder="EnterPhone number"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, Phone: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, Phone: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, Phone: true };
                  });
                }
              }}
              error={requiredShopDetails.Phone}
              value={shopDetails.Phone}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="Email address"
              placeholder="Enter Email address"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, email: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, email: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, email: true };
                  });
                }
              }}
              error={requiredShopDetails.email}
              value={shopDetails.email}
            />
          </div>
        </div>
        <div className="block lg:flex items-center justify-between gap-6 mx-2">
          <div className="w-full">
            <TextInput
              label="BVN"
              placeholder="Enter BVN"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, bvn: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, bvn: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, bvn: true };
                  });
                }
              }}
              error={requiredShopDetails.bvn}
              value={shopDetails.bvn}
            />
          </div>
          <div className="w-full">
            <TextInput
              label="NIN"
              placeholder="Enter NIN"
              setValue={(data) => {
                setShopDetails((prevData) => {
                  return { ...prevData, nin: data };
                });
                if (data) {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, nin: false };
                  });
                } else {
                  setRequiredShopDetails((prevData) => {
                    return { ...prevData, nin: true };
                  });
                }
              }}
              error={requiredShopDetails.nin}
              value={shopDetails.nin}
            />
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
        <div className="block lg:flex items-center justify-between gap-6 mx-2">
          <div className="w-full">
            <FileInput
              fileName="logo"
              label="Upload company logo"
              // placeholder="Enter NIN"
              setValue={(data) => {}}
              value={[]}
              handleSelect={handleSelectLogo}
            />
          </div>
          <div className="w-full">
            <FileInput
              fileName="cacdoc"
              label="Upload CAC Document"
              setValue={(data) => {}}
              handleSelect={handleSelectDoc}
              value={[]}
            />
          </div>
          <div className="w-full"></div>
          <div></div>
        </div>
        <div className="my-4">
          <Button
            loading={isLoading}
            children="Save"
            btnSize="large"
            variant="primary"
            maxWidth="max-w-[10rem]"
            clickHandler={() => {
              submitCompanyInfo();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
