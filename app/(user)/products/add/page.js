"use client";
import { useEffect, useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import Modal from "@/components/Modal";
import MobileSideBar from "@/components/MobileSideBar";
import CheckBoxInput from "@/components/CheckboxInput";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import DashedComponent from "@/components/DashedComponent";
import SelectInput from "@/components/SelectInput";
import ColorInput from "@/components/ColorInput";
import FileInput from "@/components/uploadFileinput/UploadFileInput";
import Typography from "@/components/Typography";
import CustomiSationButton from "@/components/CustomizationButton";
import CustomizeOrder from "@/components/Products/CustomizeOrder";
import VariantTable from "./VariantTable";
import NumberInput from "@/components/NumberInput";
import TextArea from "@/components/TextAreaInput";
import { getRequest, postRequest } from "@/api/method";
import validator from "@/utils/validator";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import { useRouter } from "next/navigation";
import { getProductId } from "@/utils/localstorage";
import Loader from "@/components/Loader";
import { putRequest } from "@/api/method";

const AddProduct = () => {
  const router = useRouter();

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
  const [pageLoading, setPageLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFile] = useState([]);
  const [productFormData, setProductFormData] = useState({
    productName: "",
    productPrice: "",
    productTag: "",
    description: "",
    productQuantity: "",
    productCategory: "",
    productType: "",
    discount: "",
    isFeatured: false,
    colors: [],
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
    colors: false,
  });
  const handleSelectFile = (files) => {
    setFile(files);
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
    const productId = getProductId();
    const { status, data, id } = validator(
      productFormData,
      requiredproductFormData
    );
    const variantData = {
      old: [
        {
          id: "u02u3209u320u32",
          data: {
            color: "red",
            size: "small",
            qty: 2,
          },
        },
      ],
      new: {
        color: "red",
        size: "small",
        qty: 2,
      },
    };
    if (status) {
      formData.append("name", productFormData.productName);
      formData.append("description", productFormData.description);
      formData.append("price", productFormData.productPrice);
      formData.append("quantity", productFormData.productQuantity);
      formData.append(
        "productCategory",
        JSON.stringify([productFormData.productCategory])
      );
      // formData.append("variants", variantData);
      formData.append("colors", JSON.stringify(productFormData.colors));
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
      files.map((item) => {
        formData.append("images", item);
      });
      try {
        setIsLoading(true);
        const response = !productId
          ? await postRequest("/vendor/products", formData, true)
          : await putRequest(
              `/vendor/products/${productId}/update`,
              formData,
              true
            );
        response && setIsLoading(false);
        if (response?.data) {
          router.push("../products");
          setIsLoading(false);
          toast(<Toast text={response?.message} type="success" />);
        } else {
          toast(<Toast text={response?.message} type="danger" />);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        toast(<Toast text={error?.message} type="danger" />);
      }
    } else {
      setrequiredproductFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  const fetchProduct = async () => {
    const productId = getProductId();
    try {
      const response = await getRequest(`/vendor/products/${productId}`);
      let colors = [];
      response.data.data.colors.map((item) => {
        colors.push(item.hex);
      });
      const categories = response.data.data.categories.map((item) => {
        return item.name;
      });
      setProductFormData({
        productName: response.data.data.name,
        productPrice: response.data.data.price,
        productTag: response.data.data.tag,
        description: response.data.data.description,
        productQuantity: response.data.data.quantity,
        productCategory: response.data.data.categories.map((item) => {
          return item.name;
        }),
        productType: response.data.data.type,
        discount: response.data.data.discount,
        isFeatured: false,
        colors: colors,
        // variants: [
        //   {
        //     colors: ["#808080", "#FFFF00"],
        //     size: "M",
        //     quantity: 5,
        //   },
        // ],
        images: response.data.data.images.map((image) => {
          return image.url;
        }),
      });
      // clearProductId();
      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, []);
  return (
    <div>
      {" "}
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Products" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Products"
              closeSideBar={showSideBar}
            />
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
              <div className="mx-0 bg-gray-300 lg:bg-white p-4  rounded-t-lg lg:translate-x-2">
                <CheckBoxInput label="Billing address same as company details" />
              </div>
              <div className="bg-white w-full p-4 mx-0 lg:mx-2">
                <DashedComponent name={"Product info"} />
                <div className="block lg:flex items-center justify-between  gap-6">
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
                      placeholder={"Product Tags"}
                      label="Tags"
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
                    />
                  </div>
                </div>
                <div className="block lg:flex items-center justify-between  gap-6">
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
                <div className="block lg:flex  justify-between  gap-6">
                  <div className="w-full">
                    <FileInput
                      handleSelect={handleSelectFile}
                      label="Upload product image"
                      value={productFormData.images}
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
                <div className="block lg:flex  justify-between  gap-6">
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
                <div className="block lg:flex items-center justify-between gap-6"></div>
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
                <div className="w-full">
                  <ColorInput
                    value={["red"]}
                    label="Colour"
                    placeholder="Choose  colours available for this product"
                    setValue={(data) => {}}
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
                      placeholder={"Enter roduct tags"}
                      // value={dropDownValue}
                      setValue={(data) => {
                        //   setDropDownValue(data);
                      }}
                      data={[{ text: "Male" }, { text: "Female" }]}
                      label="Product tags"
                      index={20}
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
                    loading={isLoading}
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
      )}{" "}
    </div>
  );
};

export default AddProduct;
