import threeDotIcon from "../../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import OrderStatus from "../../order/OrderStatus";
import Modal from "../../Modal";
const WalletTableItem = ({
  date,
  transactionId,
  transactionType,
  narration,
  amount,
  status,
  viewDetails,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal p-4">{date}</td>
      <td className="text-[12px] font-normal p-4">{transactionId}</td>
      <td className="text-[12px] font-normal p-4">{transactionType}</td>
      <td className="text-[12px] font-normal p-4">{narration}</td>
      <td className="text-[12px] font-normal p-4">{amount}</td>
      <td className="text-[12px] font-normal p-4">
        <OrderStatus
          text="Out for delivery"
          bgColor="bg-[#D4CFCA]"
          color="text-[#3E1C01]"
          addMaxWidth={true}
        />
      </td>

      <td className="text-[12px] font-normal p-4 ">
        <div className="border rounded-[12px] ">
          <OrderStatus
            text="View details"
            color="text-[#3E1C01]"
            addMaxWidth={true}
            clickHandler={viewDetails}
          />
        </div>
      </td>
      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default WalletTableItem;
