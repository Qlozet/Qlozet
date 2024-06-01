"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import arrowLeftIcon from "../../../../public/assets/svg/arrow-left.svg";
import arrowRightIcon from "../../../../public/assets/svg/arrow-right.svg";
import starIcon from "../../../../public/assets/svg/productdetailstar.svg";
import heartIcon from "../../../../public/assets/svg/productdetailsheart.svg";
import chatIcon from "../../../../public/assets/svg/productdetailschat.svg";
import Image from "next/image";
import Button from "@/components/Button";
import Typography from "@/components/Typography";
import { getProductId } from "@/utils/localstorage";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";

const ProductDetails = () => {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
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
  const fetchProduct = async () => {
    const productId = getProductId();
    console.log(productId);
    try {
      const response = await getRequest(`/vendor/products/${productId}`);
      console.log(response);
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
        isFeatured: 0,
        colors: colors,
        // variants: [
        //   {
        //     colors: ["#808080", "#FFFF00"],
        //     size: "M",
        //     quantity: 5,
        //   },
        // ],
        images: response.data.data.images.map((image) => {
          console.log(image);
          return image?.secure_url;
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
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex min-h-[100dvh] bg-gray-400">
          <div className="">
            <SideBar active="Products" />
          </div>
          <div className="w-full">
            <div className="px-4 mt-4">
              <DasboardNavWithOutSearch name="Products" addSearch={false} />
            </div>
            <div className="px-4">
              <div
                className="hidden  lg:flex  items-center gap-2 mb-5 cursor-pointer"
                onClick={() => {
                  router.push("../products");
                }}
              >
                <Image src={arrowLeftIcon} />
                <h2
                  className="font-bold text-[18px] 
          my-4"
                >
                  View Product
                </h2>
              </div>
              <div className="lg:bg-white w-full lg:p-4 lg:rounded-[12px]">
                <div className="bg-gray-300 p-4 rounded-t-[12px] lg:hidden mt-[2rem]">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[700]"
                    textSize="text-[16px]"
                  >
                    Product Info
                  </Typography>
                </div>
                <div className="block lg:flex">
                  <Image
                    height={500}
                    width={500}
                    src={productFormData.images[0]}
                    alt="product image"
                    className="rounded-b-[12px]"
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                  />
                  <div className="w-full p-8">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-[14px] ">MISKAY BOUTIQUE</p>
                      <div className="items-center hidden lg:flex">
                        <p className="text-[12px] leading-[18px] underline font-bold ">
                          View product in main site
                        </p>
                        <Image src={arrowRightIcon} />
                      </div>
                    </div>
                    <h1 className="text-[16px] lg:text-[32px] font-bold my-2">
                      {productFormData.productName}
                    </h1>
                    <h2 className="block lg:hidden font-bold text-[14px] leading-[36px] text-primary lg:text-[#33CC33]">
                      {productFormData.quantity} Quantity
                    </h2>
                    <div className="flex items-center gap-6 my-4">
                      <div className="flex items-center gap-2">
                        <Image src={starIcon} />
                        <span className="font-bold text-[14px] leading-[20px]">
                          4.8
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src={heartIcon} />
                        <span className="font-bold text-[14px] leading-[20px]">
                          200
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src={chatIcon} />
                        <span className="font-bold text-[14px] leading-[20px] mr-1">
                          100
                        </span>
                        <p className="underline font-light text-[12px] leading-[16px] text-[#495057]">
                          Read reviews
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center justify-between w-full mb-[30px]">
                      <h2 className="hidden lg:block font-bold text-[24px] leading-[36px]">
                        {productFormData.productPrice}
                      </h2>
                      <h2 className="font-bold text-[14px] lg:text-[24px] leading-[36px] text-primary lg:text-[#33CC33]">
                        1,000 items delivered
                      </h2>
                    </div>

                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">Category</p>
                      {productFormData.productCategory.map((item) => (
                        <p className="font-bold col-span-2">{item}</p>
                      ))}
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">Tag</p>
                      <p className="font-bold col-span-2">
                        {productFormData.productTag}
                      </p>
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">Available colours</p>

                      <div className="font-bold col-span-2 flex items-center gap-2">
                        {productFormData.colors.map((item) => {
                          console.log(item);
                          return (
                            <div
                              className="w-[20px] h-[20px] rounded-full"
                              style={{
                                backgroundColor: `${item}`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">
                        Available quantity
                      </p>
                      <p className="font-bold col-span-2">
                        {productFormData.productQuantity}
                      </p>
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">Available Sizes</p>
                      <p className="font-bold col-span-2">
                        XS, S, M, L, XL, XXL
                      </p>
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                      <p className="font-light col-span-1">Product type</p>
                      <p className="font-bold col-span-2">
                        {productFormData.productType}
                      </p>
                    </div>
                    <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
