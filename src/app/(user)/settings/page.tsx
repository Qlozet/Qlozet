"use client";
import { useEffect, useState } from "react";
import { SettingsTemplate } from "@/patterns/settings/templates/settings-template";
import { useGetVendorDetailsQuery } from "@/redux/services/settings/settings.api-slice";
import Loader from "@/components/Loader";
import Toast from "@/components/ToastComponent/toast";
import toast from "react-hot-toast";
const Dashboard: React.FC = () => {
  const [currentNav, setCurrentNav] = useState("Shop details");
  const { data: vendorData, isLoading: isLoadingVendor } = useGetVendorDetailsQuery();
  
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
  const settingNav = [
    {
      item: "Shop details",
      link: "",
      navWidth: "min-w-[7.5rem] lg:min-w-w-[0]",
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: "Billing and invoice",
      navWidth: "min-w-[10.5rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: "Warehouses",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: "Users and permissions",
      link: "",
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: "Order Settings",
      link: "",
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
      handleFunction: (data: string) => {
        setCurrentNav(data);
      },
    },
    {
      item: "Categories",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        setCurrentNav(data);
      },
    },
  ];

  // Update shop details when vendor data loads
  useEffect(() => {
    if (vendorData?.data) {
      setShopDetails({
        vendorName: vendorData.data.businessName,
        companyName: vendorData.data.businessName,
        addressLine1: vendorData.data.businessAddress,
        addressLine2: vendorData.data.addressLine2 || "",
        state: vendorData.data.state,
        timeZone: vendorData.data.timeZone,
        Phone: vendorData.data.businessPhoneNumber,
        email: vendorData.data.businessEmail,
        city: vendorData.data.city,
        country: vendorData.data.country,
        nin: vendorData.data.nin || "",
        bvn: vendorData.data.bvn || "",
        logo: [""],
        cacDocs: [""],
      });
    }
  }, [vendorData]);

  if (isLoadingVendor) {
    return <Loader />;
  }

  return (
    <SettingsTemplate
      navigationItems={settingNav}
      activeTab={currentNav}
      shopDetails={shopDetails}
    />
  );
};

export default Dashboard;
