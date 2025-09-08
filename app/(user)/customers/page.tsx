"use client";
import { useEffect, useState } from "react";
import DashboardTopCard from "@/components/DashboardTopCard";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/components/Typography";
import Modal from "@/components/Modal";
import CustomerDetails from "@/components/order/CustomerDetails";
import OrderHistory from "@/components/Customer/OrderHistory";
import CustomerTable from "@/components/Customer/CustomerTable";
// Removed CSS module import - migrated to Tailwind classes
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";
import CustomerMobileHistory from "@/components/Customer/CustomerHistoryTableItemMobile/CustomerHistoryMobile";
import Image from "next/image";
import defaultImage from "../../../public/assets/image/Rectangle.png";
import DropDown from "@/components/DropDown";
import moment from "moment";
import { useAppSelector } from "@/redux/store";
import { activeCheck, customerActiveCheck } from "@/utils/helper";
import { CustomerData, RawCustomerData } from "@/types";

interface CustomerTableItemData {
  picture?: string;
  customerName: string;
  status: { text: string; bgColor: string; color: string };
  totalOrders: number;
  lastOrderDate: string;
  phone: string;
  emailAddress: string;
  customerId: string;
}

const Customer: React.FC = () => {
  const filterData = useAppSelector((state) => state.filter.state);

  const [viewCustomerDetails, setCustomerDetails] = useState(false);
  const [showHostory, setShowHistory] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filterCustmers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [customer, setCustomer] = useState<CustomerData>({} as CustomerData);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);

  const closeModal = () => {
    setCustomerDetails(false);
    setShowHistory(false);
  };

  const showModal = (customerId: string) => {
    setCustomer(customers.filter((item) => item.customerId === customerId)[0]);
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
      let Customers: CustomerData[] = [];
      response && setPageLoading(false);
      if (response.data) {
        response?.data?.data.map((item: RawCustomerData) => {
          const status = customerActiveCheck(item.status)
          const customer: CustomerData = {
            customerId: item.customerId,
            picture: item.picture,
            customerName: `${item.firstName} ${item.lastName}`,
            status: status.text,
            totalOrders: item.totalOrders,
            lastOrderDate: item.lastOrderDate,
            phone: item.phoneNumber,
            emailAddress: item.email,
            createdAt: item.lastOrderDate,
          };
          Customers.push(customer);
        });
        setCustomers(Customers);
        setFilteredCustomers(Customers);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterData = (data: string) => {
    setFilteredCustomers(
      customers.filter(
        (cus) =>
          cus.customerName.toLowerCase().includes(data.toLowerCase()) ||
          cus.emailAddress.toLowerCase().includes(data.toLowerCase())
      )
    );
  };

  const handleFilterWithDate = (startDate: number, endDate: number) => {
    setFilteredCustomers(
      customers.filter(
        (item) =>
          moment(item.createdAt).valueOf() >= startDate &&
          moment(item.createdAt).valueOf() <= endDate
      )
    );
  };

  useEffect(() => {
    handleFilterData(filterData);
  }, [filterData]);


  useEffect(() => {
    getCustomers();
  }, []);
  return (
    <section className="mx-auto relative">
      <div className="flex bg-[#F8F9FA] ">
        <div className="w-full p-4 ">
          {pageLoading ? (
            <Loader small={false} height={50} width={50}></Loader>
          ) : (
            <div>
              {!viewCustomerDetails && (
                <div
                  className="scrollbar-hide flex items-center gap-4 overflow-x-scroll"
                >
                  <DashboardTopCard
                    name="Total Customers"
                    total={`${customers.length}`}
                    percentage="2.5"
                    bgColor="bg-[#57CAEB]"
                    link="/customers"
                    icon={vendorIcon}
                    addMaxWidth={true}
                    minHeight="min-h-[9rem]"
                  />
                  <DashboardTopCard
                    name="Highest customer by location"
                    total="Lagos state"
                    percentage="2.5"
                    bgColor="bg-[#5DDAB4]"
                    link="/customers"
                    icon={customerIcon}
                    addMaxWidth={true}
                    minHeight="min-h-[9rem]"
                  />
                </div>
              )}
              {!viewCustomerDetails && (
                <div className="">
                  <div className="items-center justify-between mt-14 mb-2 hidden md:flex">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-[18px]"
                    >
                      Customer
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
                        setValue={(start?: number, end?: number | string, value?: string) => {
                          if (start !== undefined && typeof end === 'number') {
                            handleFilterWithDate(start, end);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <CustomerTable
                      data={filterCustmers.map(customer => ({
                        picture: customer.picture || '',
                        customerName: customer.customerName,
                        status: typeof customer.status === 'string' 
                          ? customerActiveCheck(customer.status)
                          : customer.status,
                        totalOrders: customer.totalOrders,
                        lastOrderDate: customer.lastOrderDate,
                        phone: customer.phone,
                        emailAddress: customer.emailAddress,
                        customerId: customer.customerId,
                      }))}
                      viewDetails={showModal}
                      showModal={showModal}
                      handleFilterWithDate={(startDate: string, endDate: string) => {
                        const start = new Date(startDate).getTime();
                        const end = new Date(endDate).getTime();
                        handleFilterWithDate(start, end);
                      }}
                      handleFilterData={handleFilterData}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <Modal
            show={viewCustomerDetails}
            closeModal={closeModal}
            content={
              <>{viewCustomerDetails && (<CustomerDetails
                customer={{
                  picture: customer.picture || '',
                  customerName: customer.customerName,
                }}
                topNavData={topNavData}
                closeModal={closeModal}
              />)}</>

            }
          ></Modal>
          <Modal
            show={showHostory}
            closeModal={closeModal}
            content={
              <>{showHostory && (<OrderHistory
                topNavData={topNavData}
                closeModal={closeModal}
                customerHistory={customerHistory}
              />)}</>

            }
          ></Modal>

        </div>
      </div>

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
                      textSize="text-xs"
                    >
                      Name
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-xs"
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
                      textSize="text-xs"
                    >
                      Email address
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-xs"
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
                      textSize="text-xs"
                    >
                      Phone number 1
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-xs"
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
                      textSize="text-xs"
                    >
                      Phone number 2
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-xs"
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
                      textSize="text-xs"
                    >
                      Shipping address
                    </Typography>
                  </div>
                  <div className="flex-1">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-bold"
                      textSize="text-xs"
                    >
                      No address provided
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
                setValue={(data) => { }}
              />
            </div>
            <CustomerMobileHistory 
              history={{
                transactionId: "N/A",
                amount: "N/A"
              }}
              index={0}
            />
            <CustomerMobileHistory 
              history={{
                transactionId: "N/A",
                amount: "N/A"
              }}
              index={1}
            />
            <CustomerMobileHistory 
              history={{
                transactionId: "N/A",
                amount: "N/A"
              }}
              index={2}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Customer;
