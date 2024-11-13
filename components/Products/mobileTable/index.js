import { useEffect, useRef, useState } from "react";
import moreIcon from "../../../public/assets/svg/more.svg";
import Image from "next/image";
import ProductItemDropDown from "../ProductItemDropDown";
import Typography from "@/components/Typography";
import Quantity from "../Quantity";
import OrderStatus from "@/components/order/OrderStatus";
import { setProductId } from "@/utils/localstorage";

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
  const dropDownRef = useRef()
  const [showDropDown, setShowDropDown] = useState(false);
  const [positionTop, setPositionTop] = useState(false)
  const calculatePosition = () => {
    if (dropDownRef.current) {
      const { height } = dropDownRef.current.getBoundingClientRect()
      window.addEventListener("click", (e) => {
        if ((window.innerHeight - e.clientY) > height) {
          setPositionTop(true)
        } else {
          setPositionTop(false)
        }
      })
    }
  }
  useEffect(() => { calculatePosition() }, [])
  document.addEventListener("click", (e) => {
    if (showDropDown) {
      setShowDropDown(false);
    } else if (e.target === dropDownRef.current) {
      setShowDropDown(true);
    }
  });

  return (
    <div className="bg-white relative">
      <div>
        <div className="flex items-center justify-between py-6  ">
          <div className="flex justify-between w-full">
            <div className="ml-4 w-[66px] h-[64px] border-[1px] border-solid border-gray-200 rounded-lg " style={{ backgroundImage: `url(${picture})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}></div>
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
                ref={dropDownRef}
                className={`absolute right-[0rem] ${positionTop ? "top-0" : "bottom-0"}`}
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
                textSize="text-xs"
              >
                Product
              </Typography>
              <p className="overflow-hidden text-ellipsis pr-4 whitespace-nowrap max-w-[117px] text-dark text-[14px]">
                {productName}
              </p>
            </div>
            <div className="flex flex-col gap-1 mt-2 items-end">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-xs"
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
                textSize="text-xs"
              >
                Quantity
              </Typography>
              <Quantity variant={variantCount} quantity={quiantity} />
            </div>
            <div className="flex flex-col gap-1 mt-2 items-end justify-center">
              <Typography
                textColor="text-gray-100"
                textWeight="font-normal"
                textSize="text-xs"
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
