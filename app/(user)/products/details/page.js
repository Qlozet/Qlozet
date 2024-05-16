"use client";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import arrowLeftIcon from "../../../../public/assets/svg/arrow-left.svg";
import arrowRightIcon from "../../../../public/assets/svg/arrow-right.svg";
import starIcon from "../../../../public/assets/svg/productdetailstar.svg";
import heartIcon from "../../../../public/assets/svg/productdetailsheart.svg";
import chatIcon from "../../../../public/assets/svg/productdetailschat.svg";

import productImage from "../../../../public/assets/image/productimage.png";
import Image from "next/image";
import Button from "@/components/Button";
import Typography from "@/components/Typography";

const ProductDetails = () => {
  return (
    <div className="flex min-h-[100dvh] bg-gray-400">
      <div className="">
        <SideBar active="Products" />
      </div>
      <div className="w-full">
        <DasboardNavWithOutSearch name="Products" addSearch={true} />
        <div className="px-4">
          <div className="hidden  md:flex  items-center gap-2 mb-5">
            <Image src={arrowLeftIcon} />
            <h2
              className="font-bold text-[18px] 
            my-4"
            >
              View Product
            </h2>
          </div>
          <div className="md:bg-white w-full md:p-4 md:rounded-[12px]">
            <div className="bg-gray-300 p-4 rounded-t-[12px] md:hidden mt-[2rem]">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-[16px]"
              >
                Product Info
              </Typography>
            </div>
            <div className="block md:flex">
              <Image
                src={productImage}
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
                  <div className="items-center hidden md:flex">
                    <p className="text-[12px] leading-[18px] underline font-bold ">
                      View product in main site
                    </p>
                    <Image src={arrowRightIcon} />
                  </div>
                </div>
                <h1 className="text-[16px] md:text-[32px] font-bold my-2">
                  Amasi two piece dress
                </h1>
                <h2 className="block md:hidden font-bold text-[14px] leading-[36px] text-primary md:text-[#33CC33]">
                  1,000 items delivered
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

                <div className="hidden md:flex items-center justify-between w-full mb-[30px]">
                  <h2 className="hidden md:block font-bold text-[24px] leading-[36px]">
                    NGN 120,000
                  </h2>
                  <h2 className="font-bold text-[14px] md:text-[24px] leading-[36px] text-primary md:text-[#33CC33]">
                    1,000 items delivered
                  </h2>
                </div>

                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Category</p>
                  <p className="font-bold col-span-2">Two piece</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Tag</p>
                  <p className="font-bold col-span-2">Women</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available colours</p>
                  <div className="font-bold col-span-2 flex items-center gap-2">
                    <div className="w-[20px] h-[20px] rounded-full bg-[#0500FC]" />
                    <div className="w-[20px] h-[20px] rounded-full bg-[#FC2D00]" />
                    <div className="w-[20px] h-[20px] rounded-full bg-[#FCC500]" />
                    <div className="w-[20px] h-[20px] rounded-full bg-[#00FC19]" />
                    <div className="w-[20px] h-[20px] rounded-full bg-[#AB00FC]" />
                    <div className="w-[20px] h-[20px] rounded-full bg-[#FC0079]" />
                  </div>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available quantity</p>
                  <p className="font-bold col-span-2">10</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available Sizes</p>
                  <p className="font-bold col-span-2">XS, S, M, L, XL, XXL</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Product type</p>
                  <p className="font-bold col-span-2">Customisable</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-[12px] leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available discount</p>
                  <p className="font-bold col-span-2">20% off</p>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Button className="text-[14px] leading-[20px]" variant="primary">
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
