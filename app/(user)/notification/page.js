"use client";
import { useState, useEffect } from "react";
import ChatCard from "@//components/Chat/ChatCard";
import HorizontalChat from "@//components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@//components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@//components/DashboardTopCard";
import SideBar from "@//components/SideBar";
import Notification from "@//components/Notification/NotificationComponent";
import MobileSideBar from "@/components/MobileSideBar";
import { getRequest } from "@/api/method";
import Loader from "@/components/Loader";
import Typography from "@/components/Typography";
const NotificationPage = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState([{
    id: "Id",
    read: false,
    title: "Hello world Checking if the product was delivered.",
    desc: "Hello world Checking if the product was delivered",
    date: new Date().toISOString(),
  }, {
    id: "Id",
    read: false,
    title: "Hello world Checking if the product was delivered.",
    desc: "Hello world Checking if the product was delivered",
    date: new Date().toISOString(),
  }]);

  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const getNotification = async () => {
    try {
      let response = await getRequest("/vendor/notification");
      let notificationData = [];
      if (response?.data) {
        setPageLoading(false);
        response?.data?.data?.map((item) => {
          const tableItem = {
            id: item.id,
            read: item.read,
            title: item.title,
            desc: item?.description,
            date: item.createdAt,
          };
          notificationData.push(tableItem);
        });
        // setNotification(notificationData);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      // console.er(error);
    }
  };
  useEffect(() => {
    getNotification();
  }, []);

  return (
    <section>
      <div className="flex mt-4">
        <div className="w-full px-4 ">
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div className="rounded-[12px] overflow-hidden">
              <div className="p-2 flex items-center justify-between mt-4 lg:mb-4 bg-[#F4F4F4] rounded-t-[12px] lg:hidden ">
                <Typography
                  textColor="text-[#121212]"
                  textWeight="font-medium"
                  textSize="text-[14px]"
                >
                  Notifications
                </Typography>
              </div>
              <div className="bg-white">  {notification.map((item, index) => (
                <Notification {...item} key={index} />
              ))}</div>

            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotificationPage;
