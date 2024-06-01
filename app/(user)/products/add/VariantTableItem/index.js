import OrderStatus from "@/components/order/OrderStatus";
import AddQuantity from "../Quantity";
import AvailableSize from "../AvailableSize";
import Variant from "../Variant";
import Image from "next/image";
import icon from "../../../../../public/assets/svg/image-frame.svg";
import checkboxIcon from "../../../../../public/assets/svg/checkbox-gray.svg";
import trashGray from "../../../../../public/assets/svg/trash-gray.svg";
const VariantTableItem = ({
  date,
  transactionId,
  transactionType,
  narration,
  amount,
  status,
  viewDetails,
  QuantityHandler,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <Variant bg="red" />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <AddQuantity QuantityHandler={QuantityHandler} />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <AvailableSize />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <div className="flex items-center gap-3">
          <Image src={icon} alt="" className="w-[2.5rem]" />
          <Image src={icon} alt="" className="w-[2.5rem]" />
          <Image src={icon} alt="" className="w-[2.5rem]" />
          <Image src={icon} alt="" className="w-[2.5rem]" />
          <Image src={icon} alt="" className="w-[2.5rem]" />
        </div>
      </td>
      <td className="text-[12px] font-normal px-1  text-dark  border-solid border-r-[1px] border-gray-300">
        <div className="flex w-[100%] justify-between px-4">
          <div>
            <Image src={checkboxIcon} alt="" />
          </div>
        </div>
      </td>
      <td className="text-[12px] font-normal px-1  text-dark  border-solid border-r-[1px] border-gray-300">
        <div className="flex w-[100%] justify-between px-4">
          <div>
            <Image src={trashGray} alt="" />
          </div>
        </div>
      </td>

      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default VariantTableItem;
