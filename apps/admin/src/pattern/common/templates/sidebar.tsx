'use client';

import NavLink from '../molecules/nav-link';
import BrandLogo from '../molecules/brand-logo';
import { APP_ROUTES } from '@/lib/routes';
import { DashboardNavIcon } from '../atoms/nav-icons/dashboard-nav-icon';
import { VendorsNavIcon } from '../atoms/nav-icons/vendors-nav-icon';
import { CustomersNavIcon } from '../atoms/nav-icons/customers-nav-icon';
import { ProductsNavIcon } from '../atoms/nav-icons/products-nav-icon';
import { ProductsClothsNavIcon } from '../atoms/nav-icons/products-cloths-nav-icon';
import { ProductsAccessoriesNavIcon } from '../atoms/nav-icons/products-accessories-nav-icon';
import { ProductsFabricsNavIcon } from '../atoms/nav-icons/products-fabrics-nav-icon';
import { CollectionsNavIcon } from '../atoms/nav-icons/collections-nav-icon';
import { ProductsAddNavIcon } from '../atoms/nav-icons/products-add-nav-icon';
import { StaticPageNavIcon } from '../atoms/nav-icons/static-page-nav-icon';
import { MarketingNavIcon } from '../atoms/nav-icons/marketing-nav-icon';
import { AdminNavIcon } from '../atoms/nav-icons/admin-nav-icon';
import { PaymentNavIcon } from '../atoms/nav-icons/payment-nav-icon';
import { DisputesNavIcon } from '../atoms/nav-icons/disputes-nav-icon';
import { NotificationsNavIcon } from '../atoms/nav-icons/notifications-nav-icon';
import { PerformanceNavIcon } from '../atoms/nav-icons/performance-nav-icon';
import { SupportNavIcon } from '../atoms/nav-icons/support-nav-icon';
import { SettingsNavIcon } from '../atoms/nav-icons/settings-nav-icon';
import { FeedbackNavIcon } from '../atoms/nav-icons/feedback-nav-icon';
import { HelpNavIcon } from '../atoms/nav-icons/help-nav-icon';
import LogoutBtn from '../molecules/logout-btn';
import { ThemeToggle } from '../molecules/theme-toggle';
import { ThemeToggleSwitch } from '../molecules/theme-toggle-switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import NiceModal from '@ebay/nice-modal-react';
import { cn } from '@/lib/utils';
import { WorkInProgressModal } from '../organisms/work-in-progress-modal';

// Shared styling so the "Work in Progress" trigger buttons match NavLink
const navItemClass =
  'w-fit 2xl:w-full flex items-center gap-3 px-2 2xl:px-4 py-2 2xl:py-3 text-grey4 dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors text-sm font-normal duration-300 cursor-pointer text-left outline-none';

// Routes whose pages are built and should navigate normally; everything else
// still opens the "Work in Progress" modal.
const ENABLED_ROUTES: string[] = [
  APP_ROUTES.dashboard,
  APP_ROUTES.vendors,
  APP_ROUTES.customers,
  APP_ROUTES.admin,
  APP_ROUTES.orders,
  APP_ROUTES.disputes,
  APP_ROUTES.productsCloth,
  APP_ROUTES.productsFabrics,
  APP_ROUTES.productsAccessories,
  APP_ROUTES.productsCollections,
  APP_ROUTES.productsCollectionsCreate,
  APP_ROUTES.productsAdd,
  APP_ROUTES.notifications,
  APP_ROUTES.support,
];

interface SidebarNavProps {
  /**
   * Drawer mode. The desktop rail collapses to icons below 2xl and leans on
   * tooltips; inside the mobile drawer there is room for labels, so they are
   * always shown and the tooltips are suppressed.
   */
  expanded?: boolean;
  /** Fired after any nav item is activated, so the drawer can close itself. */
  onNavigate?: () => void;
}

