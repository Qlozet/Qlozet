import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import OrderStatus from "@/components/order/OrderStatus";
import dottedIcon from "../../../public/assets/svg/carbon_overflow-menu-horizontal.svg";
import Quantity from "../Quantity";
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
  const buttonRef = useRef()
  const [showDropDown, setShowDropDown] = useState(false);
  const closeDropDown = (item) => {
    setProductId(id);
    setShowDropDown(false);
    handleSelect(item);
  };

  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setShowDropDown(false);
    }
  };

  window.addEventListener("scroll", () => {
    setShowDropDown(false)
  })

  useEffect(() => {
    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  return (
    <tr className="border-b-[1px] border-solid border-gray-300 bg-white ">
      <td className="text-xs font-normal py-4 text-dark pl-4">
        <div className="w-[51px] h-[37px] border-[1px] border-solid border-gray-200 rounded-lg " style={{ backgroundImage: `url(${picture})`, backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat" }}></div>
      </td>
      <td className="text-xs font-normal py-4 px-2 text-dark overflow-hidden text-ellipsis pr-4 whitespace-nowrap max-w-[117px]">{productName}</td>
      <td className="text-xs font-normal py-4 px-2 text-dark">{productPrice}</td>
      <td className="text-xs font-normal py-4 px-2 text-dark">{category}</td>
      <td className="text-xs font-normal py-4 px-2 text-dark">{productType}</td>
      <td className="text-xs font-normal py-4 px-2 text-dark">{tag}</td>
      <td className="text-xs font-normal py-4 px-2 text-dark">
        <Quantity quantity={quiantity} variant={variantCount} />
      </td>
      <td className="text-xs font-normal py-4 px-2 text-dark">
        <OrderStatus
          text={ProductStatus.text}
          bgColor={ProductStatus.bgColor}
          color={ProductStatus.color}
          addMaxWidth={true}
        />
      </td>
      <td className="text-xs font-normal py-4 px-2 text-dark relative">
        <div className="flex items-center justify-center">
          <Image ref={buttonRef}
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
