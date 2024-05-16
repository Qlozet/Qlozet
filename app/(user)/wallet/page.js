"use client";
import { useState, useEffect } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import DropDown from "@/components/DropDown";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
import Typography from "@/components/Typography";
import OrderTable from "@/components/order/OrderTable";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import WalletTable from "@/components/Wallet/WalletTable";
import SetUpAltireWallet from "@/components/Wallet/SetUpAltireWallet";
import TransactionDetails from "@/components/Wallet/TransactionDetails";
import SendMoney from "@/components/Wallet/SendMoney";
import SendMoneyForm from "@/components/Wallet/SendMoneyForm";
import MobileSideBar from "@/components/MobileSideBar";
import classes from "./index.module.css";
import Beneficiary from "@/components/Wallet/Beneficiary";
const Wallet = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [setUpWalletWallet, setSetUpWalletWallet] = useState(false);
  const [showTransactiondetails, setShowTransactiondetails] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState("");
  const [rejectModal, setShowReject] = useState(false);
  const [total, setShowTotal] = useState(false);
  const [wallet, setWallet] = useState("");
  const handleShowViewDetailModal = () => {
    setShowTransactiondetails(true);
  };
  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
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
  const getWalletBalance = async () => {
    try {
      const response = await getRequest("/api/vendor/wallet/balance");
      console.log(response);
      setTotalCustomer(response.data.totalCount);
    } catch (error) {}
  };

  useEffect(() => {
    getWalletBalance();
  }, []);

  return (
    <div className="flex bg-[#F8F9FA]">
      <div className="">
        <SideBar active="Wallet" />
        {showMobileNav && (
          <div className="md:hidden">
            <MobileSideBar active="Wallet" closeSideBar={showSideBar} />
          </div>
        )}
      </div>
      <div className="w-full p-4">
        <DasboardNavWithOutSearch
          addSearch={true}
          setValue={(data) => {
            // console.log(data);
          }}
          name="Wallet"
          showSideBar={showSideBar}
        />
        <div className="flex justify-end items-center md:hidden w-full">
          <div className="items-start gap-6 pt-5 flex ">
            <Button
              children="Send money"
              btnSize="large"
              variant="outline"
              minWidth="min-w-[10rem]"
              maxWidth="max-w-[10rem]"
              clickHandler={() => {
                setShowSendMoney("Send Money");
              }}
            />
            <Button
              children="Fund wallet"
              btnSize="large"
              variant="primary"
              minWidth="min-w-[10rem]"
              maxWidth="max-w-[10rem]"
              clickHandler={() => {
                setSetUpWalletWallet(true);
              }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <div
            className={` ${classes.scrollbarElement} flex items-center gap-4 overflow-x-scroll`}
          >
            <DashboardTopCard
              name="Wallet Balance"
              total="10000"
              percentage="2.5"
              bgColor="bg-[#57CAEB]"
              link="link"
              icon={vendorIcon}
              addMaxWidth={true}
            />
            <DashboardTopCard
              name="Total Amount Received"
              total="10000"
              percentage="2.5"
              bgColor="bg-[#5DDAB4]"
              icon={customerIcon}
              addMaxWidth={true}
            />
          </div>
          <div className="items-start gap-6 pt-5 hidden md:flex">
            <Button
              children="Send money"
              btnSize="large"
              variant="outline"
              minWidth="min-w-[10rem]"
              clickHandler={() => {
                setShowSendMoney("Send Money");
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

        <div className="">
         
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
      {showSendMoney === "Send Money" && (
        <Modal
          content={
            <SendMoney
              closeModal={(name) => {
                console.log(name);
                setShowSendMoney(name);
              }}
            />
          }
        ></Modal>
      )}
      {showSendMoney === "Manually" && (
        <Modal
          content={
            <SendMoneyForm
              closeModal={() => {
                setShowSendMoney(false);
              }}
            />
          }
        ></Modal>
      )}
      {showSendMoney === "Beneficiaries" && (
        <Modal
          content={
            <Beneficiary
              closeModal={() => {
                setShowSendMoney(false);
              }}
            />
          }
        ></Modal>
      )}
    </div>
  );
};

export default Wallet;
