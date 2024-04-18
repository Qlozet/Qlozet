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
import CompanyDetails from "@/app/components/Settings/companyDetails/companyDetails";
import BillingAndInvioce from "@/app/components/Settings/BillingAndInvioceInfo";

const Dashboard = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [showCompanyDetails, setShowComapanyDetails] = useState(false);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [currentNav, setCurrentNav] = useState("Company details");

  const topNavData = [
    {
      item: "Company details",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(true);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Billing and invoice",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(true);
        setShowWarehouse(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Warehouses",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(true);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Shipping partners",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowShippingPatners(true);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Users and permissions",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(true);
        setShowCategory(false);
      },
    },
    {
      item: "Categories",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(true);
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
            active={currentNav}
            full={true}
          />
        </div>
        {currentNav === "Company details" && <CompanyDetails />}
        {currentNav === "Billing and invoice" && <BillingAndInvioce />}
      </div>
    </div>
  );
};

export default Dashboard;
