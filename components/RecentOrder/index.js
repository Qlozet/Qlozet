import Typography from "../Typography";
import OrderItem from "./components/orderItem";
import rightIcon from "../../public/assets/svg/arrow-primary.svg";
import Image from "next/image";
import moment from "moment";
import { useRouter } from "next/navigation";
const RecentOrder = ({ orders }) => {
  const navigate = useRouter();
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
        <div
          className="flex items-center"
          onClick={() => {
            navigate.push("orders");
          }}
        >
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-sm"
          >
            View all
          </Typography>
          <Image src={rightIcon} alt="" />
        </div>
      </div>
      {orders &&
        orders
          .slice(0, 3)
          .map((order, key) => <OrderItem order={order} key={key} />)}
    </div>
  );
};

export default RecentOrder;
