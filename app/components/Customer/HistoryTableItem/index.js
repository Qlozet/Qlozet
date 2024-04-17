import Image from "next/image";
import OrderStatus from "../../order/OrderStatus";
const HistoryTableItem = ({
  date,
  productName,
  productPrice,
  AmountPaid,
  DeliveryStatus,
  modal,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal p-4">{date}</td>
      <td className="text-[12px] font-normal p-4">{productName}</td>
      <td className="text-[12px] font-normal p-4">{productPrice}</td>
      <td className="text-[12px] font-normal p-4">{AmountPaid}</td>
      <td className="text-[12px] font-normal p-4">{AmountPaid}</td>
      <td className="text-[12px] font-normal p-4">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#D4CFCA]"
          color="text-[#3E1C01]"
          addMaxWidth={true}
          clickHandler={modal}
        />
      </td>
    </tr>
  );
};

export default HistoryTableItem;
