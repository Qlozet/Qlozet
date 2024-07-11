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
import moment from "moment";

const Dashboard = () => {
  const mobileNavRef = useRef();
  const [totalCustomer, setTotalCustomer] = useState("0");
  const [topEarning, setTopEarning] = useState("0");
  const [totalOrder, setTotalOrder] = useState("0");
  const [customerLocation, setCustomerLocation] = useState("");
  const [loadPage, setLoadPage] = useState(true);
  const [top4Location, setTop4Location] = useState([]);
  const [top4Product, setTop4Product] = useState([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [genderByOrder, setGenderByOrder] = useState({
    labels: ["Male", "Female"],
    values: [0, 0],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  });

  const showSideBar = () => {
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
        const singleProduct = {
          location: product.name,
          female: (product.female / response?.data?.data?.totalOrders) * 100,
          male: (product.male / response?.data?.data?.totalOrders) * 100,
        };
        productData.push(singleProduct);
      });

      setTop4Product(productData);
    } catch (error) {}
  };

  const getTotalOrder = async () => {
    try {
      let response = await getRequest("/vendor/orders");
      if (response.data) {
        setTotalOrder(response.data.data.length);
      }
    } catch (error) {}
  };

  const getOrderByGender = async () => {
    try {
      const productData = [];
      const response = await getRequest("/vendor/dashboard/orders/tag");
      if (response?.data) {
        setGenderByOrder({
          labels: ["Male", "Female"],
          values: [response?.data.data.male, response?.data.data.female],
          colors: ["#3E1C01", "#9C8578"],
          borderAlign: "center",
        });
      }
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

  const getTotalEarning = async () => {
    try {
      const response = await getRequest("/vendor/dashboard/earnings");
      if (response.data) {
        setTopEarning(response.data.data.earnings);
      }
    } catch (error) {}
  };

  const getOrders = async () => {
    try {
      const response = await getRequest("/vendor/orders");
      let ordersData = [];
      response.data.data.map((order) => {
        let DeliveryStatus;
        if (order.status === "out-for-delivery") {
          DeliveryStatus = { name: "Out for delivery", bg: "bg-[#D4CFCA]" };
        } else if (order.status === "return") {
          DeliveryStatus = { name: "Return", bg: "bg-[#D4CFCA]" };
        } else {
          DeliveryStatus = { name: "Return", bg: "bg-[#D4CFCA]" };
        }
        // let orderItem = {
        //   orderId: order.orderId,
        //   date: moment(order.orderDate).format("YYYY-MM-DD"),
        //   productName: order.orderItems.map((product) => {
        //     return product.name;
        //   }),
        //   productPrice: calculatePrice(order.orderItems),
        //   customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        //   customerPhoneNumber: order.customer.phoneNumber,
        //   customerEmail: order.customer.email,
        //   AmountPaid: `₦${order.amountPaid.toLocaleString()}`,
        //   shippingAddress: order.shippingAddress,
        //   custmerAddress: order.shippingAddress,
        //   DeliveryStatus: DeliveryStatus,
        //   createdAt: order.orderDate,
        // };
        let orderItem = {
          id: 1,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          date: moment(order.orderDate).format("YYYY-MM-DD"),
          product: order.orderItems.map((product) => {
            return product.name;
          })[0],
          price: `₦${order.amountPaid.toLocaleString()}`,
          quantity: 1,
          status: "Ready to Ship",
        };
        ordersData.push(orderItem);
      });
      setRecentOrders(ordersData);
      setPageLoading(false);
    } catch (error) {}
  };

  useEffect(() => {
    getTotalEarning();
    getTotalCustomers();
    getOrders();
    getLocationWithHighestCustomer();
    get4TopLocation();
    get4Topproduct();
    getOrderByGender();
    getTotalOrder();
  }, []);

  return (
    <section>
      {loadPage ? (
        <Loader></Loader>
      ) : (
        <div className={`flex bg-gray-400 w-full h-full`}>
          <div className="">
            <SideBar active="Dashboard" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Dashboard"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full">
            <div className="p-4">
              <DasboardNavWithOutSearch
                addSearch={false}
                setValue={(data) => {}}
                name="Dashboard"
                showSideBar={showSideBar}
              />
            </div>

            <div
              className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4 `}
            >
              <DashboardTopCard
                name="Total Order"
                total={totalOrder}
                percentage="2.5"
                bgColor="bg-[#57CAEB]"
                link="link"
                icon={TotalOrderIcon}
              />
              <DashboardTopCard
                name="Total earnings"
                total={topEarning}
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={TotalearningIcon}
              />
              <DashboardTopCard
                name="Total Customers"
                total={totalCustomer}
                percentage="2.5"
                bgColor="bg-[#FF7976]"
                icon={customerIcon}
              />

              <DashboardTopCard
                name="Total returns"
                total="10"
                percentage="2.5"
                bgColor="bg-[#FF3A3A]"
                icon={CartIcon}
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
                  <DropDown
                    data={[
                      "This week",
                      "Last week",
                      "Last month",
                      "This month",
                      "Choose month",
                      "Custom",
                    ]}
                    maxWidth={"max-w-[7.5rem]"}
                    placeholder="Time Range"
                    setValue={(data) => {}}
                    bg={"bg-white"}
                  />
                </div>
              </div>
              <div className="md:flex block lg:flex items-center w-full md:gap-2 gap-4 border-solid solid-[1px] border-primary z-[0]">
                <div
                  className={`${classes.first_container} block lg:flex items-center md:gap-2 gap-4 mt-4 w-full md:flex`}
                >
                  <div className="lg:w-1/2 w-full">
                    <ChatCard
                      text="Order by gender"
                      graph={
                        <DonutChart
                          data={genderByOrder}
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
              <div className="block md:flex lg:flex w-full gap-4  mt-4 ">
                <div
                  className={`${classes.first_container} block md:flex md:gap-4 mt-3 w-full `}
                >
                  <div className="w-full shadow-md bg-white rounded-[12px] p-6 block">
                    <VerticalBarGraph />
                  </div>
                  <div className="w-full shadow-md bg-white rounded-[12px] p-6 block mt-4 md:mt-0">
                    <VerticalBarGraph />
                  </div>
                </div>

                <div className={`${classes.second_container} flex  mt-4`}>
                  <div className="bg-white rounded-[12px] w-full flex gap-4 h-full ">
                    {
                      <div className="p-3 text-dark w-full">
                        <RecentOrder orders={recentOrders} />
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
