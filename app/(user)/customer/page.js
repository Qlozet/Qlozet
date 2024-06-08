"use client";
import { useEffect, useState } from "react";
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
import MobileSideBar from "@/components/MobileSideBar";
import classes from "./index.module.css";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";
const Customer = () => {
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [custmers, setCustomers] = useState([]);

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

  const getCustomers = async () => {
    try {
      let response = await getRequest("/vendor/customers");
      let Customers = [];
      response && setPageLoading(false);
      if (response.data) {
        response?.data?.data.map((item) => {
          const customer = {
            picture: "",
            customerName: "",
            status: item.status,
            totalOrders: item.totalOrders,
            lastOrderDate: item.lastOrderDate,
            phone: item.phoneNumber,
            emailAddress: item.email,
          };
          Customers.push(customer);
        });
        setCustomers(Customers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);
  return (
    <div>
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Customers" />
          </div>
          <MobileSideBar
            showMobileNav={showMobileNav}
            active="Customers"
            closeSideBar={showSideBar}
          />
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              addSearch={true}
              setValue={(data) => {}}
              showSideBar={showSideBar}
              name="Customers"
            />
            <div
              className={` ${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll`}
            >
              <DashboardTopCard
                name="Total Customers"
                total={`${custmers.length}`}
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
              <div className="lg:block hidden">
                {" "}
                <CustomerTable data={custmers} showModal={showModal} />
              </div>
            </div>
          </div>

          {viewCustomerDetails && (
            <Modal
              content={
                <CustomerDetails
                  topNavData={topNavData}
                  closeModal={closeModal}
                />
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
      )}{" "}
    </div>
  );
};

export default Customer;
