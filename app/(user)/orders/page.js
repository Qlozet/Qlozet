"use client";
import { useEffect, useState } from "react";
import ChatCard from "@/components/Chat/ChatCard";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import classes from "./index.module.css";
import DonutChart from "@/components/Chat/DoughnutChat";
import DropDown from "@/components/DropDown";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import OrderTable from "@/components/order/OrderTable";
import Modal from "@/components/Modal";
import SetTotalOrderPerDay from "@/components/SetTotalItemPerDayForm";
import OrderDetails from "@/components/order/OrderDetails";
import TrackOrder from "@/components/order/TrackOrders";
import RejectOrderModal from "@/components/order/RejectOrderModal";
import CustomerDetails from "@/components/order/CustomerDetails";
import MobileSideBar from "@/components/MobileSideBar";
import { getRequest } from "@/api/method";
const Order = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [viewOrderDetails, setOrderDetails] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [rejectModal, setShowReject] = useState(false);
  const [total, setShowTotal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const handleShowViewDetailModal = () => {
    setOrderDetails(true);
  };

  const data = [
    {
      location: "Warri",
      total: "w-[70%]",
      percentage: "w-[50%]",
    },
    {
      location: "Benin",
      total: "w-[60%]",
      percentage: "w-[53%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
  ];

  const dropdownData = [
    {
      text: "View vendor’s details",
      color: "",
    },
    {
      text: "View vendor’s ",
      color: "",
    },
    {
      text: "vendor’s details",
      color: "",
    },
  ];
  const chartData = {
    labels: ["Male", "Female"],
    values: [12, 19],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };

  const tableData = [
    {
      date: "My name iss",
      orderId: "My name iss",
      productName: "My name iss",
      productPrice: "12222",
      CustomerName: "My name iss",
      AmountPaid: "My name iss",
      DeliveryStatus: "My name iss",
    },
    {
      date: "My name iss",
      orderId: "My name iss",
      productName: "My name iss",
      productPrice: "12222",
      CustomerName: "My name iss",
      AmountPaid: "My name iss",
      DeliveryStatus: "My name iss",
    },
    {
      date: "My name iss",
      orderId: "My name iss",
      productName: "My name iss",
      productPrice: "12222",
      CustomerName: "My name iss",
      AmountPaid: "My name iss",
      DeliveryStatus: "My name iss",
    },
    {
      date: "My name iss",
      orderId: "My name iss",
      productName: "My name iss",
      productPrice: "12222",
      CustomerName: "My name iss",
      AmountPaid: "My name iss",
      DeliveryStatus: "My name iss",
    },
  ];
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
      console.log(response);
    } catch (error) {}
  };

  useEffect(() => {
    getOrders();
  }, []);
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Orders" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Dashboard" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={true}
          name="Orders"
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
        />
        <div
          className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4 md:hidden`}
        >
          <DashboardTopCard
            name="Total Vendors"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#57CAEB]"
            link="link"
            icon={vendorIcon}
            addMaxWidth={true}
          />
          <DashboardTopCard
            name="Achieved Vendors"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#5DDAB4]"
            icon={customerIcon}
            addMaxWidth={true}
          />
          <DashboardTopCard
            name="Total Customers"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#5DDAB4]"
            icon={customerIcon}
            addMaxWidth={true}
          />
          <DashboardTopCard
            name="Total Customers"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#5DDAB4]"
            icon={customerIcon}
            addMaxWidth={true}
          />
        </div>
        <div
          className={`${classes.scrollbarElement} items-center gap-4 overflow-x-scroll px-4 hidden md:flex`}
        >
          <DashboardTopCard
            name="Total Vendors"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#57CAEB]"
            link="link"
            icon={vendorIcon}
          />
          <DashboardTopCard
            name="Achieved Vendors"
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
              data={tableData}
              viewDetails={() => {
                handleShowViewDetailModal();
              }}
              showRejectModal={showRejectModal}
            />
          </div>
        </div>
      </div>
      {/* <Modal content={<SetTotalOrderPerDay />}></Modal> */}
      {/* {showModal == true && ( */}
      {viewOrderDetails && (
        <Modal
          content={
            <OrderDetails topNavData={topNavData} closeModal={closeModal} />
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
            <CustomerDetails topNavData={topNavData} closeModal={closeModal} />
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
  );
};

export default Order;
