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
import OrderDetailNav from "@/app/components/order/OrderdetailsNav";
import TextInput from "@/app/components/TextInput";
import NumberInput from "@/app/components/NumberInput";
import FileInput from "@/app/components/uploadFileinput/UploadFileInput";

const Dashboard = () => {
  const [dropDownValue, setDropDownValue] = useState("");

  const topNavData = [
    {
      item: "Company details",
      link: "",
      handleFunction: () => {
        setOrderDetails(true);
        setShowTrack(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Billing and invoice",
      link: "",
      handleFunction: () => {
        setShowTrack(true);
        setOrderDetails(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Warehouses",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
    {
      item: "Shipping partners",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
    {
      item: "Users and permissions",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
    {
      item: "Categories",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
  ];
  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Settings" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Settings"
          setValue={(data) => {
            // console.log(data);
          }}
        />
        <div className="mt-4">
          <OrderDetailNav
            bg="bg"
            data={topNavData}
            width="w-full"
            active="Company details"
            full={true}
          />
        </div>
        <div className="bg-white w-full p-4 mx-2">
          <div className="flex items-center justify-between">
            <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
            <div className="min-w-[9rem] flex items-center justify-center">
              Company info
            </div>
            <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
          </div>
          <div className="flex items-center justify-between  gap-6">
            <div className="w-full">
              <TextInput
                label="Company name"
                placeholder="Company name"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <TextInput
                label="Address line 1"
                placeholder="Address line 1"
                setValue={(data) => {}}
              />
            </div>
            <div className="w-full">
              <TextInput
                label="Address line 2"
                placeholder="Enter Address line 2"
                setValue={(data) => {}}
              />
            </div>
          </div>
          <div className="flex items-center justify-between  gap-6">
            <div className="w-full">
              <TextInput
                label="State"
                placeholder="Enter State"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <TextInput
                label="Country"
                placeholder="EnterCountry"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <TextInput
                label="Timezone"
                placeholder="Timezone Timezone"
                setValue={(data) => {}}
              />
            </div>
          </div>
          <div className="flex items-center justify-between  gap-6">
            <div className="w-full">
              <TextInput
                label="City"
                placeholder="Enter City"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <NumberInput
                label="Phone number"
                placeholder="EnterPhone number"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <TextInput
                label="Email address"
                placeholder="Enter Email address"
                setValue={(data) => {}}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="w-full">
              {" "}
              <TextInput
                label="BVN"
                placeholder="Enter BVN"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <TextInput
                label="NIN"
                placeholder="Enter NIN"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full"></div>
            <div></div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
            <div className="min-w-[11rem] flex items-center justify-center ">
              Upload Documents
            </div>
            <div className="border-gray-200 border-dashed border-[1px] w-full"></div>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="w-full">
              <FileInput
                label="Upload company logo"
                // placeholder="Enter NIN"
                setValue={(data) => {}}
              />{" "}
            </div>
            <div className="w-full">
              <FileInput label="Upload CAC Document" setValue={(data) => {}} />
            </div>
            <div className="w-full"></div>
            <div></div>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
