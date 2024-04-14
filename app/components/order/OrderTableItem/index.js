import threeDotIcon from "../../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import OrderStatus from "../OrderStatus";
const OrderTableItem = ({
  date,
  orderId,
  productName,
  productPrice,
  CustomerName,
  AmountPaid,
  DeliveryStatus,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[14px] font-normal p-4">{date}</td>
      <td className="text-[14px] font-normal p-4">{orderId}</td>
      <td className="text-[14px] font-normal p-4">{productName}</td>
      <td className="text-[14px] font-normal p-4">{productPrice}</td>
      <td className="text-[14px] font-normal p-4">{CustomerName}</td>
      <td className="text-[14px] font-normal p-4">{AmountPaid}</td>
      <td className="text-[14px] font-normal p-4">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#D4CFCA]"
          color="text-[#3E1C01]"
        />
      </td>

      <td className="text-[14px] font-normal p-4">
        <div className="border">
          <OrderStatus text="View details" color="text-[#495057]" />
        </div>
      </td>
      <td className="text-[14px] font-normal p-4">
        <Image src={threeDotIcon} />
      </td>
    </tr>
  );
};

export default OrderTableItem;
