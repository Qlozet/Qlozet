import { useState, useRef } from "react";
import threeDotIcon from "../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import OrderStatus from "@/components/order/OrderStatus";
import Modal from "../../Modal";
import defaultImage from "../../../public/assets/image/default.png";
import dottedIcon from "../../../public/assets/svg/carbon_overflow-menu-horizontal.svg";
import Quantity from "../Quantity";
import DeleteProduct from "../Delete";
import DropDown from "@/components/DropDown";
import ProductItemDropDown from "../ProductItemDropDown";
import { setProductId } from "@/utils/localstorage";

const ProductTableItem = ({
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
  console.log(variantCount, quiantity);
  const dropDownButtonRef = useRef();
  const [showDropDown, setShowDropDown] = useState(false);
  const closeDropDown = (item) => {
    setProductId(id);
    setShowDropDown(false);
    handleSelect(item);
  };

  document.addEventListener("click", (e) => {
    if (showDropDown) {
      setShowDropDown(false);
    } else if (e.target === dropDownButtonRef.current) {
      setShowDropDown(true);
    }
  });
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white ">
      <td className="text-[12px] font-normal py-4 text-dark">
        <Image
          width={500}
          height={500}
          src={picture}
          style={{ width: "5rem", height: "auto" }}
          alt=""
          className="w-[2rem] h-[auto]  border-gray-200 border-[1.5px] border-solid rounded-sm"
          unoptimized
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{productName}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productPrice}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{category}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productType}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{tag}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <Quantity quantity={quiantity} variant={variantCount} />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text={ProductStatus.text}
          bgColor={ProductStatus.bgColor}
          color={ProductStatus.color}
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark relative">
        <div className="flex items-center justify-center">
          <Image
            ref={dropDownButtonRef}
            alt="Product Image"
            src={dottedIcon}
            onClick={() => {
              setShowDropDown(true);
            }}
            className="cursor-pointer"
          />
          {showDropDown && (
            <ProductItemDropDown
              handleSelect={(item) => {
                closeDropDown(item);
              }}
              data={[
                "View product",
                "Edit product",
                // "Feature product",
                "Activate product",
                "Schedule activation",
                "Deactivate product",
                "Delete product",
              ]}
              showContainer={showDropDown}
              outSideCLicked={() => {
                setShowDropDown(false);
              }}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductTableItem;
