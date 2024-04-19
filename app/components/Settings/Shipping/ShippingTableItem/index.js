import { useState } from "react";
import Image from "next/image";
import OrderStatus from "@/app/components/order/OrderStatus";
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

  const selectDropDownHandler = (option) => {
    console.log(option);
    setShowDropDown(false);
  };

  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-[400] p-4">{Name}</td>
      <td className="text-[12px] font-[400] p-4">{Address}</td>
      <td className="text-[12px] font-[400] p-4">{PhoneNumber}</td>
      <td className="text-[12px] font-[400] p-4">{emailAddress}</td>
      <td className="text-[12px] font-[400] p-4">{noOfDeliveries}</td>
      <td className="text-[12px] font-[400] p-4">{adminName}</td>
      <td className="text-[12px] font-[400] p-4">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#FFF7DE]"
          color="text-[#FFB020]"
          addMaxWidth={true}
        />
      </td>
      {/* <td className="text-[12px] font-[400] p-4 relative">
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
