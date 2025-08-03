"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import DashedComponent from "@/components/DashedComponent";
import SelectInput from "@/components/SelectInput";
import FileInput from "@/components/uploadFileinput/UploadFileInput";
import Typography from "@/components/Typography";
import CustomiSationButton from "@/components/CustomizationButton";
import CustomizeOrder from "@/components/Products/CustomizeOrder";
import VariantTable from "../../../components/add/VariantTable/index2.js";
import NumberInput from "@/components/NumberInput";
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
import ColorInput from "@/components/ColorInput/index2";
import { v4 as uuidv4 } from "uuid";
import SelectMultipleInput from "@/components/SelectMultipleInput/index.js";
import GoBack from "@/components/GoBack/index.js";
import informationIcon from "../../../public/assets/svg/information.svg";
import TextArea from "@/components/TextAreaInput/index.js";
import SingleCustomzeCard from "@/components/Products/SingleCustomizeCard/index.js";
import { useFormik } from "formik";
import { object, string, number, date, InferType, array } from "yup";
import RichTextEditor from "@/components/Editor/index.js";
const AddProduct = () => {
  const router = useRouter();

  // States
  const formik = useFormik({
    initialValues: {
      productName: "",
      productStatus: "",
      productTag: [],
      productDes: "",
      category: [],
      subCategory: [],
      productType: "",
      pricing: "",
      discount: "",
      productImage: [],
      styles: []
    },
    validationSchema: object().shape({
      productName: string().required("Product name is required"),
      productStatus: string().required("Status is required"),
      productTag: array()
        .of(string().required("Tag is required"))
        .min(1, "At least one tag is required")
        .required("Product tag is required"),
      productDes: string().required("Description name is required"),
      category: array().of(string().required("Category is required")),
      productType: string().required("Type is required"),
      pricing: string().required("Pricing name is required"),
      discount: string().optional(),
      productImage: array().of(
        object().shape({
          secure_url: string().required("Secure url is required"),
          public_id: string().required("Public id is required"),
          asset_id: string().required("Asset id is required"),
        })
      ),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          "name": values.productName,
          "price": formik.values.pricing,
          "discountedPrice": formik.values.discount,
          "description": formik.values.productDes,
          "quantity": 23,
          images: values.productImage,
          "isCustomizable": false,
          "isDesigned": false,
          "colors": ["#808080"],
          "status": false,
          "discount": 0,
          "subcategories": [
            "67c9a406db0c68345ea9bcf1", "67c9a424db0c68345ea9bcf7"
          ],


          customStyles: positionStyles,

          fabrics: [],
          accessories: [],

          "isFeatured": false,
          "pickupAvailable": false,
          "sizeOptions": [
            {
              "size": "XL",
              "quantityAvailable": 100
            }
          ],
          tag: values.tag,
          "type": "customizable",
          "isPromo": true,
          "isVariantAvailable": false,
          tribes: [],
          // "tribes": ["667bc853fbc0fff35605b1d3"],
          // "bodyFit": ["petite"],
          bodyFit: [],
          // "occassion": ["dinner"],
          occassion: [],
          "isOnSale": true,
          "usdPrice": 100,
          "productStatus": "draft"
        }
        const response = await postRequest("/vendor/products", {
          ...payload
          // name: values.productName,
          // price: values.pricing,
          // discountedPrice: values.discount,
          // discountPercentage: 0,
          // discountDate: "Unknown Type: Date",
          // description: values.productDes,
          // quantity: 0,
          // details: ["string"],
          // isCustomizable: false,
          // customStyles: [
          // {
          //   imageIndex: 0,
          //   id: "string",
          //   price: 0,
          //   position: {
          //     left: 0,
          //     right: 0,
          //     top: 0,
          //     bottom: 0,
          //   },
          // },
          // ],
          // isDesigned: false,
          // design: ["string"],
          // status: values.productStatus === "active" ? true : false,
          // colors: [],
          // discount: 0,
          // categories: [
          //   {
          //     name: "string",
          //     parentCategory: "string",
          //   },
          // ],
          // collections: [],
          // isFeatured: false,
          // images: values.productImage,
          // likes: ["string"],
          // viewCount: {
          //   count: 0,
          //   date: "2025-05-24T10:34:27.401Z",
          // },
          // reviews: ["string"],
          // pickupAvailable: false,
          // sizeOptions: [
          // {
          //   size: "string",
          //   quantityAvailable: 0,
          // },
          // ],
          // tag: values.productTag,
          // type: values.productType,
          // variants: [
          //   {
          //     color: "string",
          //     size: "string",
          //     quantity: 0,
          //     price: 0,
          //     images: {
          //       retained: ["string"],
          //       deleted: ["string"],
          //     },
          //   },
          // ],
          // variant: [],
          // isPromo: false,
          // accessories: [],
          // fabrics: ["string"],
          // isVariantAvailable: false,
          // tribes: ["string"],
          // bodyFit: [],
          // occasion: [],
          // isOnSale: false,
          // productStatus: "archived",
        });

        if (response.code == 200) {
          router.push('/products/cloths')
        }
      } catch (error) { }
    },
  });
  const [categories, setCategories] = useState([]);
  const [variantTable, setVariantTable] = useState([]);
  const [showCustomiseOrder, setShowCustomiseOrder] = useState(false);
  const [showAddAccessories, setShowAddAccessories] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [positionModal, setPositionModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedVariantFiles, setSelectedVariantFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [positionStyles, setPositionStyles] = useState([]);
  const [accessories, setAcessories] = useState([]);
  const [materialUploadLoading, setMaterialUploadLoading] = useState(false);
  const [addVariant, setAddVariant] = useState(false);
  const [productFormData, setProductFormData] = useState({
    productName: "",
    productStatus: "",
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
  const [editorContent, setEditorContent] = useState("");

  const [requiredproductFormData, setrequiredproductFormData] = useState({
    productName: false,
    productStatus: false,
    productPrice: false,
    productTag: false,
    description: false,
    productQuantity: false,
    productType: false,
    productCategory: false,
    colors: false,
  });

  // Functions
  const handleSelectFile = async (files, deletedFiles) => {
    formik.setFieldValue("productImage", files);
    if (deletedFiles) {
      setDeletedFiles(deletedFiles);
    } else {
      setDeletedFiles([]);
    }

    if (files.length < 1) {
      setSelectedStyles([]);
    }
  };

  const submitAcessories = (acess) => {
    setAcessories((prevData) => {
      return [
        ...prevData,
        { image: acess.images, id: acess.id, price: acess.price },
      ];
    });
  };

  const handleSelectStyle = (positionStyles, width, height) => {
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
          ...item,
          position: item.position,
          imageIndex: item.imageIndex,
        };
      });
    const containsPostion = stylesExist.filter((item) => {
      if (item.position) {
        return item;
      } else {
      }
    });
    console.log(containsPostion)
    setPositionStyles(containsPostion);
  };

  const submitVariantImage = async (file, id, imageIndex, color) => {
    const imageUrl = await uploadSingleImage(file);
    const orderItems = variantTable.filter((item) => item.color !== color);
    const targetItems = variantTable.filter((item) => item.color === color);
    targetItems[0].images.retained = [
      ...targetItems[0].images.retained,
      imageUrl,
    ];
    const targetColors = targetItems.map((item) => {
      return {
        id: item.id,
        price: item.price,
        color: item.color,
        checked: item.checked,
        quantity: item.quantity,
        size: item.size,
        index: item.index,
        images: { retained: [...item.images.retained, imageUrl] },
      };
    });
    setVariantTable([...targetItems, ...orderItems]);
  };

  const addToVariantTable = async (data) => {
    if (data instanceof File) {
      setMaterialUploadLoading(true);

      const imageUrl = await uploadSingleImage(data);
      imageUrl && setMaterialUploadLoading(false);
      imageUrl &&
        setSelectedVariantFiles((prevData) => {
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
    const id = uuidv4();
    const addColorAndMaterial = [
      ...selectedColors.filter((item) => item !== undefined),
      ...selectedVariantFiles.filter((item) => item !== undefined),
    ];
    setProductFormData((prevData) => {
      return {
        ...prevData,
        variantSizes: [
          ...productFormData.variantSizes,
          { size: size[size.length - 1], id: id },
        ],
      };
    });
    addColorAndMaterial.map((item, index) => {
      const variantId = uuidv4();
      setVariantTable((prevData) => {
        return [
          ...prevData,
          {
            index: index,
            id: variantId,
            checked: false,
            color: item,
            images: {
              retained: [],
              deleted: [],
            },
            price: productFormData.productPrice
              ? productFormData.productPrice
              : 0,
            size: modifySizeHandler(size[size.length - 1]),
            quantity: productFormData.productQuantity
              ? productFormData.productQuantity
              : 0,
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
    setSelectedVariantFiles(
      selectedVariantFiles.filter((item) => item !== material)
    );
    setVariantTable(variantTable.filter((item) => item.color !== material));
  };

  const handleDeleteVariantFromTable = (id, color, size) => {
    let newVariants = [];
    if (id) {
      // Remove all item with id = id
      newVariants = variantTable.filter((item) => item.id !== id);
    } else {
      // Remove all item with color = color
      newVariants = variantTable.filter((item) => item.color !== color);
    }
    setVariantTable(newVariants);
  };

  const handleVariantChecked = (data, id, color) => {
    let newVariantTable = [];
    if (id) {
      newVariantTable = variantTable.map((item) => {
        if (item.id === id) {
          return {
            id: item.id,
            price: item.price,
            images: item.images,
            color: item.color,
            checked: data,
            quantity: item.quantity,
            size: item.size,
            index: item.index,
          };
        } else {
          return item;
        }
      });
    } else {
      newVariantTable = variantTable.map((item) => {
        if (item.color === color) {
          return {
            id: item.id,
            price: item.price,
            images: item.images,
            color: item.color,
            checked: data,
            quantity: item.quantity,
            size: item.size,
            index: item.index,
          };
        } else {
          return item;
        }
      });
    }

    setVariantTable(newVariantTable);
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

  const priceHandler = (value, id, color) => {
    let newVariantTable = [];
    if (id) {
      newVariantTable = variantTable.map((item) => {
        if (item.id === id) {
          return {
            id: item.id,
            price: value,
            images: item.images,
            color: item.color,
            checked: item.checked,
            quantity: item.quantity,
            size: item.size,
            index: item.index,
          };
        } else {
          return item;
        }
      });
    } else {
      newVariantTable = variantTable.map((item) => {
        if (item.color === color) {
          return {
            id: item.id,
            price: value,
            images: item.images,
            color: item.color,
            checked: item.checked,
            quantity: item.quantity,
            size: item.size,
            index: item.index,
          };
        } else {
          return item;
        }
      });
    }

    setVariantTable(newVariantTable);
  };

  const handleEditStylePrice = (stylesPricerice, styleId) => {
    setPositionStyles(
      positionStyles.map((item) => {
        if (item.id === styleId) {
          return { ...item, price: stylesPricerice };
        } else {
          return item;
        }
      })
    );
  };

  const handleSubmit = async () => {
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
          colors: [],
          isVariantAvailable: productFormData.isVariantAvailable,
          customStyles: positionStyles,
          accessories: accessories.map((item) => {
            return item.id;
          }),
          productType:
            productFormData.productType === "Customizable"
              ? "customizable"
              : "Non customizable",
          discount: productFormData.discount,
          isFeatured: 0,
          images: {
            retained: productFormData.images.map((item) => {
              return {
                asset_id: item.asset_id,
                public_id: item.public_id,
                secure_url: item.secure_url,
              };
            }),
            deleted: deletedFiles,
          },
          variants: variantTable.map((item) => {
            let varantItem = {
              color: item.color,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
              images: {
                retained: item.images.retained,
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
          toast(<Toast text={"An error occured"} type="danger" />);
        }
      } catch (error) {
        setIsLoading(false);
        toast(<Toast text={error?.message} type="danger" />);
      }
    } else {
      setrequiredproductFormData((prevData) => {
        return { prevData, ...data };
      });
    }
  };

  const removeSizeFromVariant = (sizeInfo) => {
    const newVariants = productFormData.variantSizes.filter(
      (item) => item.id !== sizeInfo.id
    );
    setVariantTable(variantTable.filter((item) => item.id !== sizeInfo.id));
    setProductFormData((prevData) => {
      return { ...prevData, variantSizes: newVariants };
    });
  };

  const fetchProduct = async () => {
    const productId = getProductId();
    const styleResponse = await getRequest("/vendor/products/styles/all");
    setStyles(styleResponse.data.data);
    if (productId) {
      try {
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
              return {
                image: item.images[0].secure_url,
                id: item._id,
                price: item.price,
              };
            })
          );
          const variantColors = response.data.data.variants.map((item) => {
            if (!item.color.hex.includes("https://res.cloudinary.com")) {
              return item.color.hex;
            }
          });
          setSelectedColors(variantColors);
          const variantMaterials = response.data.data.variants.map((item) => {
            if (item.color.hex.includes("https://res.cloudinary.com")) {
              return item.color.hex;
            } else {
            }
          });

          const newsw = response.data.data.variants.map((item) =>
            item.color.hex.includes("https://res.cloudinary.com")
          );
          setSelectedVariantFiles(variantMaterials);
          if (response.data.data.variants.length > 0) {
            setAddVariant(true);
          }

          setVariantTable(
            response.data.data.variants.map((item) => {
              return {
                id: uuidv4(),
                color: item.color.hex,
                size: item.size.value,
                price: item.price,
                quantity: item.qty,
                images: {
                  retained: item.images,
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
              price: stylePositionExist && stylePositionExist[0].price,
            };
          });
          setPositionStyles(productStyles);
          setSelectedStyles(productStyles);
          localStorage.setItem("styleTypes", JSON.stringify(productStyles));
          setPageLoading(false);
        }
      } catch (error) {
        // setPageLoading(false);
      }
    } else {
      setPageLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getRequest(
        "/vendor/products/vendor/all-categories"
      );
      if (response.status === 200) {
        setCategories(

          response?.data?.data.map((item) => {
            return {
              text: item.name,
              id: item._id,
            };
          })
        );
      } else {
        toast("An error occured fetching category");
      }
    } catch (error) { }
  };


  useEffect(() => {
    localStorage.removeItem("styleTypes");
    // fetchStyles();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  useEffect(() => {
    const localData = localStorage.getItem("styleTypes");
    if (localData) {
      const savedData = JSON.parse(localData);

      savedData &&
        setSelectedStyles(
          savedData.map((item) => {
            return {
              ...item,
              price: productFormData.productPrice
                ? productFormData.productPrice
                : 0,
            };
          })
        );
    }
  }, [showCustomiseOrder]);
  return (
    <section>
      <div className="flex bg-[#F8F9FA] ">
        <div className="w-full px-4 pb-4">
          <div className="my-4">
            <GoBack />
          </div>

          <div className="bg-[#F8F5F2] p-4 rounded-xl flex item-center gap-4 max-w-[622px]  mt-6">
            <span className="w-[32px] h-[32px] bg-primary flex items-center justify-center  rounded">
              <img src={informationIcon.src} />
            </span>
            <span className="text-[13px] text-[#808192]">
              Upload picture products with close to white background in high
              resolution and quality
            </span>{" "}
          </div>
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div>
              <div className="">
                <div className="lg:py-3"></div>
                <div className="mx-0 mt-2 bg-gray-[#F4F4F4] lg:bg-white rounded-t-lg lg:translate-x-2 border-[1px] border-solid lg:border-none">
                  <h4 className=" font-medium pt-2 px-4 pb-2 lg:hidden">
                    {" "}
                    Product Info
                  </h4>
                </div>
                <div className="bg-white w-full p-4 mx-0 lg:rounded-2xl">
                  <DashedComponent name={"Product info"} />
                  <div className="block lg:flex items-center justify-between  gap-6">
                    <div className="w-full lg:w-3/5">
                      <TextInput
                        tooltips={true}
                        value={formik.values.productName}
                        label="Product name"
                        placeholder="Enter product name"
                        setValue={(data) => {
                          formik.setFieldValue("productName", data);
                        }}
                        error={formik.touched.productName ? formik.errors.productName : ""}
                      />
                    </div>
                    <div className="w-full lg:w-2/5">
                      <SelectInput
                        zIndex={30}
                        tooltips={true}
                        label="Product status"
                        value={formik.values.productStatus}
                        data={[
                          { text: "Active", id: "active" },
                          { text: "Inactive", id: "inactive" },
                          { text: "Draft", id: "draft" },

                        ]}
                        setValue={(data) => {
                          formik.setFieldValue("productStatus", data);
                        }}
                      />
                    </div>
                  </div>
                  <div className="block lg:flex items-start justify-between gap-6 ">


                    <div className="w-full lg:w-3/5 h-full ">

                      <RichTextEditor onChange={(html) => {
                        formik.setFieldValue("productDes", html);
                      }} label="Product description"
                      />
                      {/* <TextArea
                        label="Product description"
                        placeholder="Enter description"
                        value={formik.values.productDes}
                        setValue={(data) => {
                          formik.setFieldValue("productDes", data);
                        }}
                        error={formik.errors.productDes}
                      /> */}
                    </div>
                    <div className="w-full lg:w-2/5">
                      <div className="lg:mt-6 pb-3">
                        <Typography
                          textColor="text-sectionHeader"
                          textWeight="font-semibold"
                          textSize="text-[18px]"
                          verticalPadding={0}
                        >
                          Product organization
                        </Typography>
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        <SelectMultipleInput
                          zIndex={60}
                          tooltips={true}
                          value={formik.values.productTag}
                          data={[
                            { text: "Men", id: 1 },
                            { text: "Formal", id: 2 },
                            { text: "Casual", id: 3 },
                          ]}
                          label="Tag"
                          setValue={(data) => {
                            formik.setFieldValue(
                              "productTag",
                              data.map((item) => item.text)
                            );
                          }}
                        />
                        <SelectMultipleInput
                          zIndex={50}
                          tooltips={true}
                          value={formik.values.category}
                          data={categories}
                          label="Category"
                          setValue={(data) => {
                            console.log(data)
                            formik.setFieldValue(
                              "category",
                              data.map((item) => item.id)
                            );
                          }}
                        />
                        <SelectMultipleInput
                          zIndex={40}
                          tooltips={true}
                          value={formik.values.subCategory}
                          data={[
                            { text: "Male", id: 1 },
                            { text: "Female", id: 2 },
                          ]}
                          label="Sub-category"
                          setValue={(data) => {
                            formik.setFieldValue(
                              "subCategory",
                              data.map((item) => item.text)
                            );
                          }}
                        />
                        <SelectInput
                          zIndex={30}
                          tooltips={true}
                          value={formik.values.productType}
                          data={[
                            { text: "Customizable", id: "customizable" },
                            { text: "Normal", id: "normal" },
                          ]}
                          label="Product type"
                          setValue={(data) => {
                            formik.setFieldValue("productType", data);
                          }}
                          removeColorHandler={removeColorVariant}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="block lg:flex items-start justify-between gap-6 h-full lg:my-4">
                    <div className="w-full lg:w-3/5">
                      <FileInput
                        tooltips={true}
                        handleSelect={handleSelectFile}
                        label="Upload product image"
                        value={productFormData.images}
                      />
                    </div>
                    <div></div>
                    <div className="w-full lg:w-2/5">
                      <div className="lg:mt-4">
                        {" "}
                        <Typography
                          textColor="text-sectionHeader"
                          textWeight="font-semibold"
                          textSize="text-[18px]"
                          verticalPadding={0}
                        >
                          Pricing
                        </Typography>
                      </div>
                      <NumberInput
                        tooltips={true}
                        label="Price"
                        placeholder="Enter price"
                        value={formik.values.pricing}
                        setValue={(data) => {
                          formik.setFieldValue("pricing", data);
                        }}
                      />

                      <NumberInput
                        tooltips={true}
                        label="Available discount"
                        placeholder="Enter available discount?"
                        value={formik.values.discount}
                        setValue={(data) => {
                          formik.setFieldValue("discount", data);
                        }}
                      />
                    </div>
                  </div>

                  {/* </div> */}
                  {/* <div className="w-full"> */}

                  <div className="block lg:flex items-center justify-between  gap-6"></div>
                  <div className="block lg:grid grid-cols-3  justify-between gap-6">
                    <div className="w-full "></div>
                  </div>
                  <div className="block lg:flex  justify-between  gap-6">
                    <div className="w-full flex items-start justify-start"></div>
                  </div>
                  <div className="block lg:flex items-center justify-between gap-6"></div>
                  <div className="my-4">
                    <DashedComponent name={"Customization"} />
                  </div>

                  <div className="flex flex-col gap-6">
                    <SingleCustomzeCard
                      text={"Add Styles"}
                      children={
                        <div>
                          <div
                            className={`flex overflow-x-scroll gap-4 pb-2 ${style.scrollbarElement}`}
                          >
                            <CustomiSationButton
                              handleClick={() => {
                                setShowCustomiseOrder(true);
                              }}
                              text={"Price:"}
                            />
                            <Styles
                              handleEditStylePrice={handleEditStylePrice}
                              data={formik.values.styles}
                              price={productFormData.productPrice}
                            />
                          </div>
                        </div>
                      }
                    />

                    <SingleCustomzeCard
                      text={"Additional Component"}
                      children={
                        <div
                          className={`flex overflow-x-scroll gap-4 ${style.scrollbarElement}`}
                        >
                          <CustomiSationButton
                            handleClick={() => {
                              setShowAddAccessories(true);
                            }}
                          />

                          {/* The accesorries is returning only id he should return the full data */}
                          <Styles data={accessories} />
                        </div>
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-6 my-4">
                    <SingleCustomzeCard
                      text={"Additional Component"}
                      children={
                        <div
                          className={`flex overflow-x-scroll gap-4 ${style.scrollbarElement}`}
                        >
                          <div>
                            <div className="w-full">
                              <ColorInput
                                index={1200}
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
                                value={selectedVariantFiles}
                                removeMaterialHandler={removeMaterialHandler}
                                loading={materialUploadLoading}
                              />
                            </div>

                            <div className="w-full">
                              <SizeInput
                                disabled={
                                  [...selectedColors, ...selectedVariantFiles]
                                    .length > 0
                                    ? false
                                    : true
                                }
                                value={productFormData.variantSizes}
                                setValue={(data, index) => {
                                  if (index !== undefined) {
                                  } else {
                                    addSizeToVariant(data);
                                  }
                                  if (data) {
                                    setrequiredproductFormData((prevData) => {
                                      return {
                                        ...prevData,
                                        variantSizes: false,
                                      };
                                    });
                                  } else {
                                    setrequiredproductFormData((prevData) => {
                                      return {
                                        ...prevData,
                                        variantSizes: true,
                                      };
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
                                removeSizeFromVariant={removeSizeFromVariant}
                              />
                            </div>
                            <div className="my-8">
                              <DashedComponent name={"Product variants"} />
                            </div>
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
                                handleChecked={handleVariantChecked}
                                data={variantTable}
                                submitVariantImage={submitVariantImage}
                                quantityHandler={VariantQuantityHandler}
                                priceHandler={priceHandler}
                                handleDeleteVariantFromTable={
                                  handleDeleteVariantFromTable
                                }
                              />
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <div>
                    <div className="my-4">
                      <Button
                        loading={formik.isSubmitting}
                        children="Save"
                        btnSize="large"
                        variant="primary"
                        maxWidth="max-w-[10rem]"
                        clickHandler={() => {
                          formik.handleSubmit();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Modal
            show={showCustomiseOrder}
            content={
              <>
                {showCustomiseOrder && (
                  <CustomizeOrder
                    formik={formik}
                    styleData={styles}
                    closeModal={() => {
                      setShowCustomiseOrder(false);
                      setPositionModal(true);
                    }}
                  />
                )}
              </>
            }
          ></Modal>
          <Modal
            show={showAddAccessories}
            content={
              <>
                {showAddAccessories && (
                  <AddAcessories
                    submitAcessories={submitAcessories}
                    closeModal={() => {
                      setShowAddAccessories(false);
                    }}
                  />
                )}
              </>
            }
          ></Modal>
        </div>
      </div>
      <Modal
        show={positionModal}
        content={
          <>
            {positionModal && (
              <DragDrop
                handleSelectStyle={handleSelectStyle}
                productImages={formik.values.productImage}
                selectedStyles={formik.values.styles}
                closeModal={() => {
                  setPositionModal(false);
                }}
              ></DragDrop>
            )}
          </>
        }
      ></Modal>
    </section>
  );
};

export default AddProduct;
