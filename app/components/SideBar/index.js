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
import questionMarkIcon from "../../../public/assets/svg/question-mark 1.svg";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Modal from "../Modal";
import Typography from "../Typography";
import Button from "../Button";

const SideBar = ({ active }) => {
  const router = useRouter();

  const sidebaritems = [
    {
      name: "Dashboard",
      link: "dashboard",
      defaultIcon: dashboardIcon,
      activeIcon: activeDashboardIcon,
    },
    // {
    //   name: "Vendors",
    //   link: "vendors",
    //   defaultIcon: vendorDefault,
    //   activeIcon: vendorActive,
    // },
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
      link: "customer",
      defaultIcon: cutomerDefault,
      activeIcon: cutomerActive,
    },

    {
      name: "Settings",
      link: "settings",
      defaultIcon: settingsDefault,
      activeIcon: settingsActive,
    },
    {
      name: "Support",
      link: "support",
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
              className={`font-normal text-[14px] ${
                active === item.name ? "text-primary" : " text-gray-100"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
      <Modal
        content={
          <div className="flex items-center justify-center h-[100%]">
            <div className="bg-white w-[35%] rounded-[12px] flex flex-col items-center gap-6 p-6">
              <Image src={questionMarkIcon} />
              <Typography
                textColor="text-black"
                textWeight="font-bold"
                textSize="text-[18px]"
              >
                Are you sure you want to logout?
              </Typography>
              <Button
                children="Continue"
                btnSize="large"
                variant="danger"
                clickHandler={() => {
                  setStep(step + 1);
                }}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default SideBar;
