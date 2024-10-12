import OrderStatus from "../OrderStatus";

const OrderTableItem = ({
  date,
  orderId,
  productName,
  productPrice,
  customerName,
  AmountPaid,
  DeliveryStatus,
  viewDetails,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal p-4 text-dark">{date}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{orderId}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{customerName}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{AmountPaid}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text={DeliveryStatus.name}
          bgColor={DeliveryStatus.bg}
          color={DeliveryStatus.text}
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark ">
        <div className="border rounded-[5px] ">
          <OrderStatus
            text="View details"
            color="text-[#3E1C01]"
            addMaxWidth={true}
            clickHandler={() => {
              viewDetails(orderId);
            }}
          />
        </div>
      </td>
      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default OrderTableItem;
