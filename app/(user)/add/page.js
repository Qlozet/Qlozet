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
import VariantInput from "@/components/VariantInput";
import MaterialInput from "@/components/MaterialInput";
import SizeInput from "@/components/SizeInput";
import { uploadSingleImage } from "@/utils/helper";
const AddProduct = () => {
  const [variantTable, setVariantTable] = useState([]);
  const router = useRouter();
  const [showCustomiseOrder, setShowCustomiseOrder] = useState(false);
  const [pageLoading, setPageLoading] = useState();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVariantColor, setCurrentVariantColor] = useState("");
  const [currentVariantFile, setCurrentVariantFile] = useState("");
  const [files, setFile] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [variantFiles, setVariantFiles] = useState([]);
  const [productFormData, setProductFormData] = useState({
    productName: "",
    productPrice: "",
    productTag: "",
    description: "",
    productQuantity: "0",
    productCategory: "",
    productType: "",
    discount: "0",
    isFeatured: false,
    colors: [],
    images: [],
    variantSizes: [],
  });
  const [requiredproductFormData, setrequiredproductFormData] = useState({
    productName: false,
    productPrice: false,
    productTag: false,
    description: false,
    productQuantity: false,
    productType: false,
    productCategory: false,
    colors: false,
  });

  const handleSelectFile = async (files, deletedFiles) => {
    console.log(deletedFiles);
    setProductFormData((prevData) => {
      return { ...prevData, images: files };
    });
    setDeletedFiles(deletedFiles);
  };

  const handleSelecVarianttFile = (files) => {
    setVariantFiles(files);
    setProductFormData((prevData) => {
      return { ...prevData, images: files };
    });
  };
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const submitVariantImage = async (file, listIndex, imageIndex) => {
    const imageUrl = await uploadSingleImage(file);
    let prevVariantTable = variantTable;
    if (imageUrl?.secure_url) {
      let images = variantTable[listIndex].images;
      images[imageIndex] = imageUrl;
      const newVariantItem = {
        color: variantTable[listIndex].color,
        images: images,
        sizes: variantTable[listIndex].sizes,
        quantity: variantTable[listIndex].quantity,
      };
      prevVariantTable[listIndex] = newVariantItem;
      setVariantTable(prevVariantTable);
    }
  };

  const addToVariantTable = async (data) => {
    if (data[0] instanceof File) {
      const imageUrl = await uploadSingleImage(data[0]);
      setCurrentVariantFile(imageUrl.secure_url);
      setCurrentVariantColor("");
    } else {
      setProductFormData((prevData) => {
        return { ...prevData, variantSizes: [] };
      });
      console.log(data[0]);
      setCurrentVariantColor(data[0]);
      setCurrentVariantFile("");
    }
  };

  const addSizeToVariant = (size) => {
    setVariantTable((prevData) => {
      return [
        ...prevData,
        {
          color: currentVariantFile ? currentVariantFile : currentVariantColor,
          images: [],
          prize: productFormData.productPrice,
          sizes: [size[size.length - 1]],
          quantity: productFormData.productQuantity,
        },
      ];
    });
  };

  const removeVariant = (variantIndex) => {
    setVariantTable(
      variantTable.filter((item, index) => index !== variantIndex)
    );
  };

  const VariantQuantityHandler = (index, action) => {
    let prevVariantTable = variantTable;

    if (action == "increase") {
      prevVariantTable[index].quantity = prevVariantTable[index].quantity + 1;
    } else {
      prevVariantTable[index].quantity = prevVariantTable[index].quantity - 1;
    }
    setVariantTable(prevVariantTable);
  };

  const priceHandler = (value, index) => {
    let prevVariantTable = variantTable;
    prevVariantTable[index].prize = value;
    setVariantTable(prevVariantTable);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    const productId = getProductId();
    const { status, data, id } = validator(
      productFormData,
      requiredproductFormData
    );
    if (status) {
      try {
        setIsLoading(true);
        const formData = {
          name: productFormData.productName,
          description: productFormData.description,
          price: productFormData.productPrice,
          quantity: productFormData.productQuantity,
          productTag: productFormData.productTag === "Male" ? "male" : "female",
          productCategory: JSON.stringify([productFormData.productCategory]),
          colors: JSON.stringify(productFormData.colors),
          productType:
            productFormData.productType === "Customizable"
              ? "customizable"
              : "outright",
          discount: productFormData.discount,
          isFeatured: 0,
          images: {
            retained: productFormData.images,
            deleted: deletedFiles,
          },
          variants: variantTable.map((item) => {
            let varantItem = {
              colors: [item.color],
              size: item.sizes[0],
              quantity: item.quantity,
              images: {
                retained: item.images,
                deleted: [],
              },
            };
            return varantItem;
          }),
        };
        const response = !productId
          ? await postRequest("/vendor/products", formData)
          : await putRequest(`/vendor/products/${productId}/update`, formData);
        response && setIsLoading(false);
        console.log(response);
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
    let colors = [];
    let sizeVariant = [];
    if (productId) {
      try {
        setPageLoading(true);
        const response = await getRequest(`/vendor/products/${productId}`);
        if (response.data.data) {
          // sizeVariant = (await response.data.data.variants)
          //   ? await response.data.data.variants.map((item) => item.size.label)
          //   : [];
          // console.log(response.data.data);
          // colors = response.data.data.variants
          //   ? await response.data.data.variants.map((item) => item.color.hex)
          //   : [];
          // setVariantTable((prevData) => {
          //   return [
          //     ...prevData,
          //     {
          //       color: currentVariantFile ? currentVariantFile : colors,
          //       images: [
          //         { asset_id: "", public_id: "", secure_url: "" },
          //         { asset_id: "", public_id: "", secure_url: "" },
          //         { asset_id: "", public_id: "", secure_url: "" },
          //         { asset_id: "", public_id: "", secure_url: "" },
          //         { asset_id: "", public_id: "", secure_url: "" },
          //       ],
          //       sizes: sizeVariant,
          //     },
          //   ];
          // });
          console.log(response.data.data.type);
          setProductFormData({
            productName: response.data.data.name,
            productPrice: response.data.data.price,
            productTag: response.data.data.tag,
            description: response.data.data.description,
            productQuantity: response.data.data.quantity,
            productCategory: response.data.data.categories.map(
              (item) => item.name
            ),
            variantSizes: sizeVariant,
            productType:
              response.data.data.type === "customizable"
                ? "Customizable"
                : "Outright",
            discount: response.data.data.discount,
            isFeatured: false,
            colors: colors,
            images: response.data.data.images,
          });
          setPageLoading(false);
        }
      } catch (error) {
        setPageLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);
  return (
    <section className="md:ml-[260px]">
      <div className="flex bg-[#F8F9FA] ">
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
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div>
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
                        index={50}
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
                        index={40}
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
                        index={20}
                      />
                    </div>
                    <div className="w-full ">
                      {/* <ColorInput
                        index={80}
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
                      /> */}
                      <div className="w-full flex items-start justify-start">
                        <NumberInput
                          label="Available discount"
                          placeholder="Enter available discount?"
                          value={productFormData.discount}
                          setValue={(data) => {
                            setProductFormData((prevData) => {
                              return { ...prevData, discount: data };
                            });
                            // if (data) {
                            //   setrequiredproductFormData((prevData) => {
                            //     return { ...prevData, discount: false };
                            //   });
                            // } else {
                            //   setrequiredproductFormData((prevData) => {
                            //     return { ...prevData, discount: true };
                            //   });
                            // }
                          }}
                          error={requiredproductFormData.discount}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="block lg:flex  justify-between gap-6">
                    <div className="w-full ">
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
                    <div className="w-full">
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
                  <div className="block lg:flex  justify-between  gap-6">
                    <div className="w-full flex items-start justify-start"></div>
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
                    <VariantInput
                      index={50}
                      value={variantTable.map((item) => {
                        return item.color;
                      })}
                      label="Colour"
                      placeholder="Choose colours available for this product"
                      setValue={addToVariantTable}
                    />
                  </div>
                  <div className="w-full">
                    <MaterialInput
                      label="Material"
                      placeholder="Choose available for this product"
                      handleSelect={addToVariantTable}
                      value={variantFiles}
                    />
                  </div>
                  <div className="w-full">
                    <SizeInput
                      value={productFormData.variantSizes}
                      setValue={(data, index) => {
                        if (index !== undefined) {
                          removeVariant(index);
                        } else {
                          console.log(index);
                          addSizeToVariant(data);
                        }
                        setProductFormData((prevData) => {
                          return { ...prevData, variantSizes: data };
                        });
                        if (data) {
                          setrequiredproductFormData((prevData) => {
                            return { ...prevData, variantSizes: false };
                          });
                        } else {
                          setrequiredproductFormData((prevData) => {
                            return { ...prevData, variantSizes: true };
                          });
                        }
                      }}
                      error={requiredproductFormData.variantSizes}
                      data={[
                        "Extra small",
                        "Small",
                        "Medium",
                        "Large",
                        "Extra large",
                      ]}
                      label="Sizes"
                      index={40}
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
                    <VariantTable
                      data={variantTable}
                      // QuantityHandler={variantQuantityHandler}
                      submitVariantImage={submitVariantImage}
                      quantityHandler={VariantQuantityHandler}
                      priceHandler={priceHandler}
                    />
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
            </div>
          )}

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

      {/* <Modal content={<DragDrop></DragDrop>}></Modal> */}
    </section>
  );
};

export default AddProduct;
