import Typography from "@/components/Typography";
import OrderStatus from "../OrderStatus";

const MobileTableItem = ({ item }) => {
  return (
    <div className="">
      <div className="flex justify-between items-center bg-white p-4">
        <div className="flex flex-col gap-1">
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            Ref ID
          </Typography>
          <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize="text-[16px]"
          >
            {item.orderId}
          </Typography>
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-[14px]"
          >
            Amount
          </Typography>
          <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize="text-[16px]"
          >
            {item.AmountPaid}
          </Typography>
        </div>
        <div className="flex flex-col items-end">
          <OrderStatus
            text={item.DeliveryStatus.name}
            bgColor={item.DeliveryStatus.bg}
            color={item.DeliveryStatus.text}
            addMaxWidth={true}
          />
          <div className="my-2">
            <Typography
              textColor="text-gray-200"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Product
            </Typography>
          </div>
          {/* <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize="text-[16px]"
          > */}
          <p className="overflow-hidden text-ellipsis  whitespace-nowrap max-w-[200px] "> {item.productName}</p>

          {/* </Typography> */}
        </div>
      </div>
    </div>
  );
};

export default MobileTableItem;
