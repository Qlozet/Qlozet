import { useState } from "react";
import Image from "next/image";
import OrderStatus from "@/components/order/OrderStatus";
const ShippingTableItem = ({
  Name,
  Address,
  PhoneNumber,
  emailAddress,
  noOfDeliveries,
  adminName,
  Status,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);


  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-xs font-[400] p-4  text-dark">{Name}</td>
      <td className="text-xs font-[400] p-4  text-dark">{Address}</td>
      <td className="text-xs font-[400] p-4  text-dark">{PhoneNumber}</td>
      <td className="text-xs font-[400] p-4  text-dark">{emailAddress}</td>
      <td className="text-xs font-[400] p-4  text-dark">{noOfDeliveries}</td>
      <td className="text-xs font-[400] p-4  text-dark">{adminName}</td>
      <td className="text-xs font-[400] p-4  text-dark">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#FFF7DE]"
          color="text-[#FFB020]"
          addMaxWidth={true}
        />
      </td>
      {/* <td className="text-xs font-[400] p-4  text-dark relative">
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
      </td> */}
    </tr>
  );
};

export default ShippingTableItem;
