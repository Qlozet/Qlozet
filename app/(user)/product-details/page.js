"use client";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import arrowLeftIcon from "../../../public/assets/svg/arrow-left.svg";
import arrowRightIcon from "../../../public/assets/svg/arrow-right.svg";
import starIcon from "../../../public/assets/svg/productdetailstar.svg";

import arrowRIcon from "../../../public/assets/svg/arrowright.svg";
import heartIcon from "../../../public/assets/svg/productdetailsheart.svg";
import chatIcon from "../../../public/assets/svg/productdetailschat.svg";
import productImage from "../../../public/assets/image/productimage.png";
import Image from "next/image";
import Button from "@/components/Button";

const ProductDetails = () => {
  return (
    <div className="flex min-h-[100dvh] bg-[#F8F9FA] ml-[260px]">
      <div className="">
        <SideBar active="Products" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch name="Products" addSearch={true} />
        <div className="px-4">
          <div className="flex items-center gap-4 mb-5">
            <Image src={arrowLeftIcon} />
            <h2 className="font-bold text-[18px] leading-[27px]">
              View Product
            </h2>
          </div>
          <div className="bg-white p-6 w-full">
            <div className="flex gap-8">


              <Image
                src={productImage}
                alt="product image"
                className="rounded-xl"
                style={{
                  width: "438px",
                  height: "550px",
                }}


              />
              {/* <div className="w-[438px] h-[550px] border-[1px] border-solid border-gray-200 rounded-lg " style={{ backgroundImage: `url(${picture})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}></div> */}

              <div className="w-full text-[#3E1C01]">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm leading-[20px]">MISKAY BOUTIQUE</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs leading-[18px] underline font-bold">
                      View product in main site
                    </p>
                    <Image src={arrowRIcon} />
                  </div>
                </div>
                <h1 className="text-[42px] leading-[63px] font-bold mb-4">
                  Amasi two piece dress
                </h1>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Image src={starIcon} />
                    <span className="font-bold text-sm leading-[20px]">
                      4.8
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image src={heartIcon} />
                    <span className="font-bold text-sm leading-[20px]">
                      200
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image src={chatIcon} />
                    <span className="font-bold text-sm leading-[20px] mr-1">
                      100
                    </span>
                    <p className="underline font-light text-xs leading-[16px] text-[#495057]">
                      Read reviews
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mb-[30px]">
                  <h2 className="font-bold text-[24px] leading-[36px]">
                    NGN 120,000
                  </h2>
                  <h2 className="font-bold text-[18px] leading-[27px] text-[#33CC33]">
                    1,000 items delivered
                  </h2>
                </div>

                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Category</p>
                  <p className="font-bold col-span-2">Two piece</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Tag</p>
                  <p className="font-bold col-span-2">Women</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
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
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available quantity</p>
                  <p className="font-bold col-span-2">10</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available Sizes</p>
                  <p className="font-bold col-span-2">XS, S, M, L, XL, XXL</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Product type</p>
                  <p className="font-bold col-span-2">Customisable</p>
                </div>
                <div className="w-full grid grid-cols-3 border-t-[0.5px] border-[#DDE2E5] text-[#121212] text-xs leading-[18px] py-[18px]">
                  <p className="font-light col-span-1">Available discount</p>
                  <p className="font-bold col-span-2">20% off</p>
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Button className="text-sm leading-[20px]" variant="primary">
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
