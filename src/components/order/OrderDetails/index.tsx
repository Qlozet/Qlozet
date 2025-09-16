import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import OrderDetailNav from "../OrderdetailsNav";
import Typography from "../../Typography";
import Button from "../../Button";
import CustomerDetails from "../CustomerDetails";
import TrackOrder from "../TrackOrders";

interface OrderItem {
  picture: string;
  name: string;
  // Add other order item properties as needed
}

interface OrderData {
  orderItems: OrderItem[];
  date: string;
  orderId: string;
  customerName: string;
  shippingAddress: string;
  customerPhoneNumber: string;
  // Add other order properties as needed
}

interface OrderDetailsProps {
  show: boolean;
  closeModal: () => void;
  order: OrderData;
}

interface NavItem {
  item: string;
  link: string;
  handleFunction: (data: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ show, closeModal, order }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("Order details");

  const topNavData: NavItem[] = [
    { item: "Order details", link: "", handleFunction: (data) => setActive(data) },
    { item: "Track order", link: "", handleFunction: (data) => setActive(data) },
    { item: "Customer details", link: "", handleFunction: (data) => setActive(data) },
  ];

  const mobileTopNav: NavItem[] = [
    { item: "Details", link: "", handleFunction: (data) => setActive(data) },
    { item: "Track", link: "", handleFunction: (data) => setActive(data) },
    { item: "Customer", link: "", handleFunction: (data) => setActive(data) },
  ];

  const handleClickOutside = (e: MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [show, closeModal]);

  return (
    <div className="flex flex-col items-center justify-center lg:items-end w-full  ">
      <motion.div
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.1, ease: "linear" }}
        ref={contentRef}
      >
        <div className="hidden lg:block ">
          <OrderDetailNav
            active={active}
            data={topNavData}
            closeModal={closeModal}
            width={"w-full lg:w-[618px]"}
          />
        </div>
        <div className="block lg:hidden ">
          <OrderDetailNav
            active={active}
            data={mobileTopNav}
            closeModal={closeModal}
            width={"w-full"}
          />
        </div>
        <div className="w-full lg:w-[618px] bg-white px-4 pb-4 rounded-b-[14px] overflow-y-scroll h-screen">
          {active === "Order details" && (
            <div>
              <div className="custom-product-scrollbar overflow-x-scroll flex gap-4 items-center">
                {order.orderItems.map((item, index) => (
                  <div className="min-w-[10rem]" key={index}>
                    <div>
                      <div
                        className="w-[12rem] h-[10rem] border-[1px] border-solid border-gray-200 rounded-lg "
                        style={{
                          backgroundImage: `url(${item.picture})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                        }}
                      ></div>
                    </div>
                    <div className="my-2">
                      <Typography
                        textColor="text-dark"
                        textWeight="font-[700]"
                        textSize="text-sm"
                      >
                        {item.name}
                      </Typography>
                    </div>
                    <div className="mt-1 ">
                      <div className="w-[200px] flex items-center justify-center px-4 py-2 rounded-md text-primary  text-xs bg-[#D4CFCA]">View customization details</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between py-3 gap-10 border-t-[.5px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
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
                    Shipping address
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
                    clickHandler={() => {}}
                    maxWidth="max-w-[14rem]"
                  />
                </div>
                <div className="mt-10 flex items-center justify-end">
                  <Button
                    children="Confirm order "
                    btnSize="large"
                    variant="primary"
                    clickHandler={() => {}}
                    maxWidth="max-w-[14rem]"
                  />
                </div>
              </div>
            </div>
          )}
          {active === "Customer details" && <CustomerDetails customer={order} topNavData={topNavData} closeModal={closeModal} />}
          {active === "Track order" && <TrackOrder data={topNavData} closeModal={closeModal} />}
        </div>
      </motion.div>
    </div>
  );
};
export default OrderDetails;