// The nav itself, shared by the desktop rail and the mobile drawer so the menu
// is defined once.
export const SidebarNav = ({
  expanded = false,
  onNavigate,
}: SidebarNavProps) => {
  const showWorkInProgress = () => {
    NiceModal.show(WorkInProgressModal);
    onNavigate?.();
  };

  // Labels are permanent in the drawer, width-gated on the rail.
  const labelClass = expanded
    ? 'inline-block'
    : 'invisible hidden 2xl:visible 2xl:inline-block';
  const itemWidthClass = expanded ? 'w-full' : undefined;

  const menuItems = [
    { icon: DashboardNavIcon, label: 'Dashboard', href: APP_ROUTES.dashboard },
    { icon: VendorsNavIcon, label: 'Vendors', href: APP_ROUTES.vendors },
    { icon: CustomersNavIcon, label: 'Customers', href: APP_ROUTES.customers },
    {
      icon: ProductsNavIcon,
      label: 'Products',
      href: APP_ROUTES.products,
      subItems: [
        {
          icon: ProductsClothsNavIcon,
          label: 'Clothing',
          href: APP_ROUTES.productsCloth,
        },
        {
          icon: ProductsAccessoriesNavIcon,
          label: 'Accessories',
          href: APP_ROUTES.productsAccessories,
        },
        {
          icon: ProductsFabricsNavIcon,
          label: 'Fabrics',
          href: APP_ROUTES.productsFabrics,
        },
        {
          icon: CollectionsNavIcon,
          label: 'Collections',
          href: APP_ROUTES.productsCollections,
        },
        {
          icon: ProductsAddNavIcon,
          label: 'Add Product',
          href: APP_ROUTES.productsAdd,
        },
      ],
    },
    {
      icon: StaticPageNavIcon,
      label: 'Static Page',
      href: APP_ROUTES.staticPage,
    },
    {
      // TODO: replace placeholder sub-pages with the real Marketing sections
      icon: MarketingNavIcon,
      label: 'Marketing',
      href: APP_ROUTES.marketing,
      subItems: [
        {
          icon: MarketingNavIcon,
          label: 'Campaigns',
          href: `${APP_ROUTES.marketing}/campaigns`,
        },
        {
          icon: MarketingNavIcon,
          label: 'Promotions',
          href: `${APP_ROUTES.marketing}/promotions`,
        },
      ],
    },
    { icon: AdminNavIcon, label: 'Admin', href: APP_ROUTES.admin },
    { icon: DisputesNavIcon, label: 'Disputes', href: APP_ROUTES.disputes },
    { icon: PaymentNavIcon, label: 'Payment', href: APP_ROUTES.payment },
    {
      icon: NotificationsNavIcon,
      label: 'Notifications',
      href: APP_ROUTES.notifications,
    },
    {
      // TODO: replace placeholder sub-pages with the real Performance sections
      icon: PerformanceNavIcon,
      label: 'Performance',
      href: APP_ROUTES.performance,
      subItems: [
        {
          icon: PerformanceNavIcon,
          label: 'Overview',
          href: APP_ROUTES.performance,
        },
        {
          icon: PerformanceNavIcon,
          label: 'Reports',
          href: `${APP_ROUTES.performance}/reports`,
        },
      ],
    },
    { icon: SupportNavIcon, label: 'Support', href: APP_ROUTES.support },
    { icon: SettingsNavIcon, label: 'Settings', href: APP_ROUTES.settings },
    { icon: FeedbackNavIcon, label: 'Feedback', href: APP_ROUTES.feedback },
    { icon: HelpNavIcon, label: 'Help', href: APP_ROUTES.help },
  ];

  return (
    <div
      className={cn(
        'lg:w-[78px] xl:w-full bg-sidebar flex flex-col gap-y-10 py-6 pl-[14px] pr-3 rounded-xl transition-all duration-300',
        expanded && 'w-full lg:w-full h-full rounded-none'
      )}
    >
      {/* Logo */}
      <div className="2xl:pl-4">
        <BrandLogo />
      </div>

      <div className="h-full flex flex-col justify-between items-center gap-y-9">
        {/* Menu Items */}
        <nav
          className={cn(
            'w-[47px] 2xl:w-full flex-1 space-y-1',
            expanded && 'w-full'
          )}
        >
          {menuItems?.map((item, idx) => {
            return item.subItems ? (
              <Accordion key={idx} type="single" collapsible>
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={cn(
                      'flex items-center justify-center 2xl:justify-start gap-x-0 2xl:gap-x-3 px-2 2xl:px-4 py-2 2xl:py-3 text-grey4 dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors text-sm font-normal data-[state=open]:text-primary dark:data-[state=open]:text-white hover:no-underline cursor-pointer border-none outline-none shadow-none duration-300',
                      expanded && 'w-full justify-start gap-x-3 px-4 py-3'
                    )}
                  >
                    <span>
                      {' '}
                      <item.icon className="w-5 h-5 transition-colors duration-75" />
                    </span>
                    <span className={labelClass}>{item.label}</span>
                  </AccordionTrigger>
                  <AccordionContent
                    className={cn(
                      'pl-2 2xl:pl-[30px] pb-0',
                      expanded && 'pl-[30px]'
                    )}
                  >
                    {item.subItems?.map((subItem) => (
                      <Tooltip key={subItem.label}>
                        <TooltipTrigger asChild>
                          {ENABLED_ROUTES.includes(subItem.href) ? (
                            <NavLink
                              href={subItem.href}
                              className={itemWidthClass}
                              onToggle={onNavigate}
                            >
                              <subItem.icon className="w-5 h-5 transition-colors duration-75 " />
                              <span className={labelClass}>
                                {subItem.label}
                              </span>
                            </NavLink>
                          ) : (
                            <button
                              type="button"
                              onClick={showWorkInProgress}
                              className={cn(navItemClass, itemWidthClass)}
                            >
                              <subItem.icon className="w-5 h-5 transition-colors duration-75 " />
                              <span className={labelClass}>
                                {subItem.label}
                              </span>
                            </button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent
                          className={cn(
                            '2xl:hidden 2xl:invisible',
                            expanded && 'hidden'
                          )}
                        >
                          {subItem.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  {ENABLED_ROUTES.includes(item.href) ? (
                    <NavLink
                      href={item.href}
                      exact={item.href === APP_ROUTES.dashboard}
                      className={itemWidthClass}
                      onToggle={onNavigate}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className={labelClass}>{item.label}</span>
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      onClick={showWorkInProgress}
                      className={cn(navItemClass, itemWidthClass)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className={labelClass}>{item.label}</span>
                    </button>
                  )}
                </TooltipTrigger>
                <TooltipContent
                  className={cn(
                    '2xl:hidden 2xl:invisible',
                    expanded && 'hidden'
                  )}
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div
          className={cn(
            'w-[47px] 2xl:w-full flex flex-col items-center gap-y-2',
            expanded && 'w-full'
          )}
        >
          {/* Theme. The labelled button needs room for its text, so the rail
              falls back to the compact switch until 2xl; the drawer always has
              the width. Gated in CSS rather than on a measured screen size, so
              the server and client render the same markup. */}
          {expanded ? (
            <ThemeToggle />
          ) : (
            <>
              <div className="hidden 2xl:block w-full">
                <ThemeToggle />
              </div>
              <div className="2xl:hidden">
                <ThemeToggleSwitch />
              </div>
            </>
          )}

          {/* Log out */}
          <LogoutBtn expanded={expanded} />
        </div>
      </div>
    </div>
  );
};

// Desktop rail. Hidden below lg, where the drawer in the top bar takes over.
export const Sidebar = () => (
  <div className="invisible hidden lg:block lg:visible lg:w-fit 2xl:w-[260px] lg:h-screen lg:pl-6 lg:py-6 lg:pr-1 transition-all duration-300">
    <ScrollArea className="flex-1 w-full h-full flex justify-center [&>div>div]:w-full">
      <SidebarNav />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </div>
);
