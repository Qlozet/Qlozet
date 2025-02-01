"use client";
import { useState, useEffect, useRef } from "react";
import ChatCard from "@/components/Chat/ChatCard";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DashboardTopCard from "@/components/DashboardTopCard";
import classes from "./index.module.css";
import DonutChart from "@///components/Chat/DoughnutChat";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import TotalOrderIcon from "../../../public/assets/svg/TotalOrder-Icon.svg";
import TotalearningIcon from "../../../public/assets/svg/Totalearning-icon.svg";
import CartIcon from "../../../public/assets/svg/customer-carticon.svg";
import VerticalBarGraph from "@/components/VerticalBarGraph";
import RecentOrder from "@/components/RecentOrder";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";
const Dashboard = () => {
  const [totalCustomer, setTotalCustomer] = useState("0");
  const [topEarning, setTopEarning] = useState("0");
  const [totalReturn, setTotalReturn] = useState("0");
  const [totalOrder, setTotalOrder] = useState("0");
  const [loadPage, setLoadPage] = useState(true);
  const [top4Location, setTop4Location] = useState([]);
  const [top4Product, setTop4Product] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dailyEarnings, setDailyEarning] = useState([]);
  const [dailyOrder, setDailyOrder] = useState([]);

  const [genderByOrder, setGenderByOrder] = useState({
    labels: ["Male", "Female"],
    values: [0, 0],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  });

  const getTotalCustomers = async () => {
    try {
      const custmerResponse = await getRequest(
        "/vendor/customers/total-customers-sold-to"
      );
      setTotalCustomer(custmerResponse.data.totalCount);
    } catch (error) { }
  };

  const getLocationWithHighestCustomer = async () => {
    try {
      const response = await getRequest(
        "/vendor/customers/highest-customers-by-location"
      );
      response.data && setLoadPage(false);
      setCustomerLocation(response.data.totalCount);

    } catch (error) { }
  };

  const get4TopLocation = async () => {
    try {
      const locationData = [];
      const response = await getRequest(
        "/vendor/dashboard/orders/top-locations"
      );
      response?.data?.data?.locations.map((location) => {
        const singleLocatin = {
          location: location.location,
          female: (location.female / response?.data?.data?.totalOrders) * 100,
          male: (location.male / response?.data?.data?.totalOrders) * 100,
        };
        locationData.push(singleLocatin);
      });
      setTop4Location(locationData);
      await setCustomerLocation(response.data.totalCount);
    } catch (error) {

    }
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
    } catch (error) { }
  };

  const getTotalOrder = async () => {
    try {
      let response = await getRequest("/vendor/orders");
      if (response.data) {
        setTotalOrder(response.data.data.length);
      }
    } catch (error) { }
  };

  const getOrderByGender = async () => {
    try {
      const response = await getRequest("/vendor/dashboard/orders/tag");
      if (response?.data) {
        setGenderByOrder({
          labels: ["Male", "Female"],
          values: [response?.data.data.male, response?.data.data.female],
          colors: ["#3E1C01", "#9C8578"],
          borderAlign: "center",
        });
      }
    } catch (error) { }
  };

  const getTotalEarning = async () => {
    try {
      const response = await getRequest("/vendor/dashboard/earnings");
      if (response.data) {
        setTopEarning(response.data.data.earnings);
      }
    } catch (error) { }
  };

  const getOrders = async () => {
    try {
      const response = await getRequest("/vendor/orders");
      setTotalReturn(
        response.data.data.filter((item) => item.status === "return").length
      );
      setRecentOrders(response.data.data);
      setPageLoading(false);
    } catch (error) { }
  };

  const getDailyEarning = async () => {
    try {
      const response = await getRequest(
        "/vendor/dashboard/daily-earnings?filter=thisMonth"
      );
      if (response.data) {
        setDailyEarning(response.data.data);
      }
    } catch (error) { }
  };

  const getDailyOrder = async () => {
    try {
      const response = await getRequest(
        "/vendor/orders/daily-order?filter=thisMonth"
      );
      if (response.data) {
        console.log(response.data.data)
        setDailyOrder(response.data.data);
      }
    } catch (error) { }
  };

  useEffect(() => {
    getDailyOrder();
    getDailyEarning();
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
      <div className={`flex bg-gray-400 w-full h-full`}>
        <div className="w-full mb-[2rem]">
          {loadPage ? (
            <Loader></Loader>
          ) : (
            <div>
              <div
                className={`${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll px-4 `}
              >
                <DashboardTopCard
                  name="Total Order"
                  total={totalOrder}
                  percentage="2.5"
                  bgColor="bg-[#57CAEB]"
                  link="orders"
                  icon={TotalOrderIcon}
                  addMaxWidth={false}
                />
                <DashboardTopCard
                  name="Total earnings"
                  total={topEarning.toLocaleString()}
                  percentage="2.5"
                  bgColor="bg-[#5DDAB4]"
                  icon={TotalearningIcon}
                  addMaxWidth={false}
                />
                <DashboardTopCard
                  name="Total Customers"
                  total={totalCustomer}
                  percentage="2.5"
                  bgColor="bg-[#FF7976]"
                  icon={customerIcon}
                  addMaxWidth={false}
                />

                <DashboardTopCard
                  name="Total returns"
                  total={totalReturn}
                  percentage="2.5"
                  bgColor="bg-[#FF3A3A]"
                  icon={CartIcon}
                  addMaxWidth={false}
                />
              </div>
              <div className=" bg-[#F8F9FA] px-4">

                <div className="md:flex block lg:flex items-center w-full md:gap-[21px] gap-4 ">
                  <div
                    className={`${classes.first_container} block lg:flex items-center md:gap-[21px] gap-4 mt-4 w-full md:flex`}
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
                <div className="block md:flex lg:flex w-full md:gap-[21px] gap-4 mt-4 ">
                  <div
                    className={`${classes.first_container} block md:flex md:gap-[21px] gap-4 mt-3 w-full `}
                  >
                    <div className="w-full  bg-white rounded-[12px] p-6 block">
                      <VerticalBarGraph name="Earning" data={dailyEarnings} />
                    </div>
                    <div className="w-full bg-white rounded-[12px] p-6 block mt-4 md:mt-0">
                      <VerticalBarGraph name="Order Count" data={dailyOrder} />
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
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
