"use client";
import { useState, useEffect, ReactNode } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import MobileSideBar from "@/components/MobileSideBar";
import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import getVendorDetails from "@/api/request";
import { clearToken, setUserData } from "@/utils/localstorage";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { handlelogout } from "@/redux/slice";
import { setFilter } from "@/redux/slice";
import { reduxData } from "@/redux/slice";
import Modal from "@/components/Modal";
import Logout from "@/components/Logout";
import handIcon from "../../public/assets/svg/hand-tone.svg";
import { X } from "lucide-react";

interface UserDetails {
  businessName: string;
  profileImage: string;
  personalName: string;
  profilePic?: string;
  averageRating: string;
  profit: string;
  items: string;
  ratings?: string;
}

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const stateData = useAppSelector(reduxData);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    businessName: "",
    profileImage: "",
    personalName: "",
    profilePic: "",
    averageRating: "",
    profit: "",
    items: "",
  });
  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [showKycPopUp, setShowKycPopUp] = useState<boolean>(true);
  const getVendorDetailshandler = async (): Promise<void> => {
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
        setLoadingPage(false);
        if (details) {
        }
      } else if (!response.data) {
        clearToken();
        router.push("/auth/signin");
      }
    } catch (error) {
      clearToken();
      router.push("/auth/signin");
    }
  };

  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const [addSearch, setAddSearch] = useState<boolean>(false);
  const [page, setPage] = useState<string | boolean>(false);
  const showSideBar = (): void => {
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
    // .join().replace(",", "")
    setPage(
      pathname.replace(/^\//, "").split("/")[1] ? pathname.replace(/^\//, "").split("/")[1] : pathname.replace(/^\//, "").split("/")[0]
    );
    getVendorDetailshandler();
  }, [pathname]);
  return (
    <div className="bg-gray-400 m-auto">
      {loadingPage ? (
        <div></div>
      ) : (
        <div>
          <div className="">
            <SideBar active={page} />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active={page}
              closeSideBar={showSideBar}
            />
          </div>
          <div>
            <div className="lg:ml-[280px] ">
              <div
                className="p-4 sticky left-0 top-0 bg-white lg:bg-gray-400 "
                style={{
                  zIndex: 950,
                }}
              >
                <DasboardNavWithOutSearch
                  userDetails={userDetails}
                  value={stateData.state}
                  addSearch={addSearch}
                  setValue={(data) => {
                    dispatch(setFilter(data));
                  }}
                  name={page}
                  showSideBar={showSideBar}
                />
              </div>
              <div className="max-w-[1200px] lg:m-0"> {children}</div>
            </div>
          </div>
          <Modal
            show={stateData.logout}
            content={
              <div className="flex items-center justify-center h-[100%] ">
                <Logout
                  logoutFunction={() => {
                    dispatch(handlelogout({ logout: false }));
                  }}
                />
              </div>
            }
          />
        </div>
      )}
      {showKycPopUp && (
        <div className="bg-[#FDEBE0] rounded-[12px] fixed bottom-2 left-2 z-[100000] flex items-center justify-between px-4 py-6 gap-4">
          <button className=" w-8 h-8 bg-[#F8DBCB] rounded-[12px] flex items-center justify-center">
            <img src={handIcon.src} />
          </button>
          <div>
            <h4 className="font-medium text-darkBlue">Almost done!</h4>
            <p className="text-sm text-darkBlue w-[80%]">
              Complete KYC registration of your business profile to start work.
            </p>
          </div>
          <button
            className="w-8 h-8 bg-[#F8DBCB] rounded-[12px] flex items-center justify-center"
            onClick={() => setShowKycPopUp(false)}
          >
            <X />
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
