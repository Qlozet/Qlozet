import { useEffect, useState } from "react";
import Logo from "../Logo";
import dashboardIcon from "../../public/assets/svg/dashboardIcon.svg";
import activeDashboardIcon from "../../public/assets/svg/activeDashboardIcon.svg";
import cart from "../../public/assets/svg/shopping-cart.svg";
import actiivecart from "../../public/assets/svg/shopping-cart-active.svg";
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
import Logout from "../Logout";
import { useRouter } from "next/navigation";
import { clearToken } from "@/utils/localstorage";
import Image from "next/image";
import Modal from "../Modal";
import brownLogo from "../../public/assets/image/logobrown.png";

const SideBar = ({ active }) => {
  const [showLogOutModal, setShowLogOutModal] = useState(false);
  const router = useRouter();

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
      function: () => {},
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
      link: "customer",
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
        setShowLogOutModal(true);
      },
    },
  ];

  const logoutFunction = () => {
    setShowLogOutModal(false);
  };

  return (
    <div className="hidden md:block bg-white fixed top-0 left-0 w-[260px]">
      <div className="py-10 lg:px-16 md:px-4">
        <Image
          alt=""
          src={brownLogo}
          style={{
            width: "100px",
            height: "auto",
          }}
        />
      </div>
      <div className="">
        {sidebaritems.map((item, index) => (
          <div
            className="lg:px-16 md:px-4 flex items-center gap-4  py-3 cursor-pointer hover:bg-[#f4f4f4] min-w-[90px] md:min-w-[90px] lg:min-w-[250px]"
            key={index}
            onClick={() => {
              item.function();
              if (item.link !== "") {
                router.push(`../${item.link}`);
              }
            }}
          >
            {active === item.name ? (
              <Image src={item.activeIcon} alt="" />
            ) : (
              <Image src={item.defaultIcon} alt="" />
            )}
            <p
              className={`hidden md:block font-normal text-[14px] ${
                active === item.name ? "text-primary" : " text-gray-100"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
      {showLogOutModal && (
        <Modal
          content={
            <div className="flex items-center justify-center h-[100%] ">
              <Logout logoutFunction={logoutFunction} />
            </div>
          }
        />
      )}
    </div>
  );
};

export default SideBar;
