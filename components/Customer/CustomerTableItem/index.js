import threeDotIcon from "../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import moment from "moment";
import OrderStatus from "../../order/OrderStatus";
import { setCustomerId } from "@/utils/localstorage";
const CustomerTableItem = ({
  picture,
  customerName,
  status,
  totalOrders,
  lastOrderDate,
  phone,
  emailAddress,
  viewDetails,
  customerId,
}) => {
  const date = new Date(lastOrderDate);
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-xs font-normal py-3 px-2 pl-6 text-dark min-h-[5rem]">
        <Image
          src={picture}
          width={30}
          height={30}
          style={{
            width: "2rem",
            height: "auto",
          }}
          alt=""
        />
      </td>
      <td className="text-xs font-normal py-3 px-2 text-dark ">{customerName}</td>
      {/* <td className="text-xs font-normal py-3 px-2 text-dark">{emailAddress}</td>
      <td className="text-xs font-normal py-3 px-2 text-dark">{phone}</td> */}
      <td className="text-xs font-normal py-3 px-2 text-dark">{totalOrders}</td>
      <td className="text-xs font-normal py-3 px-2 text-dark">
        {moment(date).format("DD/MM/YYYY")}
      </td>
      <td className="text-xs font-normal py-3 px-2 text-dark">
        <OrderStatus
          text={status.text}
          bgColor={status.bgColor}
          color={status.color}
          addMaxWidth={true}
        />
      </td>

      <td className="text-xs font-normal py-3 px-2 text-dark  flex items-center justify-end">
        <div className="border rounded-[12px] max-w-[6rem]">
          <OrderStatus
            text="View details"
            color="text-[#3E1C01]"
            addMaxWidth={true}
            clickHandler={() => {
              setCustomerId(customerId);
              viewDetails(customerId);
            }}
          />
        </div>
      </td>
      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default CustomerTableItem;
