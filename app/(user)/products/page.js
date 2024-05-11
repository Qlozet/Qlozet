"use client";
import { useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/components/Typography";
import Modal from "@/components/Modal";
import CustomerDetails from "@/components/order/CustomerDetails";
import OrderHistory from "@/components/Customer/OrderHistory";
import CustomerTable from "@/components/Customer/CustomerTable";
import DonutChart from "@/components/Chat/DoughnutChat";
import classes from "./index.module.css";
import MobileSideBar from "@/components/MobileSideBar";
import UpdateComponent from "@/components/UpdateComponent";
import ProductTable from "@/components/Products/ProductTable";
const Products = () => {
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
    labels: ["Suit", "Kaftan", "Cargo", "Abgada"],
    values: [50, 25, 25, 25],
    colors: ["#3E1C01", "#9C8578", "#F6E9DD", "#BE7D42"],
    borderAlign: "center",
  };

  const tableData = [
    {
      picture: "My name iss",
      productName: "My name iss",
      productPrice: "My name iss",
      category: "12222",
      productType: "My name iss",
      tag: "My name iss",
      quiantity: "5662",
      ProductStatus: "My name iss",
    },
  ];
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
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
        <SideBar active="Products" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Products" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          name="Products"
          addSearch={true}
          setValue={(data) => {
            // console.log(data);
          }}
          showSideBar={showSideBar}
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
          <div
            className={`px-6 py-4 flex bg-white rounded-[12px] mt-4 max-w-[300px] w-full min-w-[300px]`}
          >
            <DonutChart data={chartData} width={"90"} height={"90"} />
            <div>
              <Typography
                textColor="text-black"
                textWeight="font-[400]"
                textSize="text-[12px]"
              >
                Sales By Product Category
              </Typography>
              <div>
                <div className="flex items-center gap-2 p-2">
                  <span className="w-[10px] h-[10px] rounded-[50%] bg-primary"></span>
                  <Typography
                    textColor="text-black"
                    textWeight="font-[400]"
                    textSize="text-[12px]"
                  >
                    Suite
                  </Typography>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <span className="w-[10px] h-[10px] rounded-[50%] bg-primary"></span>
                  <Typography
                    textColor="text-black"
                    textWeight="font-[400]"
                    textSize="text-[12px]"
                  >
                    Suite
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          <div className="flex items-center justify-between mt-14 mb-2 ">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Products
            </Typography>
            <div className="">
              {/* <DropDown
                placeholder={"Filter by"}
                value={dropDownValue}
                setValue={(data) => {
                  setDropDownValue(data);
                }}
                data={dropdownData}
              /> */}
            </div>
          </div>
          <div className="my-4 block md:hidden">
            <UpdateComponent />
          </div>
          <ProductTable data={tableData} showModal={showModal} />
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

export default Products;
