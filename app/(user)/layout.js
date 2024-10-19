"use client";
import { useState, useEffect } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import MobileSideBar from "@/components/MobileSideBar";
import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import getVendorDetails from "@/api/request";
import { setUserData } from "@/utils/localstorage";
import { useAppDispatch, useAppSelector } from "@/redux/store";

import { setFilter } from "@/redux/slice";
const Layout = ({ children }) => {
  const filterData = useAppSelector((state) => state.filter.state);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const [userDetails, setUserDetails] = useState({
    businessName: "",
    profileImage: "",
    personalName: "",
    profilePic: "",
    averageRating: "",
    profit: "",
    items: "",
  });
  const [loadingPage, setLoadingPage] = useState(true)
  const getVendorDetailshandler = async () => {
    const response = await getVendorDetails();
    if (response?.data) {
      const details = {
        businessName: response?.data?.data?.companyName
          ? response?.data?.data?.companyName
          : "",
        personalName: response?.data?.data?.vendorName
          ? response?.data?.data?.vendorName
          : "",
        profileImage: response.data?.data
          ? response.data?.data.profilePicture
          : "",
        ratings: response.data?.data ? response.data?.data.ratings : "",
        items: response.data?.data ? response.data?.data?.items : "",
        profit: response.data?.data ? response.data?.data?.profit : "",
        averageRating: response.data?.data?.averageRating
          ? response?.data?.data?.averageRating
          : "",
      };
      setUserData(details);
      setUserDetails(details);
      setLoadingPage(false)
      if (details) {

      }

    }
  };

  const [showMobileNav, setShowMobileNav] = useState(false);
  const [addSearch, setAddSearch] = useState(false);
  const [page, setPage] = useState(false);
  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  useEffect(() => {
    setAddSearch(
      pathname.replace("/", "") === "orders" ||
        pathname.replace("/", "") === "products" ||
        pathname.replace("/", "") === "wallet" ||
        pathname.replace("/", "") === "customer"
        ? true
        : false
    );
    setPage(
      pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2)
    );
    getVendorDetailshandler();
    console.log("Checkking")
  }, [pathname]);
  return (
    <div className="bg-gray-400">
      {loadingPage ? (<div></div>) : (<div>  <div className="">
        <SideBar active={page} />
        <MobileSideBar
          showMobileNav={showMobileNav}
          active={page}
          closeSideBar={showSideBar}
        />
      </div>
        <div>
          <div className="md:ml-[260px]">
            <div className="p-4">
              <DasboardNavWithOutSearch userDetails={userDetails}
                value={filterData}
                addSearch={addSearch}
                setValue={(data) => {
                  dispatch(setFilter(data));
                }}
                name={page}
                showSideBar={showSideBar}
              />
            </div>
            <div > {children}</div>
          </div>
        </div></div>)}

    </div>
  );
};

export default Layout;
