
import OrderStatus from "../../order/OrderStatus";
import moment from "moment";
const WalletTableItem = ({
  id,
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
      <td className="text-[12px] font-normal p-4 text-dark pl-6">
        {moment(date).format("YYYY-MM-DD")}
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{transactionId}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        {transactionType}
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{narration}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{amount}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text={status.text}
          bgColor={status.bgColor}
          color={status.color}
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark flex items-center justify-end" >
        <div className="border rounded-[5px] max-w-[91px] ">
          <OrderStatus
            text="View details"
            color="text-[#3E1C01]"
            addMaxWidth={true}
            clickHandler={() => {
              viewDetails(transactionId);
            }}
          />
        </div>
      </td>

    </tr>
  );
};

export default WalletTableItem;
