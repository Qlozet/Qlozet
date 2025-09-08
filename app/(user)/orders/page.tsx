"use client";
import { useEffect, useState } from "react";
import moment from "moment";

// Svg imports starts
import DashboardTopCard from "@/components/DashboardTopCard";
import sendIcon from "../../../public/assets/svg/send.svg";
import carIcon from "../../../public/assets/svg/car.svg";
import TotalOrderIcon from "../../../public/assets/svg/TotalOrder-Icon.svg";
import shippingIcon from "../../../public/assets/svg/shipping_bag.svg";

import OrderTable from "@/components/order/OrderTable";
import Modal from "@/components/Modal";
import SetTotalOrderPerDay from "@/components/SetTotalItemPerDayForm";
import OrderDetails from "@/components/order/OrderDetails";
import TrackOrder from "@/components/order/TrackOrders";
import RejectOrderModal from "@/components/order/RejectOrderModal";
import CustomerDetails from "@/components/order/CustomerDetails";
import Loader from "@/components/Loader";
import DropDown from "@/components/DropDown";
import Typography from "@/components/Typography";
// Component Imports ends

// functions start
import { getRequest } from "@/api/method";
import { calculatePrice } from "@/utils/helper"
import { statusHandler } from "@/utils/helper";
// functions ends

// redux
import { useAppSelector } from "@/redux/store";
import Button from "@/components/Button";
import RightSideModal from "@/components/RightSideModal";

interface TopNavItem {
  item: string;
  link: string;
  handleFunction: () => void;
}

interface OrderItem {
  [key: string]: any;
}

