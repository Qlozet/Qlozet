import Typography from "@/components/Typography";
import "./index.module.css";

const OrderItem = ({ order }) => {
  return (
    <div className="flex bg-gray-400 items-center my-4 rounded-[12px] justify-between">
      <div className="p-5 mb-2 flex rounded-md items-end w-[80%]">
        <div className="flex flex-col w-[70%]">
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            {order.product}
          </Typography>
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            {order.name}
          </Typography>
        </div>
        <div className="flex flex-col w-[30%]">
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            N{order.price}
          </Typography>
          <Typography
            textColor="text-primary"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            {order.date}
          </Typography>
        </div>
      </div>
      <div className="w-[20%] flex items-end py-5">
        <div className="bg-gray-300 rounded-[15px] px-[7px] justify-end">
          <button className="text-[12px]">More</button>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
