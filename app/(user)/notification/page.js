"use client";
import { useState } from "react";
import ChatCard from "@/app/components/Chat/ChatCard";
import HorizontalChat from "@/app/components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@/app/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/app/components/DashboardTopCard";
import SideBar from "@/app/components/SideBar";
import classes from "./index.module.css";
import DonutChart from "@/app/components/Chat/DoughnutChat";
import DropDown from "@/app/components/DropDown";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/app/components/Typography";
import OrderTable from "@/app/components/order/OrderTable";
import Modal from "@/app/components/Modal";
import Image from "next/image";
import NumberInput from "@/app/components/NumberInput";
import Button from "@/app/components/Button";
import SetTotalOrderPerDay from "@/app/components/SetTotalItemPerDayForm";
import OrderDetailNav from "@/app/components/order/OrderdetailsNav";
import OrderDetails from "@/app/components/order/OrderDetails";
import OrderStep from "@/app/components/order/OrderStep";
import TrackOrder from "@/app/components/order/TrackOrders";
import RejectOrderModal from "@/app/components/order/RejectOrderModal";
import CustomerDetails from "@/app/components/order/CustomerDetails";
// import CustomerDetails from "@/app/components/Customer/CustomerDetails";
import OrderHistory from "@/app/components/Customer/OrderHistory";
import CustomerTable from "@/app/components/Customer/CustomerTable";
import Notification from "@/app/components/Notification/NotificationComponent";
const Customer = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);

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
  ];
  const closeModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(false);
  };

  const showModal = () => {
    setCustomerDetails(true);
    setShowHistory(false);
  };

  const topNavData = [
    {
      item: "Customer details",
      link: "",
      handleFunction: () => {
        setCustomerDetails(true);
        setShowHistory(false);
      },
    },
    {
      item: "Order history",
      link: "",
      handleFunction: () => {
        setCustomerDetails(false);
        setShowHistory(true);
      },
    },
  ];
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          //   addSearch={true}
          name={"Notifications"}
          setValue={(data) => {
            // console.log(data);
          }}
        />
        <div className="border-[1px] border-solid border-gray-200 rounded-[12px] py-4 mt-6 bg-white">
          <Notification shipped={true} />
          <Notification shipped={true} />
          <Notification shipped={false} />
          <Notification shipped={false} />
          <Notification shipped={false} />
        </div>
      </div>
    </div>
  );
};

export default Customer;
