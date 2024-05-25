"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import OrderDetailNav from "@/components/order/OrderdetailsNav";
import CompanyDetails from "@/components/Settings/companyDetails/companyDetails";
import BillingAndInvioce from "@/components/Settings/BillingAndInvioceInfo";
import Warehouse from "@/components/Settings/Warehouse/Warehouse";
import Modal from "@/components/Modal";
import classes from "./index.module.css";
import AddNewWarehouseForm from "@/components/Settings/Warehouse/AddNewWarehouseForm";
import Shipping from "@/components/Settings/Shipping/Shipping";
import UserAndPermission from "@/components/Settings/UserAndPermission/UserAndPermssion";
import Category from "@/components/Settings/Category/Category";
import MobileSideBar from "@/components/MobileSideBar";

const Dashboard = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [showCompanyDetails, setShowComapanyDetails] = useState(false);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [currentNav, setCurrentNav] = useState("Shop details");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const topNavData = [
    {
      item: "Shop details",
      link: "",
      navWidth: "min-w-[7.5rem] lg:min-w-w-[0]",
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
      navWidth: "min-w-[10.5rem] lg:min-w-w-[0]",
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
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
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
      navWidth: "min-w-[10rem] lg:min-w-w-[0]",
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
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
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
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
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
        <MobileSideBar
          showMobileNav={showMobileNav}
          active="Settings"
          closeSideBar={showSideBar}
        />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={false}
          name="Settings"
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
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
        {currentNav === "Shop details" && <CompanyDetails />}
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
