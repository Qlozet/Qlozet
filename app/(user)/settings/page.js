"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/app/components/DashboardNavBarWithoutSearch";
import SideBar from "@/app/components/SideBar";
import OrderDetailNav from "@/app/components/order/OrderdetailsNav";
import CompanyDetails from "@/app/components/Settings/companyDetails/companyDetails";
import BillingAndInvioce from "@/app/components/Settings/BillingAndInvioceInfo";
import Warehouse from "@/app/components/Settings/Warehouse/Warehouse";
import Modal from "@/app/components/Modal";
import classes from "./index.module.css";
import AddNewWarehouseForm from "@/app/components/Settings/Warehouse/AddNewWarehouseForm";
import Shipping from "@/app/components/Settings/Shipping/Shipping";
import UserAndPermission from "@/app/components/Settings/UserAndPermission/UserAndPermssion";
import Category from "@/app/components/Settings/Category/Category";

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
        {currentNav === "Warehouses" && <Warehouse />}
        {currentNav === "Shipping partners" && <Shipping />}
        {currentNav === "Users and permissions" && <UserAndPermission />}
        {currentNav === "Categories" && <Category />}
      </div>
    </div>
  );
};

export default Dashboard;
