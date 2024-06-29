import { useEffect, useState } from "react";
import Typography from "../Typography";
import Image from "next/image";
import { useRouter } from "next/navigation";
import searchNormalicon from "../../public/assets/svg/search-normal.svg";
import notificationIcon from "../../public/assets/svg/notification-bing.svg";
import altireicon from "../../public/assets/svg/altire-icon.svg";
import transformText from "../../public/assets/svg/textformat.size.svg";
import clockwise from "../../public/assets/svg/arrow.clockwise.svg";
import userIcon from "../../public/assets/svg/user-octagon.svg";
import menuIcon from "../../public/assets/svg/menu-icon.svg";
import mobileProfile from "../../public/assets/svg/mobile-oct-icon.svg";
import Profile from "../Profile.js";
import getVendorDetails from "@/api/request";
import { setUserData } from "@/utils/localstorage";
const DasboardNavWithOutSearch = ({
  name,
  addSearch,
  vendor,
  page,
  setValue,
  showSideBar,
  hideNav,
}) => {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [pageLoaging, setPageLoading] = useState(true);
  const showProfileHandler = () => {
    setShowProfile(!showProfile);
  };

  const [userDetails, setUserDetails] = useState({
    businessName: "",
    profileImage: "",
    personalName: "",
    profilePic: "",
    averageRating: "",
    profit: "",
    items: "",
  });

  const getVendorDetailshandler = async () => {
    const response = await getVendorDetails();
    if (response?.data) {
      setPageLoading(false);

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

      console.log(details);
      setUserData(details);
      setUserDetails(details);
    }
  };

  useEffect(() => {
    getVendorDetailshandler();
  }, []);
  return (
    <div>
      <div className={`${!hideNav ? " " : "pt-2"} rounded-[15px]`}>
        <div className="block lg:hidden">
          <div className=" items-center justify-between px-3 py-3 bg-gray-400 rounded-[12px] hidden">
            <Image src={transformText} alt="" />
            <Image src={altireicon} alt="" />
            <Image src={clockwise} alt="" />
          </div>
          {!hideNav && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-[2rem] h-[2rem] bg-primary flex items-center justify-center  rounded-[8px] cursor-pointer"
                  onClick={showSideBar}
                >
                  <Image alt="" src={menuIcon} />
                </div>
                <Typography
                  textColor="text-dark"
                  textWeight="font-bold"
                  textSize="text-[18px]"
                >
                  {name}
                </Typography>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer">
                  <Image
                    alt=""
                    src={notificationIcon}
                    onClick={() => {
                      router.push(`notification`);
                    }}
                  />
                </div>
                <Typography
                  textColor="text-dark"
                  textWeight="font-bold"
                  textSize="text-[18px]"
                >
                  {userDetails.personalName}
                </Typography>
                <div className="rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer">
                  <Image
                    alt=""
                    src={mobileProfile}
                    onClick={showProfileHandler}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="hidden lg:flex items-center justify-between bg-white border-[#DDE2E5] border-solid border-[1.5px] py-2 px-6 rounded-[12px]">
          <Typography
            textColor="text-dark"
            textWeight="font-bold"
            textSize="text-[18px]"
          >
            {name}
          </Typography>
          <div className="flex items-center justify-end gap-6">
            {addSearch && (
              <div className="relative   min-w-96">
                <div className="absolute left-2 top-[10px]">
                  <Image alt="" src={searchNormalicon} />
                </div>
                <input
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  placeholder="Search"
                  className={`py-2 pl-12 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark  
        focus:outline-none focus:border-primary-100 border-gray-2 rounded-[12px] overflow-hidden text-[14px] text-font-light placeholder:font-300  bg-[#F8F9FA] 
        } `}
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div
                className="rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer"
                onClick={() => {
                  router.push(`notification`);
                }}
              >
                <Image alt="" src={notificationIcon} />
              </div>
              <Typography
                textColor="text-dark"
                textWeight="font-normal"
                textSize="text-[16px]"
              >
                {userDetails.personalName}
              </Typography>
              <div className="rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer">
                <Image
                  alt=""
                  src={userIcon}
                  onClick={showProfileHandler}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showProfile && (
        <Profile closeProfile={showProfileHandler} userDetails={userDetails} />
      )}
    </div>
  );
};

export default DasboardNavWithOutSearch;
