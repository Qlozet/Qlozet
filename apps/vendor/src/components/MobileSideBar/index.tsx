'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { StaticImageData } from 'next/image';
import Logo from '../Logo';
import Modal from '../Modal';
import { handlelogout } from '@/redux/slices/filter-slice';
import { useAppDispatch } from '@/redux/store';
import { show } from '@ebay/nice-modal-react';
import LogoutConfirmationModal from '@/pattern/common/organisms/logout-confirmation-modal';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/pattern/common/molecules/theme-toggle";
import { APP_ROUTES } from "@/lib/routes";

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

interface SidebarSubItem {
  name: string;
  link: string;
}

interface SidebarItem {
  name: string;
  link: string;
  defaultIcon: StaticImageData | string;
  activeIcon: StaticImageData | string;
  function: () => void;
  subItems?: SidebarSubItem[];
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
      link: APP_ROUTES.dashboard,
      defaultIcon: dashboardIcon,
      activeIcon: activeDashboardIcon,
      function: () => {},
    },
    {
      name: 'Orders',
      link: APP_ROUTES.orders,
      defaultIcon: vendorDefault,
      activeIcon: vendorActive,
      function: () => {},
    },
    {
      name: 'Products',
      link: APP_ROUTES.products,
      defaultIcon: shoppingBag,
      activeIcon: activeshopping,
      function: () => {},
      subItems: [
        { name: "Clothing", link: APP_ROUTES.productsCloth },
        { name: "Accessories", link: APP_ROUTES.productsAccessories },
        { name: "Fabrics", link: APP_ROUTES.productsFabrics },
        { name: "Collections", link: APP_ROUTES.productsCollections },
        { name: "Discounts", link: APP_ROUTES.productsDiscounts },
        { name: "Size Guides", link: APP_ROUTES.productsSizeGuides },
        { name: "Videos", link: APP_ROUTES.productsVideos },
      ]
    },
    {
      name: 'Wallet',
      link: APP_ROUTES.wallet,
      defaultIcon: wallet,
      activeIcon: walletActive,
      function: () => {},
    },
    {
      name: 'Customers',
      link: APP_ROUTES.customers,
      defaultIcon: cutomerDefault,
      activeIcon: cutomerActive,
      function: () => {},
    },
    {
      name: 'Settings',
      link: APP_ROUTES.settings,
      defaultIcon: settingsDefault,
      activeIcon: settingsActive,
      function: () => {},
    },
    {
      name: 'Support',
      link: APP_ROUTES.support,
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
        show(LogoutConfirmationModal);
      },
    },
  ];

  const handleBackdropClick = (): void => {
    closeSideBar();
  };

  const handleItemClick = (item: SidebarItem): void => {
    item.function();
    if (item.link !== '' && !item.subItems) {
      router.push(`${item.link}`);
      closeSideBar();
    }
  };

  return (
    <div
      className={cn(
        'w-screen fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
        showMobileNav ? 'opacity-100 visible block lg:hidden' : 'opacity-0 invisible hidden'
      )}
      style={{ zIndex: 10000 }}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          'bg-background dark:bg-card h-full w-[280px] flex flex-col shadow-2xl transition-transform duration-300',
          showMobileNav ? 'translate-x-0' : '-translate-x-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between py-6 px-6 border-b border-border/50'>
          <div className='flex items-center'>
            <div className='dark:hidden block'>
              <Logo brown />
            </div>
            <div className='hidden dark:block'>
              <Logo white />
            </div>
          </div>
          <button 
            onClick={closeSideBar} 
            className='p-2 rounded-full text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors'
          >
            <X className='size-5' />
          </button>
        </div>
        
        <div className='flex-1 overflow-y-auto py-4 custom-scrollbar'>
          {sidebaritems?.map((item: SidebarItem, index: number) => {
            if (item.subItems) {
               return (
                  <Accordion key={index} type="single" collapsible className="w-full px-3 mb-1">
                     <AccordionItem value={`item-${index}`} className="border-none">
                        <AccordionTrigger className={cn(
                            'px-3 flex items-center justify-between py-3.5 rounded-xl transition-colors hover:no-underline group',
                            active === item.name 
                            ? 'bg-primary/5 dark:bg-primary/10 text-primary dark:text-white' 
                            : 'hover:bg-accent dark:hover:bg-muted text-muted-foreground'
                        )}>
                            <div className="flex items-center gap-4">
                                {active === item.name ? (
                                    <Image src={item.activeIcon} alt={`${item.name} active icon`} className='size-5' />
                                ) : (
                                    <Image 
                                    src={item.defaultIcon} 
                                    alt={`${item.name} icon`} 
                                    className='size-5 opacity-70 group-hover:opacity-100 transition-opacity' 
                                    />
                                )}
                                <span className={cn(
                                    'font-medium text-[15px] transition-colors',
                                    active === item.name ? 'text-primary dark:text-white' : 'text-muted-foreground group-hover:text-foreground'
                                )}>
                                    {item.name}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-12 pr-6 pb-2">
                           <div className="flex flex-col gap-2 border-l border-border/50 pl-4 py-1">
                              {item.subItems.map((sub, i) => (
                                 <button
                                    key={i}
                                    className="text-left text-[14px] text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                                    onClick={() => {
                                        router.push(sub.link);
                                        closeSideBar();
                                    }}
                                 >
                                    {sub.name}
                                 </button>
                              ))}
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
               )
            }

            return (
              <div
                className={cn(
                  'px-6 flex items-center gap-4 py-3.5 mx-3 mb-1 rounded-xl cursor-pointer transition-colors group',
                  active === item.name 
                    ? 'bg-primary/5 dark:bg-primary/10' 
                    : 'hover:bg-accent dark:hover:bg-muted'
                )}
                key={index}
                onClick={() => handleItemClick(item)}
              >
                {active === item.name ? (
                  <Image src={item.activeIcon} alt={`${item.name} active icon`} className='size-5' />
                ) : (
                  <Image 
                    src={item.defaultIcon} 
                    alt={`${item.name} icon`} 
                    className='size-5 opacity-70 group-hover:opacity-100 transition-opacity' 
                  />
                )}
                <p
                  className={cn(
                    'font-medium text-[15px] transition-colors',
                    active === item.name ? 'text-primary dark:text-white' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.name}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-border/50 mt-auto">
           <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default MobileSideBar;
