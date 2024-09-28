"use client";
import { useState, useEffect } from "react";
import DasboardNavWithOutSearch from "@/components/DashboardNavBarWithoutSearch";
import MobileSideBar from "@/components/MobileSideBar";
import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/store";

import { setFilter } from "@/redux/slice";
const Layout = ({ children }) => {
  const dispatch = useAppDispatch();

  const pathname = usePathname();
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
  }, [pathname]);
  return (
    <div className="bg-gray-400">
      <div className="">
        <SideBar active={page} />
        <MobileSideBar
          showMobileNav={showMobileNav}
          active={page}
          closeSideBar={showSideBar}
        />
      </div>
      <div>
        <div className="md:ml-[260px] border-[2px] border-solid border-primary">
          <div className="p-4">
            <DasboardNavWithOutSearch
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
      </div>
    </div>
  );
};

export default Layout;
