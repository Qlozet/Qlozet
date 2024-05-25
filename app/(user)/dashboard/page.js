"use client";
import { useState, useEffect } from "react";
import ChatCard from "@/components/Chat/ChatCard";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import classes from "./index.module.css";
import DonutChart from "@///components/Chat/DoughnutChat";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import TotalOrderIcon from "../../../public/assets/svg/TotalOrder-Icon.svg";
import TotalearningIcon from "../../../public/assets/svg/Totalearning-icon.svg";
import CartIcon from "../../../public/assets/svg/customer-carticon.svg";
import VerticalBarGraph from "@/components/VerticalBarGraph";
import UpdateComponent from "@/components/UpdateComponent";
import RecentOrder from "@/components/RecentOrder";
import { getRequest } from "@/api/method";
import MobileSideBar from "@/components/MobileSideBar";
import getVendorDetails from "@/api/request";
import { setUserDetails } from "@/utils/localstorage";
import Loader from "@/components/Loader";
import DropDown from "@/components/DropDown";

const Dashboard = () => {
  const [totalCustomer, setTotalCustomer] = useState("0");
  const [totalVendor, setTotalVendor] = useState("0");
  const [customerLocation, setCustomerLocation] = useState("");
  const [loadPage, setLoadPage] = useState(true);
  const [top4Location, setTop4Location] = useState([]);
  // const [totalCustomer, setTotalCustomer] = useState("0");
  const [showMobileNav, setShowMobileNav] = useState(false);

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

  const orders = [
    {
      id: 1,
      name: "Omoniyi Precious",
      date: "01/12/2024",
      product: "Amasi dress",
      price: 1000,
      quantity: 1,
      status: "Ready to Ship",
    },
    {
      id: 2,
      name: "Kennedy Jones",
      date: "01/12/2024",
      product: "Kaz Kit ",
      price: 20,
      quantity: 2,
      status: "Ready to Ship",
    },
    {
      id: 3,
      name: "Toyosi Adeyemi",
      date: "01/12/2024",
      product: "Amasi dress",
      price: 50,
      quantity: 1,
      status: "Ready to Ship",
    },
  ];
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };
  const getTotalCustomers = async () => {
    try {
      const custmerResponse = await getRequest(
        "/vendor/customers/total-customers-sold-to"
      );
      console.log(custmerResponse.data.totalCount);
      setTotalCustomer(custmerResponse.data.totalCount);
    } catch (error) {}
  };

  const getLocationWithHighestCustomer = async () => {
    try {
      const response = await getRequest(
        "/vendor/customers/highest-customers-by-location"
      );
      setCustomerLocation(response.data.totalCount);
      response?.data && setLoadPage(false);
    } catch (error) {}
  };

  const get4TopLocation = async () => {
    try {
      const locationData = [];
      const response = await getRequest(
        "/vendor/dashboard/orders/top-locations"
      );
      setCustomerLocation(response.data.totalCount);

      console.log(response?.data?.data);
      response?.data?.data?.locations.map((location) => {
        const singleLocatin = {
          location: location.location,
          female: (location.female / response?.data?.data?.totalOrders) * 100,
          male: (location.male / response?.data?.data?.totalOrders) * 100,
        };
        locationData.push(singleLocatin);
      });
      setTop4Location(locationData);
    } catch (error) {}
  };

  useEffect(() => {
    getTotalCustomers();
    getLocationWithHighestCustomer();
    get4TopLocation();
  }, []);

  return (
    <div>
      {loadPage ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-gray-400 w-full h-full">
          <div className="">
            <SideBar active="Dashboard" />
            {showMobileNav && (
              <div className="md:hidden">
                <MobileSideBar active="Dashboard" closeSideBar={showSideBar} />
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="p-4">
              {" "}
              <DasboardNavWithOutSearch
                addSearch={false}
                setValue={(data) => {
                  // console.log(data);
                }}
                name="Dashboard"
                showSideBar={showSideBar}
              />
            </div>

            <div
              className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4 `}
            >
              <DashboardTopCard
                name="Total Order"
                total={totalCustomer}
                percentage="2.5"
                bgColor="bg-[#57CAEB]"
                link="link"
                icon={TotalOrderIcon}
                addMaxWidth={true}
              />
              <DashboardTopCard
                name="Total earnings"
                total="N 50,000"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={TotalearningIcon}
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

              <DashboardTopCard
                name="Total returns"
                total="10"
                percentage="2.5"
                bgColor="bg-[#FF3A3A]"
                icon={CartIcon}
                addMaxWidth={true}
              />
            </div>
            <div className=" bg-[#F8F9FA] px-4">
              <div className="flex items-center justify-between mb-2 mt-4">
                <UpdateComponent />
                <div className="hidden md:block">
                  {/* <DropDown
                    placeholder={"Vendor’s status"}
                    value={dropDownValue}
                    setValue={(data) => {
                      setDropDownValue(data);
                    }}
                    data={dropdownData}
                  /> */}
                  <DropDown
                    data={[
                      "This week",
                      "Last week",
                      "Last month",
                      "This month",
                      "Choose month",
                      "Custom",
                    ]}
                    maxWidth={"max-w-[10rem]"}
                    placeholder="Time Range"
                    setValue={(data) => {}}
                    bg={"bg-white"}
                  />
                </div>
              </div>
              <div className="block md:flex items-center w-full gap-4 border-solid solid-[1px] border-primary z-[0]">
                <div
                  className={`${classes.first_container} block md:flex items-center gap-4 mt-4 w-full`}
                >
                  <div className="md:w-1/2 w-full">
                    <ChatCard
                      text="Order by gender"
                      graph={
                        <DonutChart
                          data={chartData}
                          width={"200"}
                          height={"200"}
                          cutout={true}
                        />
                      }
                    />
                  </div>
                  <div className="md:w-1/2  w-full mt-4 md:mt-0">
                    <ChatCard
                      text="Order by top location"
                      graph={<HorizontalChat data={top4Location} />}
                    />
                  </div>
                </div>
                <div
                  className={`${classes.second_container} block md:flex items-center mt-4`}
                >
                  <div className="w-full flex items-center">
                    <ChatCard
                      text="Orders by product"
                      graph={<HorizontalChat data={top4Location} />}
                    />
                  </div>
                </div>
              </div>

              <div className="block md:flex w-full gap-4  mt-4 md:h-[32rem] h-[35rem]">
                <div
                  className={`${classes.first_container} flex gap-4 mt-3 w-full `}
                >
                  <div className="w-full shadow-md bg-white rounded-[12px] p-6 block">
                    <VerticalBarGraph />
                  </div>
                </div>

                <div className={`${classes.second_container} flex  mt-4`}>
                  <div className="bg-white rounded-[12px] w-full flex gap-4 h-full ">
                    {
                      <div className="p-3 text-dark w-full">
                        <RecentOrder orders={orders} />
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
