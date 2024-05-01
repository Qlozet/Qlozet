import Typography from "../Typography";
import OrderItem from "./components/orderItem";
import rightIcon from "../../public/assets/svg/arrow-primary.svg";
import Image from "next/image";
const RecentOrder = ({ orders }) => {
  return (
    <div className="p-2">
      <div className="flex justify-between my-3">
        <Typography
          textColor="text-black"
          textWeight="font-bold"
          textSize="text-[16px]"
        >
          Recent orders
        </Typography>
        <div className="flex items-center">
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            View all
          </Typography>
          <Image src={rightIcon} alt="" />
        </div>
      </div>
      {orders.map((order) => (
        <OrderItem order={order} key={order.id} />
      ))}
    </div>
  );
};

export default RecentOrder;
