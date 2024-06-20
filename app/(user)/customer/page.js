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
import CustomerMobileHistory from "@/components/Customer/CustomerHistoryTableItemMobile/CustomerHistoryMobile";
import Button from "@/components/Button";
import Image from "next/image";
import defaultImage from "../../../public/assets/image/Rectangle.png";
import DropDown from "@/components/DropDown";

const Customer = () => {
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [custmers, setCustomers] = useState([]);
  const [filterCustmers, setFilteredCustomers] = useState([]);
  const [customer, setCustomer] = useState({});
  const [customerHistory, setCustomerHistory] = useState([
    {
      id: "1",
      date: "hello",
      productName: "hello",
      productPrice: "hello",
      AmountPaid: "hello",
      DeliveryStatus: "hello",
    },
  ]);

  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const closeModal = () => {
    setCustomerDetails(false);
    setShowHistory(false);
  };

  const showModal = (customerId) => {
    setCustomer(custmers.filter((item) => item.customerId === customerId)[0]);
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
          console.log(item);
          const customer = {
            customerId: item.customerId,
            picture: "",
            customerName: `${item.firstName} ${item.lastName}`,
            status: item.status,
            totalOrders: item.totalOrders,
            lastOrderDate: item.lastOrderDate,
            phone: item.phoneNumber,
            emailAddress: item.email,
          };
          Customers.push(customer);
        });
        setCustomers(Customers);
        setFilteredCustomers(Customers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilfeterData = (data) => {
    setFilteredCustomers(
      custmers.filter(
        (cus) =>
          cus.customerName.toLowerCase().includes(data.toLowerCase()) ||
          cus.emailAddress.toLowerCase().includes(data.toLowerCase())
      )
    );
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
          <div className={!viewCustomerDetails ? "block" : "hidden"}></div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              addSearch={true}
              setValue={(data) => {
                handleFilfeterData(data);
              }}
              showSideBar={showSideBar}
              name="Customers"
            />
            {!viewCustomerDetails && (
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
                  minHeight="min-h-[8.5rem]"
                />
                <DashboardTopCard
                  name="Highest customer by location"
                  total="Lagos state"
                  percentage="2.5"
                  bgColor="bg-[#5DDAB4]"
                  icon={customerIcon}
                  addMaxWidth={true}
                  minHeight="min-h-[8.5rem]"
                />
              </div>
            )}
            {!viewCustomerDetails && (
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
                <div>
                  <CustomerTable data={filterCustmers} showModal={showModal} handleFilfeterData={handleFilfeterData} />
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            {viewCustomerDetails && (
              <Modal
                content={
                  <CustomerDetails
                    customer={customer}
                    topNavData={topNavData}
                    closeModal={closeModal}
                  />
                }
              ></Modal>
            )}
            {showHostory && (
              <Modal
                content={
                  <OrderHistory
                    topNavData={topNavData}
                    closeModal={closeModal}
                    customerHistory={customerHistory}
                  />
                }
              ></Modal>
            )}
          </div>
        </div>
      )}
      {/* customer mobile viewdetails */}
      {viewCustomerDetails && (
        <div className="block md:hidden">
          <div className="p-4 bg-[#F8F9FA]">
            <div className="w-full lg:w-[40%] bg-white p-4 rounded-b-[8px]">
              <div className="bg-auto bg-no-contain">
                <div className="my-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-bold"
                    textSize="text-[18px]"
                  >
                    Customers
                  </Typography>
                </div>
                <Image
                  alt="Customer image"
                  src={defaultImage}
                  className="w-[148px] h-[115px] rounded-[12px]"
                />
              </div>
              <div className="flex justify-between items-center py-4">
                <div></div>
              </div>
              <div>
                <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[400]"
                      textSize="text-[12px]"
                    >
                      Name
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[12px]"
                    >
                      {customer.customerName}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[400]"
                      textSize="text-[12px]"
                    >
                      Email address
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[12px]"
                    >
                      {customer.emailAddress}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[400]"
                      textSize="text-[12px]"
                    >
                      Phone number 1
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[12px]"
                    >
                      {customer.phone}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[400]"
                      textSize="text-[12px]"
                    >
                      Phone number 2
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[12px]"
                    >
                      {customer.phone}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
                  <div className="w-[35%]">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[400]"
                      textSize="text-[12px]"
                    >
                      Shipping address
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[12px]"
                    >
                      {/* {customer.custmerAddress} */}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F8F9FA] p-4">
            <div className="p-2 flex items-center justify-between mt-6 mb-4">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[18px]"
              >
                Orders History
              </Typography>
              <DropDown
                data={[
                  "This week",
                  "Last week",
                  "Last month",
                  "This month",
                  "Choose month",
                  "Custom",
                ]}
                placeholder="Time Range"
                setValue={(data) => {}}
              />
            </div>
            <CustomerMobileHistory />
            <CustomerMobileHistory />
            <CustomerMobileHistory />
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
