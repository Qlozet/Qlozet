"use client";
import { useState, useEffect } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@/components/DashboardTopCard";
import SideBar from "@/components/SideBar";
import vendorIcon from "../../../public/assets/svg/vendor-total.svg";
import customerIcon from "../../../public/assets/svg/total-customer.svg";
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
import { getRequest } from "@/api/method";
import toast from "react-hot-toast";
import Toast from "@/components/ToastComponent/toast";
import Loader from "@/components/Loader";
const Wallet = () => {
  const [setUpWalletWallet, setSetUpWalletWallet] = useState(false);
  const [showTransactiondetails, setShowTransactiondetails] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showSendMoney, setShowSendMoney] = useState("");
  const [transactionId, setransactionId] = useState("");
  const [allBanks, setAllBanks] = useState([]);
  const [loadPage, setLoadPage] = useState(true);
  const [transactionData, setTransactionData] = useState([]);
  const [filteredTransactionData, setFilteredTransactionData] = useState([]);
  const [rejectModal, setShowReject] = useState(false);
  const handleShowViewDetailModal = () => {
    setShowTransactiondetails(true);
  };

  const [showMobileNav, setShowMobileNav] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const showRejectModal = () => {
    setOrderDetails(false);
    setShowTrack(false);
    setShowCustomer(false);
    setShowReject(true);
  };

  const getWalletBalance = async () => {
    try {
      const response = await getRequest("/vendor/wallet/balance");
      if (response?.data) {
        console.log(response?.data);
        setWalletBalance(response?.data?.data);
      } else {
      }
    } catch (error) {}
  };

  useEffect(() => {
    getWalletBalance();
  }, []);

  const getTransaction = async () => {
    try {
      let response = await getRequest("/vendor/wallet/transactions");
      let transactionDataArray = [];
      response?.data && setLoadPage(false);
      if (response?.data) {
        response?.data?.data.map((item) => {
          console.log(item);
          let status;
          if ((item.status = "Successful")) {
            status = {
              text: item.status,
              bgColor: "bg-success-300",
              color: "text-[#33CC33]",
            };
          } else if ((item.status = "Failed")) {
            status = {
              text: item.status,
              bgColor: "bg-[#FFF5F5]",
              color: "text-[#FF3A3A]",
            };
          }
          const transactionItem = {
            transactionId: item?.transactionId,
            amount: `₦${parseInt(item?.amount).toLocaleString()}`,
            date: item?.date,
            narration: item.narration,
            status: status,
            transactionType: item.transType,
          };
          transactionDataArray.push(transactionItem);
        });
        setTransactionData(transactionDataArray);
        setFilteredTransactionData(transactionDataArray);
      } else {
        // toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      console.log(error);
      error?.message && toast(<Toast text={error?.message} type="danger" />);
      // error?.data && toast(<Toast text={error?.data} type="danger" />);
    }
  };

  const getBanks = async () => {
    try {
      let response = await getRequest("/vendor/transfer/banks");
      if (response?.data) {
        setAllBanks(response?.data?.data?.data);
      }
    } catch (error) {}
  };

  const handleFilfeterData = (data) => {
    setFilteredTransactionData(
      transactionData.filter(
        (tansact) =>
          tansact.narration.toLowerCase().includes(data.toLowerCase()) ||
          tansact.transactionId.toLowerCase().includes(data.toLowerCase())
      )
    );
  };
  useEffect(() => {
    getTransaction();
    getBanks();
  }, []);

  return (
    <div>
      {loadPage ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Wallet" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Wallet"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              addSearch={true}
              setValue={(data) => {
                handleFilfeterData(data);
              }}
              name="Wallet"
              showSideBar={showSideBar}
            />
            <div className="flex justify-end items-center lg:hidden w-full">
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
                  total={walletBalance}
                  percentage="2.5"
                  bgColor="bg-[#57CAEB]"
                  link="link"
                  icon={vendorIcon}
                  addMaxWidth={true}
                />
                <DashboardTopCard
                  name="Total Amount Received"
                  total="0"
                  percentage="2.5"
                  bgColor="bg-[#5DDAB4]"
                  icon={customerIcon}
                  addMaxWidth={true}
                />
              </div>
              <div className="items-start gap-6 pt-5 hidden lg:flex">
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
                data={filteredTransactionData}
                viewDetails={(id) => {
                  setransactionId(id);
                  handleShowViewDetailModal();
                }}
                showRejectModal={showRejectModal}
                handleFilfeterData={handleFilfeterData}
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
                  details={
                    transactionData.filter(
                      (item) => item.transactionId == transactionId
                    )[0]
                  }
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
                  banks={allBanks}
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
      )}
    </div>
  );
};

export default Wallet;
