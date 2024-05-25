"use client";
import { useState, useEffect, useRef } from "react";
import ChatCard from "@/components/Chat/ChatCard";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import classes from "./index.module.css";
import DonutChart from "@///components/Chat/DoughnutChat";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import VerticalBarGraph from "@/components/VerticalBarGraph";
import UpdateComponent from "@/components/UpdateComponent";
import RecentOrder from "@/components/RecentOrder";
import { getRequest } from "@/api/method";
import MobileSideBar from "@/components/MobileSideBar";
import getVendorDetails from "@/api/request";
import { setUserDetails } from "@/utils/localstorage";
import Loader from "@/components/Loader";
const Dashboard = () => {
  const mobileNavRef = useRef();
  const [totalCustomer, setTotalCustomer] = useState("0");
  const [customerLocation, setCustomerLocation] = useState("");
  const [loadPage, setLoadPage] = useState(true);
  const [top4Location, setTop4Location] = useState([]);
  const [top4Product, setTop4Product] = useState([]);

  // const [totalCustomer, setTotalCustomer] = useState("0");

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
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = (e) => {
    console.log(e);
    setShowMobileNav(!showMobileNav);
  };
  const getTotalCustomers = async () => {
    try {
      const custmerResponse = await getRequest(
        "/vendor/customers/total-customers-sold-to"
      );
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
  const get4Topproduct = async () => {
    try {
      const productData = [];
      const response = await getRequest(
        "/vendor/dashboard/orders/top-products"
      );
      response?.data?.data?.topProducts.map((product) => {
        console.log(product);
        const singleProduct = {
          location: product.name,
          female: (product.female / response?.data?.data?.totalOrders) * 100,
          male: (product.male / response?.data?.data?.totalOrders) * 100,
        };
        productData.push(singleProduct);
      });

      console.log(productData);
      setTop4Product(productData);
      // const singleLocatin = {
      //   location: location.location,
      //   female: (location.female / response?.data?.data?.totalOrders) * 100,
      //   male: (location.male / response?.data?.data?.totalOrders) * 100,
      // };
      // setCustomerLocation(response.data.totalCount);
      // response?.data?.data?.locations.map((location) => {
      //   const singleLocatin = {
      //     location: location.location,
      //     female: (location.female / response?.data?.data?.totalOrders) * 100,
      //     male: (location.male / response?.data?.data?.totalOrders) * 100,
      //   };
      //   locationData.push(singleLocatin);
      // });
      // setTop4Location(locationData);
    } catch (error) {}
  };

  useEffect(() => {
    getTotalCustomers();
    getLocationWithHighestCustomer();
    get4TopLocation();
    get4Topproduct();
  }, []);

  return (
    <div>
      {loadPage ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-gray-400 w-full h-full">
          <div className="">
            <SideBar active="Dashboard" />
              <MobileSideBar showMobileNav={showMobileNav} active="Dashboard" closeSideBar={showSideBar} />
          </div>
          <div className="w-full">
            <div className="p-4">
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
              className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4`}
            >
              <DashboardTopCard
                name="Total Order"
                total={totalCustomer}
                percentage="2.5"
                bgColor="bg-[#57CAEB]"
                link="link"
                icon={vendorIcon}
                addMaxWidth={true}
              />
              <DashboardTopCard
                name="Achieved Order"
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
            <div className=" bg-[#F8F9FA] px-4">
              <div className="flex items-center justify-between mb-2 mt-4">
                <UpdateComponent />
                <div className="hidden lg:block">
                  {/* <DropDown
              placeholder={"Vendor’s status"}
              value={dropDownValue}
              setValue={(data) => {
                setDropDownValue(data);
              }}
              data={dropdownData}
            /> */}
                </div>
              </div>
              <div className="block lg:flex items-center w-full gap-4 border-solid solid-[1px] border-primary z-[0]">
                <div
                  className={`${classes.first_container} block lg:flex items-center gap-4 mt-4 w-full`}
                >
                  <div className="lg:w-1/2 w-full">
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
                  <div className="lg:w-1/2  w-full mt-4 lg:mt-0">
                    <ChatCard
                      text="Order by top location"
                      graph={<HorizontalChat data={top4Location} />}
                    />
                  </div>
                </div>
                <div
                  className={`${classes.second_container} block lg:flex items-center mt-4`}
                >
                  <div className="w-full flex items-center">
                    <ChatCard
                      text="Orders by product"
                      graph={<HorizontalChat data={top4Product} />}
                    />
                  </div>
                </div>
              </div>

              <div className="block lg:flex w-full gap-4  mt-4 lg:h-[32rem] h-[35rem]">
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
