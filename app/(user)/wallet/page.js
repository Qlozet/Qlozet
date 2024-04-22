"use client";
import { useState } from "react";
import ChatCard from "@/app/components/Chat/ChatCard";
import HorizontalChat from "@/app/components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@/app/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/app/components/DashboardTopCard";
import SideBar from "@/app/components/SideBar";
import classes from "./index.module.css";
import DonutChart from "@/app/components/Chat/DoughnutChat";
import DropDown from "@/app/components/DropDown";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/app/components/Typography";
import OrderTable from "@/app/components/order/OrderTable";
import Modal from "@/app/components/Modal";
import SetTotalOrderPerDay from "@/app/components/SetTotalItemPerDayForm";
import OrderDetails from "@/app/components/order/OrderDetails";
import TrackOrder from "@/app/components/order/TrackOrders";
import RejectOrderModal from "@/app/components/order/RejectOrderModal";
import CustomerDetails from "@/app/components/order/CustomerDetails";
import Button from "@/app/components/Button";
import WalletTable from "@/app/components/Wallet/WalletTable";
import RequestCategoryForm from "@/app/components/Settings/Category/RequestANewProductcategoryForm";
import SetUpAltireWallet from "@/app/components/Wallet/SetUpAltireWallet";
import TransactionDetails from "@/app/components/Wallet/TransactionDetails";
import SendMoney from "@/app/components/Wallet/SendMoney";
import SendMoneyForm from "@/app/components/Wallet/SendMoneyForm";
const Wallet = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [setUpWalletWallet, setSetUpWalletWallet] = useState(false);
  const [showTransactiondetails, setShowTransactiondetails] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(true);
  const [rejectModal, setShowReject] = useState(false);
  const [total, setShowTotal] = useState(false);
  const handleShowViewDetailModal = () => {
    setOrderDetails(true);
  };

  const data = [
    {
      location: "Warri",
      total: "w-[70%]",
      percentage: "w-[50%]",
    },
    {
      location: "Benin",
      total: "w-[60%]",
      percentage: "w-[53%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
    {
      location: "Aba",
      total: "w-[44%]",
      percentage: "w-[40%]",
    },
  ];

  const dropdownData = [
    {
      text: "This week",
      color: "",
    },
    {
      text: "Last week",
      color: "",
    },
    {
      text: "Last month",
      color: "",
    },
    {
      text: "This month",
      color: "",
    },
    {
      text: "Choose month",
      color: "",
    },
    {
      text: "Custom",
      color: "",
    },
  ];
  const chartData = {
    labels: ["Male", "Female"],
    values: [12, 19],
    colors: ["#3E1C01", "#9C8578"],
    borderAlign: "center",
  };

  const tableData = [
    {
      date: "Hello",
      transactionId: "Hello",
      transactionType: "Hello",
      narration: "Hello",
      amount: "Hello",
      status: "Hello",
    },
  ];
  const closeModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(false);
  };

  const showRejectModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(true);
  };

  const topNavData = [
    {
      item: "Order details",
      link: "",
      handleFunction: () => {
        setOrderDetails(true);
        setShowTrack(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Track order",
      link: "",
      handleFunction: () => {
        setShowTrack(true);
        setOrderDetails(false);
        setShowCustomer(false);
      },
    },
    {
      item: "Customer details",
      link: "",
      handleFunction: () => {
        setShowTrack(false);
        setOrderDetails(false);
        setShowCustomer(true);
      },
    },
  ];

  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Wallet" />
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={true}
          setValue={(data) => {
            // console.log(data);
          }}
        />
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
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
          </div>
          <div className="flex items-start gap-6 pt-5">
            <Button
              children="Send money"
              btnSize="large"
              variant="outline"
              minWidth="min-w-[10rem]"
              clickHandler={() => {
                // setStep(step + 1);
              }}
            />
            <Button
              children="Fund wallet"
              btnSize="large"
              variant="primary"
              minWidth="min-w-[10rem]"
              clickHandler={() => {
                setSetUpWalletWallet(true);
              }}
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mt-14 mb-2 ">
            <Typography
              textColor="text-black"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Wallet History
            </Typography>
            <div className="">
              <DropDown
                placeholder={"This week"}
                value={dropDownValue}
                setValue={(data) => {
                  setDropDownValue(data);
                }}
                data={dropdownData}
              />
            </div>
          </div>

          <WalletTable
            data={tableData}
            viewDetails={() => {
              handleShowViewDetailModal();
            }}
            showRejectModal={showRejectModal}
          />
        </div>
      </div>
      {/* <Modal content={<SetTotalOrderPerDay />}></Modal> */}
      {/* {showModal == true && ( */}
      {setUpWalletWallet && (
        <Modal
          content={
            <SetUpAltireWallet
              closeModal={() => {
                setSetUpWalletWallet(false);
              }}
            />
          }
        ></Modal>
      )}
      {showTransactiondetails && (
        <Modal
          content={
            <TransactionDetails
              closeModal={() => {
                setShowTransactiondetails(false);
              }}
            />
          }
        ></Modal>
      )}
      {/* {showSendMoney && (
        <Modal
          content={
            <SendMoney
              closeModal={() => {
                setShowTransactiondetails(false);
              }}
            />
          }
        ></Modal>
      )} */}
      {showSendMoney && (
        <Modal
          content={
            <SendMoneyForm
              closeModal={() => {
                setShowTransactiondetails(false);
              }}
            />
          }
        ></Modal>
      )}
    </div>
  );
};

export default Wallet;
