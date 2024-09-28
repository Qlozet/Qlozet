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
      console.log(response)
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
        setNotification(notificationData);
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
      <div className="flex bg-[#F8F9FA]">
        <div className="w-full p-4">
          {pageLoading ? (
            <Loader></Loader>
          ) : (
            <div className="border-[1px] border-solid border-gray-200 rounded-[12px] py-4 bg-white">
              {notification.map((item, index) => (
                <Notification {...item} key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotificationPage;
