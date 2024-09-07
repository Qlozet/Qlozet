"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
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
import MaterialInput from "@/components/MaterialInput";
import SizeInput from "@/components/SizeInput";
import { modifySizeHandler, uploadSingleImage } from "@/utils/helper";
import DragDrop from "@/components/DragandDrop/ind";
import AddAcessories from "@/components/Products/Accessories";
import style from "./index.module.css";
import Styles from "@/components/Products/StyleComponent/style";
import ColorInput from "@/components/ColorInput";
const AddProduct = () => {
  const [variantTable, setVariantTable] = useState([]);
  const router = useRouter();
  const [showCustomiseOrder, setShowCustomiseOrder] = useState(false);
  const [showAddAccessories, setShowAddAccessories] = useState(false);
  const [pageLoading, setPageLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [positionModal, setPositionModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedVariantFIles, setselectedVariantFIles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [variantFiles, setVariantFiles] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [positionStyles, setPositionStyles] = useState([]);
  const [accessories, setAcessories] = useState([]);
  const [materialUploadLoading, setMaterialUploadLoading] = useState(false);
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
    setProductFormData((prevData) => {
      return { ...prevData, images: files };
    });

    setDeletedFiles(deletedFiles);
  };

  const submitAcessories = (acess) => {
    setAcessories((prevData) => {
      return [...prevData, { image: acess.images, id: acess.id }];
    });
  };

  const handleSelectStyle = (positionStyles, width, height) => {
    console.log(width, height);
    const filter = positionStyles.map((item) => item.style);
    const stylesExist = filter
      .filter((item) => {
        if (item) {
          return item;
        }
      })
      .flat()
      .map((item) => {
        return {
          id: item.id,
          position: item.position,
          imageIndex: item.imageIndex,
        };
        // return {
        //   id: item.id,
        //   position: {
        //     left: (item.position.left * 100) / width,
        //     top: (item.position.left * 100) / height,
        //     right: (width - item.position.left * 100) / width,
        //     Bottoms: (height - item.position.left * 100) / height,
        //   },
        //   imageIndex: item.imageIndex,
        // };
      });

    const containsPostion = stylesExist.filter((item) => {
      if (item.position) {
        return item;
      } else {
      }
    });
    setPositionStyles(containsPostion);
    console.log(positionStyles);
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
        size: variantTable[listIndex].sizes,
        quantity: variantTable[listIndex].quantity,
      };
      prevVariantTable[listIndex] = newVariantItem;
      setVariantTable(prevVariantTable);
    }
  };

  const addToVariantTable = async (data) => {
    if (data instanceof File) {
      setMaterialUploadLoading(true);
      const imageUrl = await uploadSingleImage(data);
      imageUrl && setMaterialUploadLoading(false);
      imageUrl &&
        setselectedVariantFIles((prevData) => {
          return [...prevData, imageUrl.secure_url];
        });
    } else {
      setProductFormData((prevData) => {
        return { ...prevData, variantSizes: [] };
      });
      setSelectedColors((prevData) => {
        return [...prevData, data[0]];
      });
    }
  };

  const addSizeToVariant = (size) => {
    const addColorAndMaterial = [...selectedColors, ...selectedVariantFIles];
    addColorAndMaterial.map((item) => {
      console.log(modifySizeHandler(size[size.length - 1]));
      setVariantTable((prevData) => {
        return [
          ...prevData,
          {
            color: item,
            images: {
              retained: [],
              deleted: [],
            },
            prize: productFormData.productPrice,
            size: modifySizeHandler(size[size.length - 1]),
            quantity: productFormData.productQuantity,
          },
        ];
      });
    });
  };

  const removeColorVariant = (color, index) => {
    setSelectedColors(selectedColors.filter((item) => item !== color));
    setVariantTable(variantTable.filter((item) => item.color !== color));
  };

  const removeMaterialHandler = (material) => {
    setselectedVariantFIles(
      selectedVariantFIles.filter((item) => item !== material)
    );
    setVariantTable(variantTable.filter((item) => item.color !== material));
  };

  const removeVariant = (variantIndex, data) => {
    console.log(data);
    console.log(variantTable);
    // setVariantTable(
    //   variantTable.filter((item, index) => index !== variantIndex)
    // );
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
    const mergedArray = positionStyles.flat();
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
          customStyles: positionStyles,
          accessories: accessories.map((item) => {
            return item.id;
          }),
          productType:
            productFormData.productType === "Customizable"
              ? "customizable"
              : "outright",
          discount: productFormData.discount,
          isFeatured: 0,
          images: {
            retained: productFormData.images,
            deleted: productId ? deletedFiles : [],
          },
          variants: variantTable.map((item) => {
            let varantItem = {
              colors: item.color,
              size: item.size,
              price: 90,
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
    const styleResponse = await getRequest("/vendor/products/styles/all");
    setStyles(styleResponse.data.data);
    if (productId) {
      try {
        setPageLoading(true);
        const response = await getRequest(`/vendor/products/${productId}`);
        if (response.data.data) {
          setProductFormData({
            productName: response.data.data.name,
            productPrice: response.data.data.price,
            productTag: response.data.data.tag,
            description: response.data.data.description,
            productQuantity: response.data.data.quantity,
            productCategory: response.data.data.categories.map(
              (item) => item.name
            ),
            variantSizes: [],
            productType:
              response.data.data.type === "customizable"
                ? "Customizable"
                : "Outright",
            discount: response.data.data.discount,
            isFeatured: false,
            colors: response.data.data.variants.map((item) => {
              return item.color.hex;
            }),
            images: response.data.data.images,
          });

          setAcessories(
            response.data.data.accessories.map((item) => {
              return { image: item.images[0].secure_url, id: item._id };
            })
          );
          setSelectedColors(
            response.data.data.variants.map((item) => {
              return item.color.hex;
            })
          );
          setVariantTable(
            response.data.data.variants.map((item) => {
              return {
                color: item.color.hex,
                size: item.size.value,
                price: item.price,
                quantity: item.qty,
                images: {
                  retained: [],
                  deleted: [],
                },
              };
            })
          );
          const idSet = new Set(
            response.data.data.customStyles.map((obj) => obj.id)
          );
          const filteredArray1 = styleResponse.data.data.filter((obj) =>
            idSet.has(obj._id)
          );
          const productStyles = filteredArray1.map((item, index) => {
            const stylePositionExist = response.data.data.customStyles.filter(
              (styleItem) => styleItem.id === item._id
            );
            return {
              image: item.imageUrl,
              id: item._id,
              name: item.class,
              position: stylePositionExist && stylePositionExist[0].position,
              imageIndex:
                stylePositionExist && stylePositionExist[0].imageIndex,
            };
          });

          setSelectedStyles(productStyles);
          localStorage.setItem("styleTypes", JSON.stringify(productStyles));
          setPageLoading(false);
        }
      } catch (error) {
        setPageLoading(false);
      }
    }
  };
  // const fetchStyles = async () => {
  //   try {
  //   catch (error) {}
  // };

  useEffect(() => {
    localStorage.removeItem("styleTypes");
    // fetchStyles();
  }, []);

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    const localData = localStorage.getItem("styleTypes");
    if (localData) {
      const savedData = JSON.parse(localData);
      savedData && setSelectedStyles(savedData);
    }
  }, [showCustomiseOrder]);
  return (
    <section>
      <div className="flex bg-[#F8F9FA] ">
        <div className="w-full p-4">
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div>
              <div className="mt-4"></div>
              <div className="">
                <div className="mx-0 bg-gray-300 lg:bg-white p-4  rounded-t-lg lg:translate-x-2">
                  <CheckBoxInput label="Add variants if product comes in multiple versions like different sizes and colours" />
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
                        index={20}
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
                        index={15}
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
                      <div className="w-full">
                        <NumberInput
                          label="Available discount"
                          placeholder="Enter available discount?"
                          value={productFormData.discount}
                          setValue={(data) => {
                            setProductFormData((prevData) => {
                              return { ...prevData, discount: data };
                            });
                          }}
                          error={requiredproductFormData.discount}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="block md:grid grid-cols-3  justify-between gap-6">
                    <div className="w-full max-w-full">
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
                  <div
                    className={`flex overflow-x-scroll gap-4 pb-2 ${style.scrollbarElement}`}
                  >
                    <CustomiSationButton
                      handleClick={() => {
                        setShowCustomiseOrder(true);
                      }}
                    />
                    <Styles
                      data={selectedStyles}
                      price={productFormData.productPrice}
                    />
                  </div>
                  <div>
                    <div className="">
                      <Typography
                        textWeight="font-[700]"
                        textSize="text-[18px]"
                        verticalPadding="my-2"
                        textColor="text-dark"
                      >
                        Add Accessories
                      </Typography>
                    </div>
                  </div>
                  <div
                    className={`flex overflow-x-scroll gap-4 ${style.scrollbarElement}`}
                  >
                    <CustomiSationButton
                      handleClick={() => {
                        setShowAddAccessories(true);
                      }}
                    />
                    <Styles data={accessories} />
                  </div>
                  <div className="w-full">
                    <ColorInput
                      index={50}
                      value={selectedColors}
                      label="Colour"
                      placeholder="Choose colours available for this product"
                      setValue={addToVariantTable}
                      removeColorHandler={removeColorVariant}
                    />
                  </div>
                  <div className="w-full">
                    <MaterialInput
                      label="Material"
                      placeholder="Choose available for this product"
                      handleSelect={addToVariantTable}
                      value={selectedVariantFIles}
                      removeMaterialHandler={removeMaterialHandler}
                      loading={materialUploadLoading}
                    />
                  </div>
                  <div className="w-full">
                    <SizeInput
                      disabled={
                        [...selectedColors, ...selectedColors].length > 0
                          ? false
                          : true
                      }
                      value={productFormData.variantSizes}
                      setValue={(data, index) => {
                        if (index !== undefined) {
                          removeVariant(index, data);
                        } else {
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
                  <div className="my-8">
                    <DashedComponent name={"Product variants"} />
                  </div>
                  <div></div>
                  <div>
                    <div className="flex items-center">
                      <Typography
                        textWeight="font-[700]"
                        textSize="text-[18px]"
                        verticalPadding="my-2"
                        textColor="text-dark"
                      >
                        Variant Table
                      </Typography>
                    </div>
                    <div>
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
            </div>
          )}
          {showCustomiseOrder && (
            <Modal
              content={
                <CustomizeOrder
                  styleData={styles}
                  closeModal={() => {
                    setShowCustomiseOrder(false);
                    setPositionModal(true);
                  }}
                />
              }
            ></Modal>
          )}
          {showAddAccessories && (
            <Modal
              content={
                <AddAcessories
                  submitAcessories={submitAcessories}
                  closeModal={() => {
                    setShowAddAccessories(false); 
                  }}
                />
              }
            ></Modal>
          )}
        </div>
          </div>
      {positionModal && (
        <DragDrop     
          handleSelectStyle={handleSelectStyle}
          productImages={productFormData.images}
          selectedStyles={selectedStyles}
          closeModal={() => {
            setPositionModal(false);
          }}
        ></DragDrop>
      )}
    </section>
  );
};

export default AddProduct;
