"use client";
import { useEffect, useState } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import SideBar from "@/components/SideBar";
import OrderDetailNav from "@/components/order/OrderdetailsNav";
import CompanyDetails from "@/components/Settings/companyDetails/companyDetails";
import BillingAndInvioce from "@/components/Settings/BillingAndInvioceInfo";
import Warehouse from "@/components/Settings/Warehouse/Warehouse";
import classes from "./index.module.css";
import Shipping from "@/components/Settings/Shipping/Shipping";
import UserAndPermission from "@/components/Settings/UserAndPermission/UserAndPermssion";
import Category from "@/components/Settings/Category/Category";
import MobileSideBar from "@/components/MobileSideBar";
import { getRequest, postRequest, putRequest } from "@/api/method";
import Loader from "@/components/Loader";
import { settingNav } from "@/utils/navdata";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
const Dashboard = () => {
  const [dropDownValue, setDropDownValue] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsloading] = useState(false);
  const [shopDetails, setShopDetails] = useState({
    vendorName: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    timeZone: "",
    Phone: "",
    email: "",
    city: "",
    country: "",
    nin: "",
    bvn: "",
    logo: [""],
    cacDocs: [""],
  });
  const [requiredShopDetails, setRequiredShopDetails] = useState({
    companyName: false,
    addressLine1: false,
    addressLine2: false,
    state: false,
    timeZone: false,
    Phone: false,
    email: false,
    city: false,
    country: false,
    nin: false,
    bvn: false,
    logo: false,
    cacDocs: false,
  });
  const [showCompanyDetails, setShowComapanyDetails] = useState(false);
  const [showBillingAndInvioce, setShowBillingAndInvioce] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showShippingPatners, setShowShippingPatners] = useState(false);
  const [showUserAndPermission, setShowUserAndPermission] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [currentNav, setCurrentNav] = useState("Shop details");
  const [showMobileNav, setShowMobileNav] = useState(false);

  const settingNav = [
    {
      item: "Shop details",
      link: "",
      navWidth: "min-w-[7.5rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(true);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Billing and invoice",
      navWidth: "min-w-[10.5rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(true);
        setShowWarehouse(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Warehouses",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(true);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(false);
      },
    },
    {
      item: "Users and permissions",
      link: "",
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(true);
        setShowCategory(false);
      },
    },
    {
      item: "Categories",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        setCurrentNav(data);
        setShowComapanyDetails(false);
        setShowBillingAndInvioce(false);
        setShowWarehouse(false);
        setShowShippingPatners(false);
        setShowUserAndPermission(false);
        setShowCategory(true);
      },
    },
  ];
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const handleSelectCompanyLogo = async (files) => {
    const ImageInfo = await uploadSingleImage(files[0]);
    // setUploadeFiles((prevData) => {
    //   return [...prevData, ImageInfo];
    // });
    // setFile(files);
    // setProductFormData((prevData) => {
    //   return { ...prevData, images: files };
    // });
  };

  const submitCompanyInfo = async () => {
    try {
      setIsloading(true);
      const response = await putRequest("/vendor/settings", {
        businessName: shopDetails.companyName,
        businessAddress: shopDetails.addressLine1,
        businessPhoneNumber: shopDetails.Phone,
        businessEmail: shopDetails.email,
        addressLine2: shopDetails.addressLine2,
        state: shopDetails.state,
        country: shopDetails.country,
        timeZone: shopDetails.timeZone,
        city: shopDetails.city,
        bvn: shopDetails.bvn,
        nin: shopDetails.nin,
        // cacDocument: ["string"],
      });
      response && setIsloading(false);
      console.log(response);
      if (response.success) {
        toast(<Toast text={response.message} type="success" />);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      error && setIsloading(false);

      console.log(error);
    }
  };

  const getCompanyInfo = async () => {
    try {
      let response = await getRequest("/vendor/settings/vendor-details");
      let vandorInfo = [];
      if (response?.data) {
        console.log(response);
        setPageLoading(false);
        setShopDetails({
          vendorName: response?.data?.data?.businessName,
          companyName: response?.data?.data?.businessName,
          addressLine1: response?.data?.data?.businessAddress,
          addressLine2: response?.data?.data?.addressLine2,
          state: response?.data?.data.state,
          timeZone: response?.data?.data.timeZone,
          Phone: response?.data?.data?.businessPhoneNumber,
          email: response?.data?.data?.businessEmail,
          city: response?.data?.data?.city,
          country: response?.data?.data?.country,
          nin: response?.data?.data?.nin,
          bvn: response?.data?.data?.bvn,
          logo: [""],
          cacDocs: [""],
        });
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCompanyInfo();
  }, []);

  return (
    <div>
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="Settings" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Settings"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              // addSearch={currentNav === "Warehouses" ? true : false}
              name="Settings"
              setValue={(data) => {
                handleFilfeterData(data);
              }}
              showSideBar={showSideBar}
            />
            <div className="mt-4">
              <OrderDetailNav
                bg="bg"
                data={settingNav}
                width="w-full"
                active={currentNav}
                full={true}
              />
            </div>
            {currentNav === "Shop details" && (
              <CompanyDetails
                shopDetails={shopDetails}
                setShopDetails={setShopDetails}
                requiredShopDetails={requiredShopDetails}
                setRequiredShopDetails={setRequiredShopDetails}
                submitCompanyInfo={submitCompanyInfo}
                isLoading={isLoading}
              />
            )}
            {currentNav === "Billing and invoice" && <BillingAndInvioce />}
            {currentNav === "Warehouses" && <Warehouse />}
            {/* {currentNav === "Shipping partners" && <Shipping />} */}
            {currentNav === "Users and permissions" && <UserAndPermission />}
            {currentNav === "Categories" && <Category />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
