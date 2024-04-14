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
import VerticalBarGraph from "@/app/components/VerticalBarGraph";

const Dashboard = () => {
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
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Dashboard" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
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
            icon={vendorIcon}
          />
          <DashboardTopCard
            name="Total Customers"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#FF7976]"
            icon={customerIcon}
          />
        </div>

        <div className="relative">
          <div className="flex items-center justify-end mt-14 mb-2 ">
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

          <div className="flex items-center w-full gap-4 z-0">
            <div
              className={`${classes.first_container} flex items-center gap-4 mt-4`}
            >
              <div className="w-1/2">
                <ChatCard
                  text="Vendors by gender"
                  graph={<DonutChart data={chartData} />}
                />
              </div>
              <div className="w-1/2">
                <ChatCard
                  text="Vendors by top location"
                  graph={<HorizontalChat data={data} />}
                />
              </div>
            </div>
            <div
              className={`${classes.second_container} flex items-center mt-4`}
            >
              <div className="w-full flex items-center">
                <ChatCard
                  text="Orders by product"
                  graph={<HorizontalChat data={data} />}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center w-full gap-4 z-0 mt-4">
            <div
              className={`${classes.first_container} flex items-center gap-4 mt-4 w-full`}
            >
              <div className="w-full shadow-md bg-white rounded-[12px] p-6 ">
                <VerticalBarGraph />
              </div>
            </div>

            <div
              className={`${classes.second_container} flex items-center mt-4`}
            >
              <div className="w-full flex items-center"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
