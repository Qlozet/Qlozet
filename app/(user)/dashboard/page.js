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
import infoIcon from "../../../public/assets/svg/Info Circle.svg";
import VerticalBarGraph from "@/app/components/VerticalBarGraph";
import Typography from "@/app/components/Typography";
import Image from "next/image";

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
            addMaxWidth={true}
          />
          <DashboardTopCard
            name="Achieved Vendors"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#5DDAB4]"
            icon={vendorIcon}
            addMaxWidth={true}
          />
          <DashboardTopCard
            name="Total Customers"
            total="10000"
            percentage="2.5"
            bgColor="bg-[#FF7976]"
            icon={customerIcon}
            addMaxWidth={true}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2 mt-4">
            <div className="bg-[#FFF7DE] px-12 py-2 rounded-[12px] flex items-center gap-6">
              <div>
                <Image src={infoIcon} alt="" />
              </div>
              <div>
                <Typography
                  textColor="text-gray-100"
                  textWeight="font-normal"
                  textSize="text-[14px]"
                >
                  To access all ALTIREs service, please complete your KYC
                  verification process
                </Typography>
                <div className=" border-b-[#FFB020] border-solid border-b-[1.5px] max-w-[6.3rem]">
                  <Typography
                    textColor="text-[#FFB020]"
                    textWeight="font-[600]"
                    textSize="text-[14px]"
                  >
                    Update Profile
                  </Typography>
                </div>
              </div>
            </div>
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
