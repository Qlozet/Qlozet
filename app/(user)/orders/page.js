"use client";
import { useEffect, useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import classes from "./index.module.css";
import moment from "moment";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import sendIcon from "../../../public/assets/svg/send.svg";
import carIcon from "../../../public/assets/svg/car.svg";
import shippingIcon from "../../../public/assets/svg/shipping_bag.svg";
import OrderTable from "@/components/order/OrderTable";
import Modal from "@/components/Modal";
import SetTotalOrderPerDay from "@/components/SetTotalItemPerDayForm";
import OrderDetails from "@/components/order/OrderDetails";
import TotalOrderIcon from "../../../public/assets/svg/TotalOrder-Icon.svg";
import TrackOrder from "@/components/order/TrackOrders";
import RejectOrderModal from "@/components/order/RejectOrderModal";
import CustomerDetails from "@/components/order/CustomerDetails";
import MobileSideBar from "@/components/MobileSideBar";
import { getRequest } from "@/api/method";
import { calculatePrice } from "@/utils/helper";
import Loader from "@/components/Loader";
const Order = () => {
  const [viewOrderDetails, setOrderDetails] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [rejectModal, setShowReject] = useState(false);
  const [total, setShowTotal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filterdOrders, setFilteredOrders] = useState([]);
  const [order, setOrder] = useState({});
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const handleShowViewDetailModal = (orderId) => {
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

  const getOrders = async () => {
    try {
      const response = await getRequest("/vendor/orders");
      let ordersData = [];
      response.data.data.map((order) => {
        let DeliveryStatus;
        if (order.status === "out-for-delivery") {
          DeliveryStatus = { name: "Out for delivery", bg: "bg-[#D4CFCA]" };
        } else if (order.status === "return") {
          DeliveryStatus = { name: "Return", bg: "bg-[#D4CFCA]" };
        } else {
          DeliveryStatus = { name: "Return", bg: "bg-[#D4CFCA]" };
        }
        let orderItem = {
          orderId: order.orderId,
          date: moment(order.orderDate).format("YYYY-MM-DD"),
          productName: order.orderItems.map((product) => {
            return product.name;
          }),
          productPrice: calculatePrice(order.orderItems),
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterWithDate = (data) => {
    const today = new Date();
    console.log(
      orders.filter(
        (item) =>
          moment(item.createdAt).valueOf() > data &&
          moment(item.createdAt).valueOf() < today.getTime()
      )
    );
  };

  const handleFilfeterData = (data) => {
    setFilteredOrders(
      orders.filter(
        (ord) =>
          ord.customerName.toLowerCase().includes(data.toLowerCase()) ||
          ord.productName[0].toLowerCase().includes(data.toLowerCase())
      )
    );
  };

  useEffect(() => {
    getOrders();
  }, []);
  return (
    <section>
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Orders" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Orders"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              addSearch={true}
              name="Orders"
              setValue={(data) => {
                handleFilfeterData(data);
              }}
              showSideBar={showSideBar}
            />
            <div
              className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4 lg:hidden`}
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
                total="100"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={sendIcon}
                addMaxWidth={true}
              />
              <DashboardTopCard
                name="Orders in Transit"
                total="100"
                percentage="2.5"
                bgColor="bg-[#FF7676]"
                icon={carIcon}
                addMaxWidth={true}
              />
              <DashboardTopCard
                name="Most purchased order"
                total="1000"
                percentage="2.5"
                bgColor="bg-[#FF9E57]"
                icon={shippingIcon}
                addMaxWidth={true}
              />
            </div>
            <div
              className={`${classes.scrollbarElement} items-center gap-4 overflow-x-scroll px-4 hidden lg:flex`}
            >
              <DashboardTopCard
                name="Total Orders"
                total={orders.length}
                percentage="2.5"
                bgColor="bg-[#57CAEB]"
                link="link"
                icon={vendorIcon}
              />
              <DashboardTopCard
                name="Orders Delivered"
                total="10000"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={sendIcon}
              />
              <DashboardTopCard
                name="Total Customers"
                total="10000"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={customerIcon}
              />
              <DashboardTopCard
                name="Total Customers"
                total="10000"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={customerIcon}
              />
            </div>
            <div className="">
              <div>
                <OrderTable
                  data={filterdOrders}
                  viewDetails={(orderId) => {
                    handleShowViewDetailModal(orderId);
                  }}
                  handleFilfeterData={handleFilfeterData}
                  handleFilterWithDate={handleFilterWithDate}
                  showRejectModal={showRejectModal}
                />
              </div>
            </div>
          </div>
          {viewOrderDetails && (
            <Modal
              content={
                <OrderDetails
                  topNavData={topNavData}
                  closeModal={closeModal}
                  order={order}
                />
              }
            ></Modal>
          )}

          {showTrack && (
            <Modal
              content={<TrackOrder data={topNavData} closeModal={closeModal} />}
            ></Modal>
          )}

          {showCustomer && (
            <Modal
              content={
                <CustomerDetails
                  topNavData={topNavData}
                  closeModal={closeModal}
                  customer={order}
                />
              }
            ></Modal>
          )}
          {rejectModal && (
            <Modal
              content={
                <div className="flex items-center justify-center h-[100vh]">
                  <RejectOrderModal closeModal={closeModal} />
                </div>
              }
            ></Modal>
          )}
          {total && (
            <Modal
              content={
                <div className="flex items-center justify-center h-[100vh]">
                  <SetTotalOrderPerDay closeModal={closeModal} />
                </div>
              }
            ></Modal>
          )}
        </div>
      )}
    </section>
  );
};

export default Order;
