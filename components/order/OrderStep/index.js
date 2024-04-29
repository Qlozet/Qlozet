import Typography from "../../Typography";

const OrderStep = ({ step }) => {
  return (
    <div className="">
      <div className="flex">
        <div
          className={`${
            step > 0 ? "bg-primary" : "bg-primary-200"
          }  w-[5px] h-[5rem] `}
        ></div>
        <div
          className={` ${
            step > 0 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-14px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Order placed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            We received your order 1/02/2023 - 13:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div
          className={`${
            step > 1 ? "bg-primary" : "bg-primary-200"
          }  w-[5px] h-[5rem] `}
        ></div>
        <div
          className={` ${
            step > 1 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-18px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Order confirmed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            We confirmed your order 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div
          className={`${
            step > 2 ? "bg-primary" : "bg-primary-200"
          }  w-[5px] h-[5rem] `}
        ></div>
        <div
          className={` ${
            step > 2 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Order processed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            We processed your order 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div
          className={`${
            step > 3 ? "bg-primary" : "bg-primary-200"
          }  w-[5px] h-[5rem] `}
        ></div>
        <div
          className={` ${
            step > 3 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Ready to ship
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            Order ready to ship 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div
          className={`${
            step > 4 ? "bg-primary" : "bg-primary-200"
          }  w-[5px] h-[5rem] `}
        ></div>
        <div
          className={` ${
            step > 4 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Out for delivery
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            Order is out for delivery with dispatch rider 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div
          className={` ${
            step > 5 ? "bg-primary" : "bg-primary-200"
          } w-6 h-6 rounded-[50%] translate-x-[-8.7px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 translate-y-[-10px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-[14px]"
          >
            Order Delivered
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-[12px]"
          >
            Order has been delivered to customer 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      {/* <div className="absolute top-1 w-[5px] h-[96%]  bg-primary-300 translate-x-3 z-20">
        {step === 1 && <div className={`bg-primary w-[5px] h-[17.6%]`}></div>}
        {step === 2 && <div className={`bg-primary w-[5px] h-[25.6%]`}></div>}
        {step === 3 && <div className={`bg-primary w-[5px] h-[44.9%] `}></div>}
        {step === 4 && <div className={`bg-primary w-[5px] h-[64.3%]`}></div>}
        {step === 5 && <div className={`bg-primary w-[5px] h-[83.8%]`}></div>}
        {step === 6 && <div className={`bg-primary w-[5px] h-[100%]`}></div>}
      </div> */}
      {/* <div
        className={`${
          step > 0 ? "bg-primary" : "bg-primary-300"
        } w-7 h-7 rounded-[50%] mb-12`}
      ></div>
      <div
        className={`${
          step > 5 ? "bg-primary" : "bg-primary-300"
        } w-7 h-7 rounded-[50%] mb-12`}
      ></div> */}
    </div>
  );
};

export default OrderStep;
