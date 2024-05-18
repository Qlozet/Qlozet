"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import OrderDetailNav from "@/components/order/OrderdetailsNav";
import Modal from "@/components/Modal";
import classes from "./index.module.css";
import UserAndPermission from "@/components/Settings/UserAndPermission/UserAndPermssion";
import Category from "@/components/Settings/Category/Category";
import MobileSideBar from "@/components/MobileSideBar";
import CheckBoxInput from "@/components/CheckboxInput";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import DashedComponent from "@/components/DashedComponent";
import SelectInput from "@/components/SelectInput";
import ColorInput from "@/components/ColorInput";
import FileInput from "@/components/uploadFileinput/UploadFileInput";
import Quantity from "@/components/Quantity";
import Typography from "@/components/Typography";
import CustomiSationButton from "@/components/CustomizationButton";
import CustomizeOrder from "@/components/Products/CustomizeOrder";
import VariantTable from "./VariantTable";
import NumberInput from "@/components/NumberInput";
import TextArea from "@/components/TextAreaInput";
import { postRequest } from "@/api/method";

const AddProduct = () => {
  const tableData = [
    {
      date: "Hello",
      transactionId: "Hello",
      transactionType: "Hello",
      narration: "Hello",
      amount: "Hello",
      status: "Hello",
    },
    {
      date: "Hello",
      transactionId: "Hello",
      transactionType: "Hello",
      narration: "Hello",
      amount: "Hello",
      status: "Hello",
    },
    {
      date: "Hello",
      transactionId: "Hello",
      transactionType: "Hello",
      narration: "Hello",
      amount: "Hello",
      status: "Hello",
    },
  ];
  const [showCustomiseOrder, setShowCustomiseOrder] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [productFormData, setProductFormData] = useState({
    productName: "",
    productPrice: 1,
    productTag: "",
    description: "",
    productQuantity: "",
    productCategory: "",
    productType: "",
    discount: "",
    isFeatured: false,
    colors: ["red", "blue"],
    // variants: [
    //   {
    //     colors: ["#808080", "#FFFF00"],
    //     size: "M",
    //     quantity: 5,
    //   },
    // ],
    images: [],
  });

  const [requiredproductFormData, setrequiredproductFormData] = useState({
    productName: false,
    productPrice: false,
    productTag: false,
    description: false,
    productQuantity: false,
    productType: false,
    discount: false,
    productCategory: false,
  });
  const handleSelectFile = (files) => {
    setProductFormData((prevData) => {
      return { ...prevData, images: files };
    });
  };
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const closeModal = () => {
    setCustomerDetails(false);
    setShowHistory(false);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", productFormData.productName);
    formData.append("description", productFormData.description);
    formData.append("price", productFormData.productPrice);
    formData.append("quantity", productFormData.productQuantity);
    formData.append("colors", productFormData.colors);
    formData.append(
      "productTag",
      productFormData.productTag === "Male" ? "male" : "female"
    );
    formData.append(
      "productType",
      productFormData.productType === "Customizable"
        ? "customizable"
        : "outright"
    );
    formData.append("discount", productFormData.discount);
    formData.append("isFeatured", true);
    productFormData.images.map((item) => {
      formData.append("images", item);
    });
    console.log(productFormData);
    try {
      console.log([...formData.entries()]);
      const response = await postRequest("/vendor/products", formData, true);
      console.log(response);
      // if (response.success) {
      //   // setIsLoading(false);
      //   toast(<Toast text={response.message} type="success" />);
      // }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      // toast.success("Error", error);
    }
  };
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Products" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Dashboard" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Products"
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
        />
        <div className="mt-4"></div>
        <div className="">
          <div className="mx-0 bg-gray-300 md:bg-white p-4  rounded-t-lg md:translate-x-2">
            <CheckBoxInput label="Billing address same as company details" />
          </div>
          <div className="bg-white w-full p-4 mx-0 md:mx-2">
            <DashedComponent name={"Product info"} />
            <div className="block md:flex items-center justify-between  gap-6">
              <div className="w-full">
                <TextInput
                  value={productFormData.productName}
                  label="Product name"
                  placeholder="Enter product name"
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productName: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productName: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productName: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productName}
                />
              </div>
              <div className="w-full">
                <NumberInput
                  value={productFormData.productPrice}
                  label="Price"
                  placeholder="Enter price"
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productPrice: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productPrice: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productPrice: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productPrice}
                />
              </div>
              <div className="w-full">
                <SelectInput
                  index={30}
                  placeholder={"Tags"}
                  value={productFormData.productTag}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productTag: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productTag: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productTag: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productTag}
                  data={[{ text: "Male" }, { text: "Female" }]}
                  label="Tags"
                />
              </div>
            </div>
            <div className="block md:flex items-center justify-between  gap-6">
              <div className="w-full">
                <SelectInput
                  placeholder={"Category"}
                  value={productFormData.productCategory}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productCategory: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productCategory: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productCategory: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productCategory}
                  data={[{ text: "Two Piece" }, { text: "Dress" }]}
                  label="Category"
                  index={20}
                />
              </div>
              <div className="w-full">
                <SelectInput
                  placeholder={"Enter product type"}
                  value={productFormData.productType}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productType: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productType: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productType: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productType}
                  data={[{ text: "Customizable" }, { text: "Outright" }]}
                  label="Product type"
                  index={10}
                />
              </div>
              <div className="w-full ">
                <ColorInput
                  // index="50"
                  label="Colour"
                  placeholder="Choose  colours available for this product"
                  value={productFormData.colors}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, colors: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, colors: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, colors: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.colors}
                />
              </div>
            </div>
            {/* <div className="w-[100%]  flex items-center gap-6">
              <div className="w-full">
                <ColorInput
                  label="Colour"
                  placeholder="Choose  colours available for this product"
                  value={productFormData.colors}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, colors: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, colors: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, colors: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.colors}
                />
              </div>
              <div className="w-full ">
                <Quantity
                  label="Available quantity"
                  placeholder="Enter available quantity"
                  value={productFormData.productQuantity}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productQuantity: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productQuantity: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productQuantity: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productQuantity}
                />
              </div>
            </div> */}
            <div className="block md:flex  justify-between  gap-6">
              <div className="w-full">
                <FileInput
                  handleSelect={handleSelectFile}
                  label="Upload product image"
                  value={productFormData.images}
                  // setValue={(data) => {
                  //   setProductFormData((prevData) => {
                  //     return { ...prevData, images: data };
                  //   });
                  //   if (data) {
                  //     setrequiredproductFormData((prevData) => {
                  //       return { ...prevData, images: false };
                  //     });
                  //   } else {
                  //     setrequiredproductFormData((prevData) => {
                  //       return { ...prevData, images: true };
                  //     });
                  //   }
                  // }}
                  // error={requiredproductFormData.images}
                />
              </div>
              <div className="w-full">
                <TextArea
                  label="Product description"
                  placeholder="Enter description"
                  value={productFormData.description}
                  setValue={(data) => {
                    console.log(data);
                    setProductFormData((prevData) => {
                      return { ...prevData, description: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, description: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, description: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.description}
                />
              </div>
              <div className="w-full flex items-start justify-start">
                <NumberInput
                  label="Available discount"
                  placeholder="Enter available discount?"
                  value={productFormData.discount}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, discount: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, discount: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, discount: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.discount}
                />
              </div>
            </div>
            <div className="block md:flex  justify-between  gap-6">
              <div className="w-full flex items-start justify-start">
                <NumberInput
                  label="Available quantity"
                  placeholder="Enter quantity"
                  value={productFormData.productQuantity}
                  setValue={(data) => {
                    setProductFormData((prevData) => {
                      return { ...prevData, productQuantity: data };
                    });
                    if (data) {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productQuantity: false };
                      });
                    } else {
                      setrequiredproductFormData((prevData) => {
                        return { ...prevData, productQuantity: true };
                      });
                    }
                  }}
                  error={requiredproductFormData.productQuantity}
                />
              </div>
            </div>
            <div className="block md:flex items-center justify-between gap-6"></div>
            <div className="my-4">
              <DashedComponent name={"Customization"} />
            </div>
            <div>
              <div className="">
                <Typography
                  textWeight="font-[700]"
                  textSize="text-[18px]"
                  verticalPadding="my-2"
                  textColor="text-dark"
                >
                  Add Customization
                </Typography>
              </div>
            </div>
            <div>
              <CustomiSationButton
                handleClick={() => {
                  setShowCustomiseOrder(true);
                }}
              />
            </div>
            <div className="my-4">
              <DashedComponent name={"Product variants"} />
            </div>

            <div className="flex items-center">
              <Typography
                textWeight="font-[700]"
                textSize="text-[18px]"
                verticalPadding="my-2"
                textColor="text-dark"
              >
                Add options
              </Typography>
              <Typography
                textWeight="font-[500]"
                textSize="text-[16px]"
                verticalPadding="my-2"
                textColor="text-gray-200"
              >
                (Variants)
              </Typography>
            </div>
            <div>
              <div className="w-full">
                <SelectInput
                  placeholder={"Tags"}
                  // value={dropDownValue}
                  setValue={(data) => {
                    //   setDropDownValue(data);
                  }}
                  data={[{ text: "Male" }, { text: "Female" }]}
                  label="Enter tags"
                  index={1}
                />
              </div>
              <div className="w-full">
                <ColorInput
                  label="Colour"
                  placeholder="Choose  colours available for this product"
                  setValue={(data) => {}}
                />
              </div>
            </div>
            <div className="flex items-center">
              <Typography
                textWeight="font-[700]"
                textSize="text-[18px]"
                verticalPadding="my-2"
                textColor="text-dark"
              >
                Set variants
              </Typography>
            </div>
            <div className="overflow-x-scroll">
              <VariantTable data={tableData} />
            </div>

            <div className="my-4">
              <Button
                children="Save"
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
        {showCustomiseOrder && (
          <Modal
            content={
              <CustomizeOrder
                closeModal={() => {
                  setShowCustomiseOrder(false);
                }}
              />
            }
          ></Modal>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
