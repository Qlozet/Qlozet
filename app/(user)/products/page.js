"use client";
import { useEffect, useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import shoppingBag from "../../../public/assets/svg/shipping_bag.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/components/Typography";
import Modal from "@/components/Modal";
import CustomerDetails from "@/components/order/CustomerDetails";
import OrderHistory from "@/components/Customer/OrderHistory";
import DonutChart from "@/components/Chat/DoughnutChat";
import classes from "./index.module.css";
import MobileSideBar from "@/components/MobileSideBar";
import UpdateComponent from "@/components/UpdateComponent";
import ProductTable from "@/components/Products/ProductTable";
import addIcon from "../../../public/assets/svg/add-square.svg";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getRequest } from "@/api/method";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import Loader from "@/components/Loader";
import { clearProductId } from "@/utils/localstorage";
import DropDown from "@/components/DropDown";
import moment from "moment";

const Products = () => {
  const router = useRouter();
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProduct, setFilterdProduct] = useState([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const chartData = {
    labels: ["Suit", "Kaftan", "Cargo", "Abgada"],
    values: [50, 25, 25, 25],
    colors: ["#3E1C01", "#9C8578", "#F6E9DD", "#BE7D42"],
    borderAlign: "center",
  };
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
  const toggleStatus = () => {
    setIsLoading(true);
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

  const getProducts = async () => {
    try {
      let response = await getRequest("/vendor/products/all");
      let productData = [];
      if (response?.data) {
        response?.data?.data?.map((product) => {
          console.log(product);
          let productStatus;
          if (product.status) {
            productStatus = {
              text: "Active",
              bgColor: "bg-success-300",
              color: "text-[#33CC33]",
            };
          } else {
            productStatus = {
              text: "Inactive",
              bgColor: "bg-[#FFF5F5]",
              color: "text-[#FF3A3A]",
            };
          }
          let orderItem = {
            id: product._id,
            picture: product.images[0]?.secure_url
              ? product.images[0]?.secure_url
              : "",
            productName: product.name,
            productPrice: `₦${parseInt(product.price).toLocaleString()}`,
            category: "Two Piece",
            productType: product.type,
            tag: product.tag,
            quiantity: product.quantity,
            ProductStatus: productStatus,
            createdAt: product.createdAt,
          };
          productData.push(orderItem);
        });
        setProducts(productData);
        setFilterdProduct(productData);
        setIsLoading(false);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilfeterData = (data) => {
    setFilterdProduct(
      products.filter(
        (pro) =>
          pro.productName.toLowerCase().includes(data.toLowerCase()) ||
          pro.category.toLowerCase().includes(data.toLowerCase()) ||
          pro.tag.toLowerCase().includes(data.toLowerCase())
      )
    );
  };

  const handleFilterWithDate = (startDate, endDate) => {
    setFilterdProduct(
      products.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };
  useEffect(() => {
    getProducts();
  }, [isLoading]);
  return (
    <div>
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Products" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Products"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              name="Products"
              addSearch={true}
              setValue={(data) => {
                handleFilfeterData(data);
              }}
              showSideBar={showSideBar}
            />
            <div className="flex items-center justify-end py-6 gap-6">
              <div className="hidden lg:block">
                <Button
                  children={
                    <span className="flex justify-center items-center">
                      <span>Import Products</span>
                      <Image src={addIcon} className="ml-4" alt="" />
                    </span>
                  }
                  btnSize="small"
                  minWidth="min-w-[14rem]"
                  variant="primary"
                  clickHandler={() => {
                    setShowAddModal(true);
                  }}
                />
              </div>
              <div className="block lg:hidden">
                <Button
                  children={
                    <span className="flex justify-center items-center">
                      <span>Import</span>
                      <Image src={addIcon} className="ml-4" alt="" />
                    </span>
                  }
                  btnSize="small"
                  variant="=outline"
                  clickHandler={() => {
                    setShowAddModal(true);
                  }}
                />
              </div>
              <div>
                <Button
                  children={
                    <span className="flex justify-center items-center">
                      <span>Add new product</span>
                      <Image src={addIcon} className="ml-4" alt="" />
                    </span>
                  }
                  btnSize="small"
                  minWidth="min-w-[14rem]"
                  variant="primary"
                  clickHandler={() => {
                    router.push("/add");
                    clearProductId();
                  }}
                />
              </div>
            </div>
            <div
              className={` ${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll`}
            >
              <DashboardTopCard
                name="Total products"
                total={products.length}
                percentage="2.5"
                bgColor="bg-[#57CAEB]"
                link="link"
                icon={shoppingBag}
                addMaxWidth={true}
              />
              <DashboardTopCard
                name="Achieved products"
                total="10000"
                percentage="2.5"
                bgColor="bg-[#5DDAB4]"
                icon={shoppingBag}
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
            <div>
              <div className="relative">
                <div
                  className="flex items-center justify-between mt-14 mb-2"
                  style={{ zIndex: "20" }}
                >
                  <Typography
                    textColor="text-dark"
                    textWeight="font-bold"
                    textSize="text-[18px]"
                  >
                    Products
                  </Typography>
                  <div className="">
                    <DropDown
                      data={[
                        "This week",
                        "Last week",
                        "This month",
                        "Last month",
                        "Choose month",
                        "Custom",
                      ]}
                      maxWidth={"max-w-[8rem]"}
                      placeholder="Time Range"
                      setValue={(startDate, endDate) => {
                        handleFilterWithDate(startDate, endDate);
                      }}
                      zIndex={80}
                    />
                  </div>
                </div>
              </div>
              <div className="my-4 block lg:hidden">
                <UpdateComponent />
              </div>
              <ProductTable
                data={filteredProduct}
                showModal={showModal}
                statusChangeHandler={toggleStatus}
                handleFilfeterData={handleFilfeterData}
              />
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
      )}
    </div>
  );
};

export default Products;
