import threeDotIcon from "../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import moment from "moment";
import OrderStatus from "../../order/OrderStatus";
const CustomerTableItem = ({
  picture,
  customerName,
  status,
  totalOrders,
  lastOrderDate,
  phone,
  emailAddress,
  viewDetails,
}) => {
  const date = new Date(lastOrderDate);
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal p-4 text-dark ">{picture}</td>
      <td className="text-[12px] font-normal p-4 text-dark ">{customerName}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{emailAddress}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{phone}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{totalOrders}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        {moment(date).format("DD/MM/YYYY")}
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text="Active"
          bgColor="bg-success-300"
          color="bg-success"
          addMaxWidth={true}
        />
      </td>

      <td className="text-[12px] font-normal p-4 text-dark ">
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

export default CustomerTableItem;
