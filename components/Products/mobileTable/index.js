import { useState } from "react";
import moreIcon from "../../../public/assets/svg/more.svg";
import Image from "next/image";
import ProductItemDropDown from "../ProductItemDropDown";
import Typography from "@/components/Typography";
import Quantity from "../Quantity";
import OrderStatus from "@/components/order/OrderStatus";
import { setProductId } from "@/utils/localstorage";
import { useRouter } from "next/navigation";

const MobileTable = ({
  id,
  picture,
  productName,
  productPrice,
  category,
  productType,
  tag,
  quiantity,
  ProductStatus,
  handleSelect,
  variantCount,
}) => {
  const router = useRouter();
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <div className="bg-white relative">
      <div>
        <div className="flex items-center justify-between py-6  ">
          <div className="flex justify-between w-full">
            <Image
              width={500}
              height={500}
              src={picture}
              style={{ width: "5rem", height: "auto" }}
              alt=""
              unoptimized
              className="min-w-[6rem] h-[auto] ml-4 max-w-[8rem] border-gray-200 border-[1.5px] border-solid rounded-lg"
            />
            <div
              className="w-[1.5rem] h-[1.5rem]"
              onClick={() => {
                setShowDropDown(true);
              }}
            >
              <Image
                src={moreIcon}
                alt=""
                className="cursor-pointer mr-4 w-[1.5rem] h-[1.5rem]"
                width={5}
              />
            </div>
          </div>

          <div>
            {showDropDown && (
              <div
                className="absolute right-[0rem] top-[1rem]"
                style={{ zIndex: 10 }}
              >
                <ProductItemDropDown
                  handleSelect={(item) => {
                    handleSelect(item);
                    setShowDropDown(false);
                    setProductId(id);
                  }}
                  data={[
                    "View product",
                    "Edit product",
                    "Feature product",
                    "Activate product",
                    "Schedule activation",
                    "Deactivate product",
                    "Delete product",
                  ]}
                />
              </div>
            )}
          </div>
        </div>
        <div className="border-solid border-b-[2px] border-gray-300">
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col gap-1 mt-2">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-[12px]"
              >
                Product
              </Typography>
              <Typography
                textColor="text-dark"
                textWeight="font-normal"
                textSize="text-[14px]"
              >
                {productName}
              </Typography>
            </div>
            <div className="flex flex-col gap-1 mt-2 items-end">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-[12px]"
              >
                Category
              </Typography>
              <Typography
                textColor="text-dark"
                textWeight="font-normal"
                textSize="text-[14px]"
              >
                {category}
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-1 mt-2">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-[12px]"
              >
                Quantity
              </Typography>
              <Quantity variant={variantCount} quantity={quiantity} />
            </div>
            <div className="flex flex-col gap-1 mt-2 items-end justify-center">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-[12px]"
              >
                Status
              </Typography>
              <OrderStatus
                text={ProductStatus.text}
                bgColor={ProductStatus.bgColor}
                color={ProductStatus.color}
                addMaxWidth={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTable;