const Order: React.FC = () => {
  const filterData = useAppSelector((state) => state.filter.state);
  // Variables starts
  const topNavData = [
    {
      item: "Order details",
      link: "",
      handleFunction: () => {
        setOrderDetails(true);
        setShowTrack(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Track order",
      link: "",
      handleFunction: () => {
        setShowTrack(true);
        setOrderDetails(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Customer details",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
  ];
  // varisable ends

  // states starts
  const [viewOrderDetails, setOrderDetails] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [rejectModal, setShowReject] = useState(false);
  const [total, setShowTotal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filterdOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [order, setOrder] = useState<OrderItem>({});
  const [deliveredOrder, setDeliveredOrder] = useState(0);
  const [orderInTransit, setOrderInTransit] = useState(0);
  // states ends

  // function starts
  const handleShowViewDetailModal = (orderId: string) => {
    setOrder(orders.filter((item) => item.orderId == orderId)[0]);
    setOrderDetails(true);
  };

  const closeModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(false);
  };

  const showRejectModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(true);
  };

  const getOrders = async () => {
    try {
      const response = await getRequest("/vendor/orders");
      let ordersData: OrderItem[] = [];
      setDeliveredOrder(
        response.data.data.filter((order: any) => order.status === "completed")
          .length
      );
      setOrderInTransit(
        response.data.data.filter((order: any) => order.status === "in-transit")
          .length
      );
      response.data.data.map((order: any) => {
        let DeliveryStatus = statusHandler(order);
        let orderItem = {
          orderId: order.orderId,
          date: moment(order.orderDate).format("YYYY-MM-DD"),
          productName: order.orderItems.map((product) => {
            return product.name;
          }),
          orderItems: order.orderItems,
          productPrice: calculatePrice(order.orderItems),
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          customerPicture: `${order.customer.profilePicture} `,
          customerPhoneNumber: order.customer.phoneNumber,
          customerEmail: order.customer.email,
          AmountPaid: `₦${order.amountPaid.toLocaleString()}`,
          shippingAddress: order.shippingAddress,
          custmerAddress: order.shippingAddress,
          DeliveryStatus: DeliveryStatus,
          createdAt: order.orderDate,
        };
        ordersData.push(orderItem);
      });
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setPageLoading(false);
    } catch (error) { toast(<Toast text={"An error occured"} type="danger" />); }
  };

  const handleFilterWithDate = (startDate, endDate, value) => {
    setFilteredOrders(
      orders.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };
  const handleFilterWithStatus = (startDate, endDate, value) => {
    console.log(value)
    setFilteredOrders(
      orders.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };

  const handleFilterData = (data) => {
    setFilteredOrders(
      orders.filter(
        (ord) =>
          ord.customerName.toLowerCase().includes(data.toLowerCase()) ||
          ord.productName[0].toLowerCase().includes(data.toLowerCase())
      )
    );
  };


  // function ends

  useEffect(() => {
    handleFilterData(filterData);
  }, [filterData]);

  useEffect(() => {
    getOrders();
  }, []);
  return (
    <section>
      <div className="flex bg-[#F8F9FA]">
        <div className="w-full px-4">
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div>

              <div className="flex items-center justify-end py-4 gap-6">

                <div>
                  <Button
                    children={
                      <span className="flex justify-center items-center">
                        <span>Orders per week</span>
                        {/* <Image src={addIcon} className="ml-4" alt="" /> */}
                      </span>
                    }
                    btnSize="small"
                    minWidth="lg:min-w-[14rem]"
                    variant="primary"
                    clickHandler={() => {
                      // router.push("/add");
                      // clearProductId();
                    }}
                  />
                </div>
                <DropDown
                  data={[
                    "This week",
                    "Last week",
                    "This month",
                    "Last month",
                    "Choose month",
                    "Custom",
                  ]}
                  maxWidth={"max-w-[8rem]"}
                  placeholder="Time Range"
                  setValue={(startDate, endDate) => {
                    handleFilterWithDate(startDate, endDate);
                  }}
                />
              </div>
              <div
                className="scrollbar-hide border-solid border-primary-100 items-center gap-4 overflow-x-scroll flex"
              >
                <DashboardTopCard
                  name="Total Orders"
                  total={orders.length}
                  percentage="2.5"
                  bgColor="bg-[#57CAEB]"
                  icon={TotalOrderIcon}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name="Orders Delivered"
                  total={deliveredOrder}
                  percentage="2.5"
                  bgColor="bg-[#5DDAB4]"
                  icon={sendIcon}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name="Orders in Transit"
                  total={orderInTransit}
                  percentage="2.5"
                  bgColor="bg-[#FF7676]"
                  icon={carIcon}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name="Most purchased product"
                  total="1000"
                  percentage="2.5"
                  bgColor="bg-[#FF9E57]"
                  icon={shippingIcon}
                  addMaxWidth={true}
                />
              </div>
              <div className="">
                <div className="items-center justify-between mt-8 mb-2 hidden lg:flex">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-bold"
                    textSize="text-[18px]"
                  >
                    Orders
                  </Typography>
                  <div className="">
                    <DropDown
                      data={[
                        "Delivered",
                        "Pending",
                        "Failed",
                      ]}
                      maxWidth={"max-w-[8rem]"}
                      placeholder="Delivery status"
                      setValue={(startDate, endDate, value) => {
                        console.log(value)
                        handleFilterWithStatus(value);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <OrderTable
                    data={filterdOrders}
                    viewDetails={(orderId) => {
                      handleShowViewDetailModal(orderId);
                    }}
                    handleFilterData={handleFilterData}
                    handleFilterWithDate={handleFilterWithDate}
                    showRejectModal={showRejectModal}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <RightSideModal
          closeModal={closeModal}
          show={viewOrderDetails}
          content={
            <>{viewOrderDetails && (<OrderDetails
              show={viewOrderDetails}
              topNavData={topNavData}
              closeModal={closeModal}
              order={order}
            />)}</>
          }
        ></RightSideModal>
        <Modal
          show={rejectModal}
          content={
            <>{rejectModal && (<div className="flex items-center justify-center h-[100vh]">
              <RejectOrderModal closeModal={closeModal} />
            </div>)}</>
          }
        ></Modal>

        <Modal
          show={total}
          content={
            <>{total && (<div className="flex items-center justify-center h-[100vh]">
              <SetTotalOrderPerDay closeModal={closeModal} />
            </div>)}</>
          }
        ></Modal>
      </div>
    </section>
  );
};

export default Order;
