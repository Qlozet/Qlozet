import OrderStatus from "@/components/order/OrderStatus";

const { default: Typography } = require("@/components/Typography");

const CustomerMobileHistory = ({ history, index }) => {
  return (
    <div className="p-4 bg-white" key={index}>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-sm"
          >
            transaction Id
          </Typography>
          <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize=""
          >
            {"12345678"}
          </Typography>
          <Typography
            textColor="text-gray-200"
            textWeight="font-normal"
            textSize="text-sm"
          >
            Amount
          </Typography>
          <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize=""
          >
            {"12345678"}
          </Typography>
        </div>
        <div className="flex flex-col items-end">
          <OrderStatus
            text="Out for delivery"
            bgColor="bg-[#DEF1FF]"
            color="text-[#3893FE]"
            addMaxWidth={true}
          />
          <div className="my-2">
            <Typography
              textColor="text-gray-200"
              textWeight="font-normal"
              textSize="text-sm"
            >
              Product
            </Typography>
          </div>
          <Typography
            textColor="text-dark"
            textWeight="font-normal"
            textSize=""
          >
            12345678910
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default CustomerMobileHistory;
