import Logo from "../Logo";
import dashboardIcon from "../../../public/assets/svg/dashboardIcon.svg";
import activeDashboardIcon from "../../../public/assets/svg/activeDashboardIcon.svg";
import cart from "../../../public/assets/svg/shopping-cart.svg";
import actiivecart from "../../../public/assets/svg/shopping-cart-active.svg";
import shoppingBag from "../../../public/assets/svg/shopping-bag.svg";
import activeshopping from "../../../public/assets/svg/activeshopping-bag.svg";
import wallet from "../../../public/assets/svg/wallet.svg";
import walletActive from "../../../public/assets/svg/wallet-active.svg";
import settingsDefault from "../../../public/assets/svg/setting-default.svg";
import settingsActive from "../../../public/assets/svg/setting-active.svg";
import cutomerDefault from "../../../public/assets/svg/customer-default.svg";
import cutomerActive from "../../../public/assets/svg/cutomer-active.svg";
import supportDefault from "../../../public/assets/svg/support-default.svg";
import supportActive from "../../../public/assets/svg/support-active.svg";
import loggoutDefault from "../../../public/assets/svg/logout-default.svg";
import vendorDefault from "../../../public/assets/svg/user-octagon.svg";
import vendorActive from "../../../public/assets/svg/user-octagon-active.svg";

import { useRouter } from "next/navigation";

import Image from "next/image";

const SideBar = ({ active }) => {
  const router = useRouter();

  const sidebaritems = [
    {
      name: "Dashboard",
      link: "dashboard",
      defaultIcon: dashboardIcon,
      activeIcon: activeDashboardIcon,
    },
    {
      name: "Vendors",
      link: "vendors",
      defaultIcon: vendorDefault,
      activeIcon: vendorActive,
    },
    {
      name: "Orders",
      link: "orders",
      defaultIcon: vendorDefault,
      activeIcon: vendorActive,
    },
    {
      name: "Products",
      link: "Products",
      defaultIcon: shoppingBag,
      activeIcon: activeshopping,
    },

    {
      name: "Wallet",
      link: "Wallet",
      defaultIcon: wallet,
      activeIcon: walletActive,
    },
    {
      name: "Customers",
      link: "Customers",
      defaultIcon: cutomerDefault,
      activeIcon: cutomerActive,
    },

    {
      name: "Settings",
      link: "Settings",
      defaultIcon: settingsDefault,
      activeIcon: settingsActive,
    },
    {
      name: "Support",
      link: "Support",
      defaultIcon: supportDefault,
      activeIcon: supportActive,
    },
    {
      name: "Logout",
      link: "Logout",
      defaultIcon: loggoutDefault,
      activeIcon: loggoutDefault,
    },
  ];
  return (
    <div className="px-10 bg-white h-full">
      <div className="py-10">
        <Logo />
      </div>
      <div className="">
        {sidebaritems.map((item, index) => (
          <div
            className="flex items-center gap-4  py-3 cursor-pointer"
            key={index}
            onClick={() => {
              router.push(`${item.link}`);
            }}
          >
            {active === item.name ? (
              <Image src={item.activeIcon} alt="" />
            ) : (
              <Image src={item.defaultIcon} alt="" />
            )}
            <p
              className={`font-normal text-[18px] ${
                active === item.name ? "text-primary" : " text-gray-100"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
