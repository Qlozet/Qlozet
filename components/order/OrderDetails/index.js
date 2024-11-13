import OrderDetailNav from "../OrderdetailsNav";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../OrderStatus";
import Button from "../../Button";
import classes from "./index.module.css";
const OrderDetails = ({ topNavData, closeModal, order }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 mb-3">
      <div className="px-5 "></div>
      <OrderDetailNav
        active="Order details"
        data={topNavData}
        closeModal={closeModal}
      />
      <div className={` w-full lg:w-[40%] bg-white p-4 rounded-b-[14px]`}>
        <div className={`${classes.scroll_container} flex gap-4 items-center`}>
          {order.orderItems.map((item) => {
            return (
              <div className="min-w-[10rem]">
                <div>
                  <div className="bg-auto bg-no-contain">
                    <Image
                      alt="Product Image"
                      src={item.picture}
                      width={30}
                      height={30}
                      style={{
                        width: "10rem",
                        height: "auto",
                      }}
                      unoptimized
                      className="rounded-[6px]"
                    />
                  </div>
                  <div className="my-2">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[700]"
                      textSize="text-[14px]"
                    >
                      {item.name}
                    </Typography>
                  </div>
                  <div className="max-w-[13rem] my-2">
                    <OrderStatus
                      text="View customization details"
                      color="text-[#3E1C01]"
                      // addMaxWidth={true}
                      bgColor="bg-[#D4CFCA]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* <div className="flex justify-between items-center py-4">
          <div>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Ship Order
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Toggle button to set order as ready to ship
            </Typography>
          </div>
          <div></div>
        </div> */}

        <div className="mt-8">
          <div className="flex items-center justify-between py-3 gap-10 border-t-[.5px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              {" "}
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Order date:
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-xs"
              >
                {order.date}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Order ID:
              </Typography>
            </div>
            <div className="flex-1">
              {" "}
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-xs"
              >
                {order.orderId}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Preferred outfit measurement
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-xs"
              >
                {order.orderId}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              {" "}
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Preferred color
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-xs"
              >
                {order.orderId}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              {" "}
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Customer’s name:
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-xs"
              >
                {order.customerName}
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
          <div className="w-[35%]">
            {" "}
            <Typography
              textColor="text-dark"
              textWeight="font-[400]"
              textSize="text-xs"
            >
              Customer’s address:
            </Typography>
          </div>
          <div className="flex-1">
            <Typography
              textColor="text-dark"
              textWeight="font-[700]"
              textSize="text-xs"
            >
              {order.shippingAddress}
            </Typography>
          </div>
        </div>
        <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
          <div className="w-[35%]">
            <Typography
              textColor="text-dark"
              textWeight="font-[400]"
              textSize="text-xs"
            >
              Shipping address{" "}
            </Typography>
          </div>
          <div className="flex-1">
            <Typography
              textColor="text-dark"
              textWeight="font-[700]"
              textSize="text-xs"
            >
              {order.shippingAddress}
            </Typography>
          </div>
        </div>
        <div className="flex items-center py-3 gap-10 border-t-[0.5px] border-solid border-gray-200 ">
          <div className="w-[35%]">
            <Typography
              textColor="text-dark"
              textWeight="font-[400]"
              textSize="text-xs"
            >
              Customer’s phone number
            </Typography>
          </div>
          <div className="flex-1">
            <Typography
              textColor="text-dark"
              textWeight="font-[700]"
              textSize="text-xs"
            >
              {order.customerPhoneNumber}
            </Typography>
          </div>
        </div>

        <div className="flex justify-end items-center gap-5  ">
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Reject Order"
              btnSize="large"
              variant="outline"
              clickHandler={() => { }}
              maxWidth="max-w-[14rem]"
            />
          </div>
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Confirm order "
              btnSize="large"
              variant="primary"
              clickHandler={() => { }}
              maxWidth="max-w-[14rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
