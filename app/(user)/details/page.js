"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import arrowLeftIcon from "../../../public/assets/svg/arrow-left.svg";
import starIcon from "../../../public/assets/svg/productdetailstar.svg";
import heartIcon from "../../../public/assets/svg/productdetailsheart.svg";
import chatIcon from "../../../public/assets/svg/productdetailschat.svg";
import Image from "next/image";
import Button from "@/components/Button";
import Typography from "@/components/Typography";
import { getGetUserDetails, getProductId } from "@/utils/localstorage";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";
import arrowLeft from "../../../public/assets/svg/arrrowLeft.svg";
import arrowRight from "../../../public/assets/svg/arrowRightt.svg";
import Modal from "@/components/Modal";
import ProductReview from "@/components/Products/ReviewComponent";

const ProductDetails = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [number, setNumber] = useState(0);
  const [variants, setVariants] = useState([]);
  const [sliderImages, setSliderImages] = useState([])
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
    likes: [],
    reviews: [],
  });
  const fetchProduct = async () => {
    const productId = getProductId();

    try {
      const response = await getRequest(`/vendor/products/${productId}`);
      let colors = [];
      response.data.data.colors.map((item) => {
        colors.push(item.hex);
      });
      setVariants(
        response.data.data.variants.map((item) => {
          return item;
        })
      );
      setProductFormData({
        productName: response.data.data.name,
        productPrice: `₦${response.data.data.price.toLocaleString()}`,
        productTag: response.data.data.tag,
        description: response.data.data.description,
        productQuantity: response.data.data.quantity,
        productCategory: response.data.data.categories.map((item) => {
          return item.name;
        }),
        productType: response.data.data.type,
        discount: response.data.data.discount,
        isFeatured: 0,
        colors: colors,
        likes: response.data.data.likes,
        reviews: response.data.data.reviews,


        images: response.data.data.images.map((image) => {
          return image?.secure_url;
        }),
      });
      setSliderImages(response.data.data.images.map((image) => {
        return image?.secure_url;
      }))

      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
    }
  };

  const handleSetSliderImageToVariantImage = (variant) => {
    setSliderImages(variant.images.map((item) => item.secure_url))
  }
  const handleShowReview = () => {
    setShowReview(!showReview);
  };

  useEffect(() => {
    const vendor = getGetUserDetails();
    setVendorName(vendor.businessName);
    fetchProduct();
    // const
  }, []);
  return (
    <div className="">
      <div>
        <div className="flex min-h-[100dvh] bg-gray-400">
          <div className="w-full">
            {pageLoading ? (
              <Loader></Loader>
            ) : (
              <div className="px-4">
                <div
                  className="hidden  lg:flex  items-center gap-2  cursor-pointer"
                  onClick={() => {
                    router.push("../products");
                  }}
                >
                  <Image src={arrowLeftIcon} alt="" />
                  <h2
                    className="font-bold text-[18px] 
            my-4"
                  >
                    View Product
                  </h2>
                </div>
                <div className="lg:bg-white w-full lg:p-4 lg:rounded-[12px]">
                  <div className="bg-gray-300 p-4 rounded-t-[12px] lg:hidden mt-[1rem]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[700]"
                      textSize="text-[16px]"
                    >
                      Product Info
                    </Typography>
                  </div>
                  <div className="block lg:flex">
                    <div className="lg:flex-1 relative">
                      <div className="relative">
                        {sliderImages.length > 1 && (
                          <div className="absolute top-[50%] left-0 flex items-center justify-between w-[100%] px-6">
                            <div
                              className={`${number < 1 ? "bg-gray-300" : "bg-white"
                                }  w-[2.5rem]  h-[2.5rem] flex items-center justify-center rounded-[50%]`}
                              onClick={() => {
                                if (
                                  number <
                                  sliderImages.length - 1
                                ) {
                                  setNumber(number - 1);
                                }
                              }}
                            >
                              <Image
                                height={24}
                                width={24}
                                src={arrowLeft}
                                alt="Left icon"
                                className="rounded-b-[12px]"
                                unoptimized
                              />
                            </div>
                            <div
                              className={`${number === sliderImages.length - 1
                                ? "bg-gray-300"
                                : "bg-white"
                                }  w-[2.5rem]  h-[2.5rem] flex items-center justify-center rounded-[50%]`}
                              onClick={() => {
                                if (
                                  sliderImages.length - 1 >
                                  number
                                ) {
                                  setNumber(number + 1);
                                }
                              }}
                            >
                              <Image
                                height={24}
                                width={24}
                                src={arrowRight}
                                alt="product image"
                                className="rounded-b-[12px]"
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                        <Image
                          height={50}
                          width={50}
                          src={sliderImages[number]}
                          alt="product image"
                          className="rounded-[1rem]"
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          unoptimized
                        />
                        {/* <div className="min-h-[30rem] w-full" style={{ backgroundImage: `url(${sliderImages[number]})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}></div> */}
                      </div>
                    </div>

                    <div className="w-full p-8 lg:flex-1">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-[14px] text-primary-100">
                          {vendorName}
                        </p>
                        {/* <div className="items-center hidden lg:flex">
                          <p className="text-xs leading-[18px] underline font-bold text-primary-100">
                            View product in main site
                          </p>
                          <Image
                            height={14}
                            width={14}
                            src={arrowRight}
                            alt=""
                            unoptimized
                          />
                        </div> */}
                      </div>
                      <h1 className="text-[16px] lg:text-[32px] font-bold my-2 text-primary">
                        {productFormData.productName}
                      </h1>
                      <h2 className="block lg:hidden font-bold text-[14px] leading-[36px] text-primary lg:text-[#33CC33]">
                        {productFormData.quantity} Quantity
                      </h2>
                      <div className="flex items-center gap-6 my-4">
                        <div className="flex items-center gap-2">
                          <Image src={starIcon} alt="" width={20} height={20} />
                          <span className="font-bold text-[14px] leading-[20px]  pt-[2px]">
                            {productFormData.likes.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ">
                          <Image
                            src={heartIcon}
                            alt=""
                            width={20}
                            height={20}
                          />
                          <span className="font-bold text-[14px] leading-[20px]  pt-[2px]">
                            {productFormData.likes.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image src={chatIcon} alt="" width={20} height={20} />
                          <span className="font-bold text-[14px] leading-[20px] mr-1 flex pt-[2px]">
                            {/* {productFormData.reviews.length} */}
                          </span>
                          <p
                            className="underline font-light text-xs leading-[16px] text-[#495057] cursor-pointer ml-2"
                            onClick={handleShowReview}
                          >
                            Read reviews
                          </p>
                        </div>
                      </div>
                      <div className="hidden lg:flex items-center justify-between w-full mb-[30px]">
                        <h2 className="hidden lg:block font-bold text-[24px] leading-[36px]">
                          {productFormData.productPrice}
                        </h2>
                        {/* <h2 className="font-[500] text-[14px] leading-[36px] text-primary lg:text-[#33CC33]">
                          1,000 items delivered
                        </h2> */}
                      </div>

                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">Category</p>
                        {productFormData.productCategory.map((item, index) => (
                          <p className="font-bold col-span-2" key={index}>
                            {item}
                          </p>
                        ))}
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">Tag</p>
                        <p className="font-bold col-span-2">
                          {productFormData.productTag}
                        </p>
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">
                          Available colours
                        </p>
                        <div className="font-bold col-span-2 flex items-center gap-2">
                          {variants.map((item, index) => {

                            if (
                              item.color.hex.includes(
                                "https://res.cloudinary.com"
                              )
                            ) {
                              return (
                                <div
                                  onClick={() => {
                                    handleSetSliderImageToVariantImage(item)
                                  }}
                                  key={index}
                                  className="w-[20px] h-[20px] rounded-full"
                                  style={{
                                    backgroundImage: `url('${item.color.hex}')`,
                                    backgroundPosition: "center",
                                  }}
                                ></div>
                              );
                            } else {
                              return (
                                <div
                                  onClick={() => {
                                    handleSetSliderImageToVariantImage(item)
                                  }}
                                  key={index}
                                  className="w-[20px] h-[20px] rounded-full"
                                  style={{
                                    backgroundColor: `${item.color.hex}`,
                                  }}
                                ></div>
                              );
                            }
                          })}
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">
                          Available quantity
                        </p>
                        <p className="font-bold col-span-2">
                          {productFormData.productQuantity}
                        </p>
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">Available Sizes</p>
                        <p className="font-bold col-span-2">
                          {variants.map((item) => {
                          })}
                          XS, S, M, L, XL, XXL
                        </p>
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">Product type</p>
                        <p className="font-bold col-span-2">
                          {productFormData.productType}
                        </p>
                      </div>
                      <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[12px]">
                        <p className="font-light col-span-1">
                          Available discount
                        </p>
                        <p className="font-bold col-span-2">
                          {productFormData.discount}% off
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full justify-end">
                    <Button
                      className="text-[14px] leading-[20px]"
                      variant="primary"
                    >
                      Edit Product
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Modal
          show={showReview}
          content={
            <>   {showReview && (<ProductReview
              productName={productFormData.productName}
              reviews={productFormData.reviews}
              closeModal={handleShowReview}
            ></ProductReview>)}</>
          }
        ></Modal>
      </div>
    </div>
  );
};

export default ProductDetails;
