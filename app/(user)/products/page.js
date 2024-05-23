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

const Products = () => {
  const router = useRouter();
  const [dropDownValue, setDropDownValue] = useState("");
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
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

  const removeItemfromArray = (itemId) => {};
  const getProducts = async () => {
    try {
      let response = await getRequest("/vendor/products/all");
      let productData = [];
      if (response?.data) {
        response?.data?.data?.map((product) => {
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
            picture: product.images[0]?.url ? product.images[0]?.url : "",
            productName: product.name,
            productPrice: product.price,
            category: "Two Piece",
            productType: product.type,
            tag: product.tag,
            quiantity: product.quantity,
            ProductStatus: productStatus,
          };
          productData.push(orderItem);
        });
        setProducts(productData);
        setIsLoading(false);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      console.log(error);
      error?.message && toast(<Toast text={error?.message} type="danger" />);
      error?.data && toast(<Toast text={error?.data} type="danger" />);
    }
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
            <div className="flex items-center justify-end py-6 gap-6">
              <div className="hidden md:block">
                <Button
                  children={
                    <span className="flex justify-center items-center">
                      <span>Import Products</span>
                      <Image src={addIcon} className="ml-4" />
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
              <div className="block md:hidden">
                <Button
                  children={
                    <span className="flex justify-center items-center">
                      <span>Import</span>
                      <Image src={addIcon} className="ml-4" />
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
                      <Image src={addIcon} className="ml-4" />
                    </span>
                  }
                  btnSize="small"
                  minWidth="min-w-[14rem]"
                  variant="primary"
                  clickHandler={() => {
                    router.push("/products/add");
                    clearProductId();
                  }}
                />
              </div>
            </div>
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
              <ProductTable
                data={products}
                showModal={showModal}
                statusChangeHandler={toggleStatus}
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
