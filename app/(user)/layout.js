"use client";
import { useState, useEffect } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import MobileSideBar from "@/components/MobileSideBar";
import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import getVendorDetails from "@/api/request";
import { clearToken, setUserData } from "@/utils/localstorage";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { handlelogout, logout, sliceReducer } from "@/redux/slice";
import { setFilter } from "@/redux/slice";
import { reduxData } from "@/redux/slice";
import Modal from "@/components/Modal";
import Logout from "@/components/Logout";
const Layout = ({ children }) => {
  const router = useRouter();
  const stateData = useAppSelector(reduxData);
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

    try {
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

      } else if (!response.data) {
        clearToken()
        router.push("/auth/signin");
      }
    } catch (error) {
      clearToken()
      router.push("/auth/signin");

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
  }, [pathname]);
  return (
    <div className="bg-gray-400 m-auto">
      {loadingPage ? (<div></div>) : (<div>  <div className="">
        <SideBar active={page} />
        <MobileSideBar
          showMobileNav={showMobileNav}
          active={page}
          closeSideBar={showSideBar}
        />
      </div>
        <div>
          <div className="lg:ml-[280px]">
            <div className="p-4 sticky left-0 top-0 bg-white lg:bg-gray-400" style={{
              zIndex: 950
            }}>
              <DasboardNavWithOutSearch userDetails={userDetails}
                value={stateData.state}
                addSearch={addSearch}
                setValue={(data) => {
                  dispatch(setFilter(data));
                }}
                name={page}
                showSideBar={showSideBar}
              />
            </div>
            <div className="max-w-[1148px] lg:m-auto"> {children}</div>
          </div>
        </div>
        <Modal
          show={stateData.
            logout
          }
          content={
            <div className="flex items-center justify-center h-[100%] ">
              <Logout logoutFunction={() => { dispatch(handlelogout({ logout: false })) }} />
            </div>
          }
        />
      </div>)}

    </div>
  );
};

export default Layout;
