"use client";
import { useState } from "react";
import ChatCard from "@//components/Chat/ChatCard";
import HorizontalChat from "@//components/Chat/HorizontalChart";
import DasboardNavWithOutSearch from "@//components/DashboardNavBarWithoutSearch";
import DashboardTopCard from "@//components/DashboardTopCard";
import SideBar from "@//components/SideBar";
import Notification from "@//components/Notification/NotificationComponent";
import MobileSideBar from "@/components/MobileSideBar";
const NotificationPage = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const showSideBar = () => {
    setShowMobileNav(!showMobileNav);
  };

  return (
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
          <Notification shipped={true} />
          <Notification shipped={true} />
          <Notification shipped={false} />
          <Notification shipped={false} />
          <Notification shipped={false} />
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
