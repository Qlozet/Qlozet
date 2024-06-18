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
const NotificationPage = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState([]);

  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  const getNotification = async () => {
    try {
      let response = await getRequest("/vendor/notification");
      let notificationData = [];
      console.log(response?.data);
      if (response?.data) {
        setPageLoading(false);
        response?.data?.data?.map((item) => {
          console.log(item);
          const tableItem = {
            read: item.read,
            title: item.title,
            desc: item?.description,
            date: item.createdAt,
          };
          notificationData.push(tableItem);
        });
        setNotification(notificationData);
      } else {
        toast(<Toast text={response.message} type="danger" />);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getNotification();
  }, []);

  return (
    <section>
      {" "}
      {pageLoading ? (
        <Loader></Loader>
      ) : (
        <div className="flex bg-[#F8F9FA]">
          <div className="">
            <SideBar active="" />
            <MobileSideBar
              showMobileNav={showMobileNav}
              active="Settings"
              closeSideBar={showSideBar}
            />
          </div>
          <div className="w-full p-4">
            <DasboardNavWithOutSearch
              name={"Notifications"}
              showSideBar={showSideBar}
            />

            <div className="border-[1px] border-solid border-gray-200 rounded-[12px] py-4 mt-6 bg-white">
              {notification.map((item, index) => (
                <Notification {...item} key={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NotificationPage;
