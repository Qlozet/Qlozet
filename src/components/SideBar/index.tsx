import React, { Fragment, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from '@/lib/routes';
import { useAppDispatch } from "@/redux/store";
import { handlelogout, setFilter } from "@/redux/slices/filter-slice";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

import Logo from "../Logo";
import dashboardIcon from "@/public/assets/svg/dashboardIcon.svg";
import activeDashboardIcon from "@/public/assets/svg/activeDashboardIcon.svg";
import shoppingBag from "@/public/assets/svg/shopping-bag.svg";
import activeshopping from "@/public/assets/svg/activeshopping-bag.svg";
import wallet from "@/public/assets/svg/wallet.svg";
import walletActive from "@/public/assets/svg/wallet-active.svg";
import settingsDefault from "@/public/assets/svg/setting-default.svg";
import settingsActive from "@/public/assets/svg/setting-active.svg";
import cutomerDefault from "@/public/assets/svg/customer-default.svg";
import cutomerActive from "@/public/assets/svg/cutomer-active.svg";
import supportDefault from "@/public/assets/svg/support-default.svg";
import supportActive from "@/public/assets/svg/support-active.svg";
import loggoutDefault from "@/public/assets/svg/logout-default.svg";
import vendorDefault from "@/public/assets/svg/user-octagon.svg";
import vendorActive from "@/public/assets/svg/user-octagon-active.svg";
import brownLogo from "@/public/assets/image/logobrown.png";


interface SubPage {
  name: string;
  link: string;
  defaultIcon: StaticImageData;
  activeIcon: StaticImageData;
}

interface SidebarItem {
  name: string;
  link: string;
  defaultIcon: StaticImageData;
  activeIcon: StaticImageData;
  function: () => void;
  subPages?: SubPage[];
}

interface SideBarProps {
  active: string;
}

const SideBar: React.FC<SideBarProps> = ({ active }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  const sidebaritems: SidebarItem[] = [
    // ... sidebar items data with types ...
  ];

  return (
    <div
      className="hidden lg:block bg-white fixed top-0 left-0 w-[260px] max-w-[260px] lg:min-w-[250px] sidebar-scrollbar"
      style={{ zIndex: 950 }}
    >
      <div className="py-10 lg:px-16 md:px-4">
        <Link href={APP_ROUTES.dashboard}>
          <Image src={brownLogo} alt="Qlozet Logo" style={{ width: "100px", height: "auto" }} priority />
        </Link>
      </div>
      {/* Mapping over sidebaritems */}
    </div>
  );
};

export default SideBar;