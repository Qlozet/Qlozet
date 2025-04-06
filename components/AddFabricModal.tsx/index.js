import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import TextInput from "@/components/TextInput";
import icon from "../../public/assets/svg/document-upload.svg";
import Button from "@/components/Button";
import closeIcon from "../../public/assets/svg/material-symbols_close-rounded.svg";
import validator from "@/utils/validator";
import { uploadSingleImage } from "@/utils/helper";
import { postRequest } from "@/api/method";
import NumberInput from "@/components/NumberInput";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

const AddFabricModal = ({ closeModal, submitAcessories }) => {
  const [accessories, setAcesssories] = useState({
    name: "",
    type: "",
    image: "",
    price: 230,
  });

  const [accessoriesRequired, setAcesssoriesRequired] = useState({
    name: false,
    type: false,
    price: false,
    image: false,
  });

  const [loading, setloading] = useState(false);
  const [loadingImageUpload, setloadingImageUpload] = useState(false);
  const [unit, setUnit] = useState("CM");
  const [yardsLength, setYardsLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [pricePerYard, setPricePerYard] = useState(0);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
  };

  const incrementYardsLength = () => {
    setYardsLength(yardsLength + 1);
  };

  const decrementYardsLength = () => {
    if (yardsLength > 0) {
      setYardsLength(yardsLength - 1);
    }
  };

  const incrementWidth = () => {
    setWidth(width + 1);
  };

  const decrementWidth = () => {
    if (width > 0) {
      setWidth(width - 1);
    }
  };

  const handlePriceChange = (event) => {
    setPricePerYard(parseFloat(event.target.value.replace("$", "")) || 0);
  };

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
        console.log(response);
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
      setloadingImageUpload(true);
      const imageUrl = await uploadSingleImage(file);
      if (imageUrl) {
        setAcesssories((prevData) => {
          return { ...prevData, image: imageUrl };
        });
        imageUrl && setloadingImageUpload(false);
      } else {
        toast(
          <Toast
            text={"Error occured while uploading accessory image."}
            type="danger"
          />
        );
        setloadingImageUpload(false);
      }
    } catch (error) {
      setloadingImageUpload(false);
      console.error(error);
    }
  };

  return (
    <div className="block md:flex justify-center w-full my-10 bg-white max-w-3xl m-auto  rounded-[12px] gap-4 overflow-hidden relative">
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
          textWeight="font-[500]"
          textSize="text-[24px]"
        >
          Add Fabric
        </Typography>
        <div>
          <div className="w-full">
            <TextInput
              value={accessories.name}
              label="Fabric name"
              placeholder="Fabric name"
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
              label="Material"
              placeholder="Placeholder"
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
              label="Colour"
              placeholder="Any fabric type"
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
          {/* Unit Switch */}
          <div className="flex gap-2 my-2 items-center">
            <button
              className={`p-2 border rounded ${
                unit === "CM"
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-300 bg-white"
              } cursor-pointer`}
              onClick={() => handleUnitChange("CM")}
            >
              CM
            </button>
            <button
              className={`p-2 border rounded ${
                unit === "IN"
                  ? "border-blue-500 bg-blue-100"
                  : "border-gray-300 bg-white"
              } cursor-pointer`}
              onClick={() => handleUnitChange("IN")}
            >
              IN
            </button>
          </div>

          <div className="flex items-center my-2 gap-8">
            {/* Yards / Length */}
            <div className="flex flex-col gap-1">
              <label className="text-sm">Yards / Length</label>
              <div className="flex items-center">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-l-md cursor-pointer"
                  onClick={decrementYardsLength}
                >
                  -
                </button>
                <div className="px-3 py-2 border-t border-b border-gray-300 text-center min-w-[40px]">
                  {yardsLength}
                </div>
                <button
                  className="px-3 py-2 border border-gray-300 rounded-r-md cursor-pointer"
                  onClick={incrementYardsLength}
                >
                  +
                </button>
              </div>
            </div>

            {/* Width */}
            <div className="flex flex-col my-2 gap-1">
              <label className="text-sm">Width</label>
              <div className="flex items-center">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-l-md cursor-pointer"
                  onClick={decrementWidth}
                >
                  -
                </button>
                <div className="px-3 py-2 border-t border-b border-gray-300 text-center min-w-[40px]">
                  {width}
                </div>
                <button
                  className="px-3 py-2 border border-gray-300 rounded-r-md cursor-pointer"
                  onClick={incrementWidth}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Price per yard */}
          <div className="flex flex-col gap-1 my-2">
            <label className="text-sm flex items-center gap-1">
              Price per yard
              <span className="text-sm text-gray-500 cursor-help">ⓘ</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded px-3 py-2">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={pricePerYard}
                onChange={handlePriceChange}
                className="border-none outline-none flex-1"
              />
            </div>
          </div>
          <div>
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
          </div>
          <div className="mt-8">
            <Button
              loading={loading}
              children="Upload Fabric"
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
            className="w-full h-full"
            style={{
              backgroundImage: `url(${accessories.image.secure_url})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              borderRadius: "12px",
            }}
          ></div>
        )}
      </div>
    </div>
  );
};
export default AddFabricModal;
