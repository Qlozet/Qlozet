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

const Vendor = () => {
  const [dropDownValue, setDropDownValue] = useState("");

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
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Orders" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={true}
          setValue={(data) => {
            // console.log(data);
          }}
        />
        <div className="flex items-center gap-4">
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
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mt-14 mb-2 ">
            <Typography
              textColor="text-black"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Vendors
            </Typography>
            <div className="">
              <DropDown
                placeholder={"Vendor’s status"}
                value={dropDownValue}
                setValue={(data) => {
                  setDropDownValue(data);
                }}
                data={dropdownData}
              />
            </div>
          </div>

          <OrderTable data={tableData} />
        </div>
      </div>
    </div>
  );
};

export default Vendor;
