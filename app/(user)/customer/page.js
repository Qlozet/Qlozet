"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import DropDown from "@/components/DropDown";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/components/Typography";
import Modal from "@/components/Modal";
import CustomerDetails from "@/components/order/CustomerDetails";
import OrderHistory from "@/components/Customer/OrderHistory";
import CustomerTable from "@/components/Customer/CustomerTable";
import MobileSideBar from "@/components/MobileSideBar";
import classes from "./index.module.css";
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

  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
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
    setCustomerDetails(false);
    setShowHistory(false);
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
        <SideBar active="Customers" />
      </div>
      {showMobileNav && (
        <div className="md:hidden">
          <MobileSideBar active="Customers" closeSideBar={showSideBar} />
        </div>
      )}
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={true}
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
          name="Customers"
        />
        <div
          className={` ${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll`}
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
        </div>
        <div className="">
          <div className="flex items-center justify-between mt-14 mb-2 ">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Customers
            </Typography>
            {/* <div className="">
              <DropDown
                placeholder={"Filter by"}
                value={dropDownValue}
                setValue={(data) => {
                  setDropDownValue(data);
                }}
                data={dropdownData}
              /> 
              </div>*/}
          </div>
          <div className="md:block hidden">
            {" "}
            <CustomerTable data={tableData} showModal={showModal} />
          </div>
        </div>
      </div>

      {viewCustomerDetails && (
        <Modal
          content={
            <CustomerDetails topNavData={topNavData} closeModal={closeModal} />
          }
        ></Modal>
      )}
      {showHostory && (
        <Modal
          content={
            <OrderHistory topNavData={topNavData} closeModal={closeModal} />
          }
        ></Modal>
      )}
    </div>
  );
};

export default Customer;
