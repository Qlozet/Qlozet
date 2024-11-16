import Typography from "../../Typography";

const OrderStep = ({ step }) => {
  return (
    <div className="">
      <div className="flex">
        <div
          className={`${step > 0 ? "bg-primary" : "bg-primary-200"
            }  w-[5px] h-[5rem] `}
        ></div>
        <div>
          {" "}
          <div
            className={` ${step > 0 ? "bg-primary" : "bg-primary-200"
              } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
          ></div>
        </div>

        <div className="px-3 py-2 translate-y-[-14px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Order placed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            We received your order 1/02/2023 - 13:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div>
          <div
            className={`${step > 1 ? "bg-primary" : "bg-primary-200"
              }  w-[5px] h-[5rem] `}
          ></div>
        </div>
        <div>
          <div
            className={` ${step > 1 ? "bg-primary" : "bg-primary-200"
              } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
          ></div>
        </div>
        <div className="px-3 py-2 translate-y-[-18px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Order confirmed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            We confirmed your order 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div>
          <div
            className={`${step > 2 ? "bg-primary" : "bg-primary-200"
              }  w-[5px] h-[5rem] `}
          ></div>
        </div>
        <div
          className={` ${step > 2 ? "bg-primary" : "bg-primary-200"
            } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Order processed
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            We processed your order 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div>
          <div
            className={`${step > 3 ? "bg-primary" : "bg-primary-200"
              }  w-[5px] h-[5rem] `}
          ></div>
        </div>
        <div
          className={` ${step > 3 ? "bg-primary" : "bg-primary-200"
            } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
        ></div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Ready to ship
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            Order ready to ship 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div>
          {" "}
          <div
            className={`${step > 4 ? "bg-primary" : "bg-primary-200"
              }  w-[5px] h-[5rem] `}
          ></div>
        </div>
        <div>
          <div
            className={` ${step > 4 ? "bg-primary" : "bg-primary-200"
              } w-6 h-6 rounded-[50%] translate-x-[-14.5px] translate-y-[-2px]`}
          ></div>
        </div>
        <div className="px-3 py-2 translate-y-[-20px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Out for delivery
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            Order is out for delivery with dispatch rider 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
      <div className="flex">
        <div>
          <div
            className={` ${step > 5 ? "bg-primary" : "bg-primary-200"
              } w-6 h-6 rounded-[50%] translate-x-[-9.7px] translate-y-[-2px]`}
          ></div>
        </div>
        <div className="px-3 translate-y-[-10px]">
          <Typography
            textColor="text-black"
            textWeight="font-[700]"
            textSize="text-sm"
          >
            Order Delivered
          </Typography>
          <Typography
            textColor="text-black"
            textWeight="font-normal"
            textSize="text-xs"
          >
            Order has been delivered to customer 1/02/2023 - 14:50am
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default OrderStep;
