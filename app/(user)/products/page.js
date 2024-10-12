"use client";
import { useEffect, useState } from "react";
// Svg import starts
import addIcon from "../../../public/assets/svg/add-square.svg";
import importIcon from '../../../public/assets/svg/import.svg'
import shoppingBag from "../../../public/assets/svg/shipping_bag.svg";

// Components import start
import DashboardTopCard from "@/components/DashboardTopCard";
import Typography from "@/components/Typography";
import Modal from "@/components/Modal";
import CustomerDetails from "@/components/order/CustomerDetails";
import OrderHistory from "@/components/Customer/OrderHistory";
import DonutChart from "@/components/Chat/DoughnutChat";
import ProductTable from "@/components/Products/ProductTable";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import DropDown from "@/components/DropDown";
import Toast from "@/components/ToastComponent/toast";
import Image from "next/image";

// stylse sheet 
import classes from "./index.module.css";

import { useRouter } from "next/navigation";
import { getRequest } from "@/api/method";
import { clearProductId } from "@/utils/localstorage";

import toast from "react-hot-toast";
import moment from "moment";

// redux
import { useAppSelector } from "@/redux/store";

const Products = () => {
  const filterData = useAppSelector((state) => state.filter.state);
  const router = useRouter();
  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProduct, setFilterdProduct] = useState([]);
  const [activatedProduct, setActivatedProduct] = useState(0);
  const [tagData, setTagData] = useState({
    labels: ["Male", "Female"],
    values: [0, 0],
    colors: ["#9C8578", "#3E1C01"],
    borderAlign: "center",
  });

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
        setActivatedProduct(
          response?.data.data.filter((product) => product.status).length
        );
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
            variantCount: product.variants.length,
          };
          productData.push(orderItem);
        });
        setTagData((prevData) => {
          return {
            ...prevData,
            values: [
              productData.filter((prod) => prod.tag === "male").length,
              productData.filter((prod) => prod.tag === "female").length,
            ],
          };
        });
        setProducts(productData);
        setFilterdProduct(productData);
        setIsLoading(false);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
    }
  };

  const handleFilterData = (data) => {
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
    handleFilterData(filterData)
  }, [filterData])

  useEffect(() => {
    getProducts();
  }, [isLoading]);
  return (
    <section>
      <div className="flex bg-[#F8F9FA]">
        <div className="w-full p-4">
          {isLoading ? (
            <Loader></Loader>
          ) : (
            <div>
              <div className="flex items-center justify-end py-6 gap-6">
                <div className="block">
                  <Button
                    children={
                      <span className="flex justify-center items-center">
                        <span>Import</span> <span className="hidden lg:block ml-[2px]"> Product</span>
                        <Image src={importIcon} className="ml-4" alt="" />
                      </span>
                    }
                    btnSize="small"
                    minWidth="min-w-[8rem] lg:min-w-[14rem]"
                    variant="outline"
                    clickHandler={() => {
                      router.push("/add");
                      clearProductId();
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
                    minWidth="lg:min-w-[14rem]"
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
                  icon={shoppingBag}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name="Activated products"
                  total={activatedProduct}
                  percentage="2.5"
                  bgColor="bg-[#5DDAB4]"
                  icon={shoppingBag}
                  addMaxWidth={true}
                />
                <div
                  className={`px-6 py-4 flex bg-white rounded-[12px] mt-4 max-w-[300px] w-full min-w-[300px]`}
                >
                  <DonutChart data={tagData} width={"90"} height={"90"} />
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
                          Female
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <span className="w-[10px] h-[10px] rounded-[50%] bg-primary-200"></span>
                        <Typography
                          textColor="text-black"
                          textWeight="font-[400]"
                          textSize="text-[12px]"
                        >
                          Male
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
                    <div className="relative" style={{ zIndex: 500 }}>
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
                        zIndex={5000}
                      />
                    </div>
                  </div>
                </div>
                <ProductTable
                  data={filteredProduct}
                  showModal={showModal}
                  statusChangeHandler={toggleStatus}
                  handleFilterData={handleFilterData}
                />
              </div>
            </div>
          )}
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
    </section>
  );
};

export default Products;
