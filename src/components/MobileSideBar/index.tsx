'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import Logo from '../Logo';
import Logout from '../Logout';
import Modal from '../Modal';
import { handlelogout } from '@/redux/slices/filter-slice';
import { useAppDispatch } from '@/redux/store';

// Import icons
import dashboardIcon from '@/public/assets/svg/dashboardIcon.svg';
import activeDashboardIcon from '@/public/assets/svg/activeDashboardIcon.svg';
import cart from '@/public/assets/svg/shopping-cart.svg';
import actiivecart from '@/public/assets/svg/shopping-cart-active.svg';
import shoppingBag from '@/public/assets/svg/shopping-bag.svg';
import activeshopping from '@/public/assets/svg/activeshopping-bag.svg';
import wallet from '@/public/assets/svg/wallet.svg';
import walletActive from '@/public/assets/svg/wallet-active.svg';
import settingsDefault from '@/public/assets/svg/setting-default.svg';
import settingsActive from '@/public/assets/svg/setting-active.svg';
import cutomerDefault from '@/public/assets/svg/customer-default.svg';
import cutomerActive from '@/public/assets/svg/cutomer-active.svg';
import supportDefault from '@/public/assets/svg/support-default.svg';
import supportActive from '@/public/assets/svg/support-active.svg';
import loggoutDefault from '@/public/assets/svg/logout-default.svg';
import vendorDefault from '@/public/assets/svg/user-octagon.svg';
import vendorActive from '@/public/assets/svg/user-octagon-active.svg';
import logo from '@/public/assets/image/logobrown.png';

interface SidebarItem {
  name: string;
  link: string;
  defaultIcon: StaticImageData;
  activeIcon: StaticImageData;
  function: () => void;
}

interface MobileSideBarProps {
  active: string;
  closeSideBar: () => void;
  showMobileNav: boolean;
}

const MobileSideBar: React.FC<MobileSideBarProps> = ({
  active,
  closeSideBar,
  showMobileNav,
}) => {
  const dispatch = useAppDispatch();
  const [showLogOutModal, setShowLogOutModal] = useState<boolean>(false);
  const router = useRouter();
  const sidebaritems: SidebarItem[] = [
    {
      name: 'Dashboard',
      link: 'dashboard',
      defaultIcon: dashboardIcon,
      activeIcon: activeDashboardIcon,
      function: () => {},
    },
    {
      name: 'Orders',
      link: 'orders',
      defaultIcon: vendorDefault,
      activeIcon: vendorActive,
      function: () => {},
    },
    {
      name: 'Products',
      link: 'products',
      defaultIcon: shoppingBag,
      activeIcon: activeshopping,
      function: () => {},
    },
    {
      name: 'Wallet',
      link: 'wallet',
      defaultIcon: wallet,
      activeIcon: walletActive,
      function: () => {},
    },
    {
      name: 'Customers',
      link: 'customers',
      defaultIcon: cutomerDefault,
      activeIcon: cutomerActive,
      function: () => {},
    },
    {
      name: 'Settings',
      link: 'settings',
      defaultIcon: settingsDefault,
      activeIcon: settingsActive,
      function: () => {},
    },
    {
      name: 'Support',
      link: 'support',
      defaultIcon: supportDefault,
      activeIcon: supportActive,
      function: () => {},
    },
    {
      name: 'Logout',
      link: '',
      defaultIcon: loggoutDefault,
      activeIcon: loggoutDefault,
      function: () => {
        dispatch(handlelogout({ logout: true }));
      },
    },
  ];

  const logoutFunction = (): void => {
    setShowLogOutModal(false);
    closeSideBar();
  };
  const handleBackdropClick = (): void => {
    closeSideBar();
  };

  const handleItemClick = (item: SidebarItem): void => {
    item.function();
    if (item.link !== '') {
      router.push(`${item.link}`);
      closeSideBar();
    }
  };

  return (
    <div
      className={`w-screen ${
        showMobileNav ? 'block lg:hidden' : 'hidden'
      } bg-[rgba(0,0,0,.2)] fixed h-[100rem] z-40 top-0`}
      style={{ zIndex: 10000 }}
      onClick={handleBackdropClick}
    >
      <div className='bg-white h-screen w-[250px]'>
        <div className='py-10 px-16'>
          <div className='flex items-center justify-center'>
            <Image src={logo} alt='Altire Logo' />
          </div>
        </div>
        <div>
          {sidebaritems.map((item: SidebarItem, index: number) => (
            <div
              className='px-16 flex items-center gap-4 py-3 cursor-pointer hover:bg-[#f4f4f4] min-w-[250px]'
              key={index}
              onClick={() => handleItemClick(item)}
            >
              {active === item.name ? (
                <Image src={item.activeIcon} alt={`${item.name} active icon`} />
              ) : (
                <Image src={item.defaultIcon} alt={`${item.name} icon`} />
              )}
              <p
                className={`font-normal text-sm ${
                  active === item.name ? 'text-primary' : 'text-gray-100'
                }`}
              >
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileSideBar;
