import { useState } from "react";
import threeDotIcon from "../../../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import OrderStatus from "../../../order/OrderStatus";
import Modal from "../../../Modal";
import DropDown from "../../../DropDown";
import DropDownComponent from "../../../DropDownComponent";
const WarehouseTableItem = ({
  warehouseName,
  vendorName,
  warehouseAddress,
  contactName,
  PhoneNumber,
  Email,
  Status,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const selectDropDownHandler = (option) => {
    console.log(option);
    setShowDropDown(false);
  };

  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-[400] p-4  text-dark">{warehouseName}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">{vendorName}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">{warehouseAddress}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">{contactName}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">{PhoneNumber}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">{Email}</td>
      <td className="text-[12px] font-[400] p-4  text-dark">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#FFF7DE]"
          color="text-[#FFB020]"
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-[400] p-4  text-dark relative">
        <div
          className="cursor-pointer"
          onClick={() => {
            setShowDropDown(true);
          }}
        >
          <Image src={threeDotIcon} alt="" />
        </div>
        {showDropDown && (
          <div className="absolute top-1 right-1">
            <DropDownComponent
              dropdownTitle="Warehouse menu"
              width="w-[15rem]"
              data={["Set as alternate warehouse", "Set as default warehouse"]}
              clickHandler={selectDropDownHandler}
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export default WarehouseTableItem;
