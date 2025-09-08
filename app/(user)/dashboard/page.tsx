"use client";
import { useState, useEffect, useRef } from "react";
import ChatCard from "@/components/Chat/ChatCard";
import HorizontalChat from "@/components/Chat/HorizontalChart";
import DashboardTopCard from "@/components/DashboardTopCard";
// Removed CSS module import - migrated to Tailwind classes
import DonutChart from "@///components/Chat/DoughnutChat";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import TotalOrderIcon from "../../../public/assets/svg/TotalOrder-Icon.svg";
import TotalearningIcon from "../../../public/assets/svg/Totalearning-icon.svg";
import CartIcon from "../../../public/assets/svg/customer-carticon.svg";
import VerticalBarGraph from "@/components/VerticalBarGraph";
import RecentOrder from "@/components/RecentOrder";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";

interface LocationData {
  location: string;
  female: number;
  male: number;
}

interface ProductData {
  location: string;
  female: number;
  male: number;
}

interface GenderByOrder {
  labels: string[];
  values: number[];
  colors: string[];
  borderAlign: string;
}

interface Order {
  status: string;
  [key: string]: any;
}

interface DailyData {
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [totalCustomer, setTotalCustomer] = useState<string>("0");
  const [topEarning, setTopEarning] = useState<string>("0");
  const [totalReturn, setTotalReturn] = useState<string>("0");
  const [totalOrder, setTotalOrder] = useState<string>("0");
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [top4Location, setTop4Location] = useState<LocationData[]>([]);
  const [top4Product, setTop4Product] = useState<ProductData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dailyEarnings, setDailyEarning] = useState<DailyData[]>([]);
  const [dailyOrder, setDailyOrder] = useState<DailyData[]>([]);
  const [customerLocation, setCustomerLocation] = useState<any>(null);

  const [genderByOrder, setGenderByOrder] = useState<GenderByOrder>({
    labels: ["Male", "Female"],
    values: [0, 0],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  });

  const getTotalCustomers = async (): Promise<void> => {
    try {
      const custmerResponse = await getRequest(
        "/vendor/customers/total-customers-sold-to"
      );
      setTotalCustomer(custmerResponse.data.totalCount);
    } catch (error) { }
  };

  const getLocationWithHighestCustomer = async (): Promise<void> => {
    try {
      const response = await getRequest(
        "/vendor/customers/highest-customers-by-location"
      );
      response.data && setLoadPage(false);
      setCustomerLocation(response.data.totalCount);

    } catch (error) { }
  };

  const get4TopLocation = async (): Promise<void> => {
    try {
      const locationData: LocationData[] = [];
      const response = await getRequest(
        "/vendor/dashboard/orders/top-locations"
      );
      response?.data?.data?.locations.map((location: any) => {
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

  const get4Topproduct = async (): Promise<void> => {
    try {
      const productData: ProductData[] = [];
      const response = await getRequest(
        "/vendor/dashboard/orders/top-products"
      );
      response?.data?.data?.topProducts.map((product: any) => {
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

  const getTotalOrder = async (): Promise<void> => {
    try {
      let response = await getRequest("/vendor/orders");
      if (response.data) {
        setTotalOrder(response.data.data.length);
      }
    } catch (error) { }
  };

  const getOrderByGender = async (): Promise<void> => {
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

  const getTotalEarning = async (): Promise<void> => {
    try {
      const response = await getRequest("/vendor/dashboard/earnings");
      if (response.data) {
        setTopEarning(response.data.data.earnings);
      }
    } catch (error) { }
  };

  const getOrders = async (): Promise<void> => {
    try {
      const response = await getRequest("/vendor/orders");
      setTotalReturn(
        response.data.data.filter((item) => item.status === "return").length
      );
      setRecentOrders(response.data.data);
      setPageLoading(false);
    } catch (error) { }
  };

  const getDailyEarning = async (): Promise<void> => {
    try {
      const response = await getRequest(
        "/vendor/dashboard/daily-earnings?filter=thisMonth"
      );
      if (response.data) {
        setDailyEarning(response.data.data);
      }
    } catch (error) { }
  };

  const getDailyOrder = async (): Promise<void> => {
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
                className="scrollbar-hide flex items-center gap-4 overflow-x-scroll px-4 bg-transparent py-2"
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
              <div className=" bg-[#F8F9FA] px-4 lg:px-0">
                <div className="md:flex block lg:flex items-center w-full md:gap-[21px] gap-4 ">
                  <div
                    className="w-full md:w-2/3 block lg:flex items-center md:gap-[21px] gap-4 mt-4 md:flex"
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
                    className="w-full md:w-1/3 block lg:flex items-center mt-4"
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
                    className="w-full md:w-2/3 block md:flex md:gap-[21px] gap-4 mt-3"
                  >
                    <div className="w-full  bg-white rounded-[12px] p-6 block  shadow-[0px_4px_10px_#AEAEC026] ">
                      <VerticalBarGraph name="Earning" data={dailyEarnings} />
                    </div>
                    <div className="w-full bg-white rounded-[12px] p-6 block mt-4 md:mt-0  shadow-[0px_4px_10px_#AEAEC026] ">
                      <VerticalBarGraph name="Order Count" data={dailyOrder} />
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 flex mt-4">
                    <div className="bg-white rounded-[12px] w-full flex gap-4 h-full  shadow-[0px_4px_10px_#AEAEC026]  ">
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
