"use client";
import { useEffect, useState, Fragment } from "react";
import Logo from "../Logo";
import dashboardIcon from "../../public/assets/svg/dashboardIcon.svg";
import activeDashboardIcon from "../../public/assets/svg/activeDashboardIcon.svg";
import shoppingBag from "../../public/assets/svg/shopping-bag.svg";
import activeshopping from "../../public/assets/svg/activeshopping-bag.svg";
import wallet from "../../public/assets/svg/wallet.svg";
import walletActive from "../../public/assets/svg/wallet-active.svg";
import settingsDefault from "../../public/assets/svg/setting-default.svg";
import settingsActive from "../../public/assets/svg/setting-active.svg";
import cutomerDefault from "../../public/assets/svg/customer-default.svg";
import cutomerActive from "../../public/assets/svg/cutomer-active.svg";
import supportDefault from "../../public/assets/svg/support-default.svg";
import supportActive from "../../public/assets/svg/support-active.svg";
import loggoutDefault from "../../public/assets/svg/logout-default.svg";
import vendorDefault from "../../public/assets/svg/user-octagon.svg";
import vendorActive from "../../public/assets/svg/user-octagon-active.svg";
import brownLogo from "../../public/assets/image/logobrown.png";
import Logout from "../Logout";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "../Modal";
import { handlelogout, setFilter } from "@/redux/slice";
import styles from "./index.module.css";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

import { useAppDispatch } from "@/redux/store";
import Link from "next/link";
const SideBar = ({ active }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const sidebaritems = [
    {
      name: "Dashboard",
      link: "dashboard",
      defaultIcon: dashboardIcon,
      activeIcon: activeDashboardIcon,
      function: () => {},
    },
    {
      name: "Orders",
      link: "orders",
      defaultIcon: vendorDefault,
      activeIcon: vendorActive,
      function: () => {},
    },
    {
      name: "Products",
      link: "products",
      defaultIcon: shoppingBag,
      activeIcon: activeshopping,
      function: () => setProductsDropdownOpen(!productsDropdownOpen),
      subPages: [
        {
          name: "Cloths",
          link: "products/cloths",
          defaultIcon: shoppingBag,
          activeIcon: activeshopping,
        },
        {
          name: "Accessories",
          link: "products/accessories",
          defaultIcon: shoppingBag,
          activeIcon: activeshopping,
        },
        {
          name: "Fabrics",
          link: "products/fabrics",
          defaultIcon: shoppingBag,
          activeIcon: activeshopping,
        },
      ],
    },
    {
      name: "Wallet",
      link: "wallet",
      defaultIcon: wallet,
      activeIcon: walletActive,
      function: () => {},
    },
    {
      name: "Customers",
      link: "customers",
      defaultIcon: cutomerDefault,
      activeIcon: cutomerActive,
      function: () => {},
    },

    {
      name: "Settings",
      link: "settings",
      defaultIcon: settingsDefault,
      activeIcon: settingsActive,
      function: () => {},
    },
    {
      name: "Support",
      link: "support",
      defaultIcon: supportDefault,
      activeIcon: supportActive,
      function: () => {},
    },
    {
      name: "Logout",
      link: "",
      defaultIcon: loggoutDefault,
      activeIcon: loggoutDefault,
      function: () => {
        dispatch(handlelogout({ logout: true }));
      },
    },
  ];

  return (
    <div
      className={`hidden lg:block bg-white fixed top-0 left-0 w-[260px] max-w-[260px] lg:min-w-[250px] h-screen ${styles.container}`}
      style={{
        zIndex: 950,
      }}
    >
      <div className="py-10 lg:px-16 md:px-4">
        <Link href="/dashboard">
          {" "}
          <Image
            alt=""
            src={brownLogo}
            style={{
              width: "100px",
              height: "auto",
            }}
          />
        </Link>
      </div>
      <div className="">
        {sidebaritems.map((item, index) => (
          <Fragment>
            <div
              className="lg:px-16 md:px-4 flex items-center gap-4  py-3 cursor-pointer hover:bg-[#f4f4f4] min-w-[90px] md:min-w-[90px] relative"
              key={index}
              onClick={() => {
                dispatch(setFilter(""));
                item.function();
                if (item.subPages) {
                  setProductsDropdownOpen(!productsDropdownOpen);
                } else if (item.link !== "") {
                  router.push(`../${item.link}`);
                }
              }}
            >
              <div className="absolute left-9 top-4">
                {item.subPages &&
                  (productsDropdownOpen ? (
                    <FaAngleUp className={"text-gray-100"} />
                  ) : (
                    <FaAngleDown className={"text-gray-100"} />
                  ))}
              </div>

              {active === item.name ? (
                <Image src={item.activeIcon} alt="" />
              ) : (
                <Image src={item.defaultIcon} alt="" />
              )}
              <p
                className={`hidden md:block font-normal text-sm ${
                  active === item.name ? "text-primary" : " text-gray-100"
                }`}
              >
                {item.name}
              </p>
            </div>
            {item.subPages && productsDropdownOpen && (
              <div className="pl-8">
                {item.subPages.map((subPage) => (
                  <Link
                    key={subPage.link}
                    href={`/products/${subPage.link.split("/").pop()}`}
                    className="lg:px-16 md:px-4 flex items-center gap-4 py-3 cursor-pointer hover:bg-[#f4f4f4] min-w-[90px] md:min-w-[90px]"
                  >
                    {active === subPage.name ? (
                      <Image src={subPage.activeIcon} alt="" />
                    ) : (
                      <Image src={subPage.defaultIcon} alt="" />
                    )}
                    <p
                      className={`font-normal text-sm ${
                        active === subPage.name
                          ? "text-primary"
                          : " text-gray-100"
                      }`}
                    >
                      {subPage.name}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
