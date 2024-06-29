import { useState } from "react";
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
}) => {
  console.log(productType);
  const [showDropDown, setShowDropDown] = useState(false);
  const closeDropDown = (item) => {
    setProductId(id);
    setShowDropDown(false);
    handleSelect(item);
  };
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white relative">
      <td className="text-[12px] font-normal p-4 text-dark">
        <Image
          width={500}
          height={500}
          src={picture}
          style={{ width: "5rem", height: "auto" }}
          alt=""
          className="w-[2rem] h-[auto]"
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{productName}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productPrice}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{category}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productType}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{tag}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <Quantity />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text={ProductStatus.text}
          bgColor={ProductStatus.bgColor}
          color={ProductStatus.color}
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <div className="flex items-center justify-center">
          <Image
            alt="Product Image"
            src={dottedIcon}
            onClick={() => {
              setShowDropDown(true);
            }}
            className="cursor-pointer"
          />
          {showDropDown && (
            <div
              className="absolute right-[6rem] top-[50%] "
              style={{ zIndex: 10 }}
            >
              <ProductItemDropDown
                handleSelect={(item) => {
                  closeDropDown(item);
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
      </td>
    </tr>
  );
};

export default ProductTableItem;
