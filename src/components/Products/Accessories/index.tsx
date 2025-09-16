import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import TextInput from "@/components/TextInput";
import icon from "@/public/assets/svg/document-upload.svg";
import Button from "@/components/Button";
import closeIcon from "@/public/assets/svg/material-symbols_close-rounded.svg";
import validator from "@/utils/validator";
import { uploadSingleImage } from "@/utils/helper";
import { postRequest } from "@/api/method";
import NumberInput from "@/components/NumberInput";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
const AddAcessories = ({ closeModal, submitAcessories }) => {
  const [accessories, setAcesssories] = useState({
    name: "",
    type: "",
    image: "",
    price: 230
  });

  const [accessoriesRequired, setAcesssoriesRequired] = useState({
    name: false,
    type: false,
    price: false,
    image: false,
  });

  const [loading, setloading] = useState(false);
  const [loadingImageUpload, setloadingImageUpload] = useState(false);

  const handleSubmit = async () => {
    const { status, data, id } = validator(accessories, accessoriesRequired);
    if (status) {
      setloading(true);
      try {
        const response = await postRequest("/vendor/products/accessory", {
          name: accessories.name,
          type: accessories.type,
          price: accessories.price,
          images: [accessories.image],
        });
        submitAcessories({
          name: accessories.name,
          type: accessories.type,
          images: accessories.image.secure_url,
          price: accessories.price,
          id: response.data,
        });
        response && setloading(false);
        if (response.data) {
          toast(<Toast text={"Accessories added"} type="success" />);
        }
      } catch (error) {
        error && setloading(false);
      }
    } else {
      setAcesssoriesRequired((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  const handleUpload = async (file) => {
    try {
      setloadingImageUpload(true)
      const imageUrl = await uploadSingleImage(file);
      if (imageUrl) {
        setAcesssories((prevData) => {
          return { ...prevData, image: imageUrl };
        });
        imageUrl && setloadingImageUpload(false)
      } else {
        toast(<Toast text={"Error occured while uploading accessory image."} type="danger" />);
        setloadingImageUpload(false)
      }

    } catch (error) {
      setloadingImageUpload(false)
      console.error(error)
    }
  };

  return (
    <div className="block md:flex justify-center w-full my-4 bg-white max-w-[1180px] m-auto  rounded-[12px] gap-4 overflow-hidden relative px-[38px] py-[43px]">
      <button
        onClick={() => {
          closeModal();
        }}
      >
        <Image src={closeIcon} alt="" className="absolute top-4 right-4" />
      </button>
      <div className="flex items-start w-full border-solid border-primary border">
        <div className="w-full">
          <Typography
            textWeight="font-[500]"
            textSize="text-[24px]"
            className={"text-[#495057]"}
          >
            Upload Accessories
          </Typography>
          <div className="">
            <div className="pb-8">
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
              <div className="w-full">
                <NumberInput
                  label="Price"
                  placeholder="Enter Price"
                  value={accessories.productQuantity}
                  setValue={(data) => {
                    setAcesssories((prevData) => {
                      return { ...prevData, price: data };
                    });
                    if (data) {
                      setAcesssoriesRequired((prevData) => {
                        return { ...prevData, price: false };
                      });
                    } else {
                      setAcesssoriesRequired((prevData) => {
                        return { ...prevData, price: true };
                      });
                    }
                  }}
                  error={accessoriesRequired.price}
                />
              </div>
            </div>
            <div>
              {/* <div>
                <div className="my-3 relative">
                  <p className="text-sm font-light my-2 text-dark">Upload Image</p>
                  <input
                    type="file"
                    className={`hidden `}
                    onChange={(e) => {
                      handleUpload(e.target.files[0]);
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
                    {!loadingImageUpload ? (
                      <Image
                        src={icon}
                        alt=""
                        width={24}
                        height={24}
                        className="absolute top-2 right-2 "
                      />
                    ) : (
                      <Oval
                        visible={true}
                        height="30"
                        width="30"
                        color="rgba(62, 28, 1, 1)"
                        ariaLabel="oval-loading"
                        secondaryColor="#f4f4f4"
                        wrapperStyle={{}}
                        wrapperClass="absolute top-2 right-2"
                      />
                    )}
                  </label>
                  {accessoriesRequired.image && (
                    <p className="text-danger text-xs font-[400]">
                      Image cannot be empty!
                    </p>
                  )}
                </div>
              </div> */}
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
        </div>
      </div>
      <div className="pb-8 min-w-[300px] bg-gray-400 flex-1 basis-1/2">
        <Typography
          textColor="text-dark"
          textWeight="font-[700]"
          textSize="text-[24px]"
        >
          Preview
        </Typography>
        {accessories.image && (
          // <Image
          //   src={accessories.image.secure_url}
          //   alt="acces"
          //   width={50}
          //   height={50}
          //   style={{
          //     width: "100%",
          //     height: "auto",
          //   }}
          //   unoptimized
          // />
          <div
            className="w-full h-full rounded-lg "
            style={{
              backgroundImage: `url(${accessories.image.secure_url})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        )}
      </div>
    </div>
  );
};
export default AddAcessories;
