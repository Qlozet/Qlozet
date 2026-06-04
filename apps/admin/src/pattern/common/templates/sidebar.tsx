"use client"

import NavLink from "../molecules/nav-link"
import BrandLogo from "../molecules/brand-logo"
import { APP_ROUTES } from "@/lib/routes"
import { DashboardNavIcon } from "../atoms/nav-icons/dashboard-nav-icon"
import { VendorsNavIcon } from "../atoms/nav-icons/vendors-nav-icon"
import { CustomersNavIcon } from "../atoms/nav-icons/customers-nav-icon"
import { ProductsNavIcon } from "../atoms/nav-icons/products-nav-icon"
import { ProductsClothsNavIcon } from "../atoms/nav-icons/products-cloths-nav-icon"
import { ProductsAccessoriesNavIcon } from "../atoms/nav-icons/products-accessories-nav-icon"
import { ProductsFabricsNavIcon } from "../atoms/nav-icons/products-fabrics-nav-icon"
import { ProductsAddNavIcon } from "../atoms/nav-icons/products-add-nav-icon"
import { StaticPageNavIcon } from "../atoms/nav-icons/static-page-nav-icon"
import { MarketingNavIcon } from "../atoms/nav-icons/marketing-nav-icon"
import { AdminNavIcon } from "../atoms/nav-icons/admin-nav-icon"
import { PaymentNavIcon } from "../atoms/nav-icons/payment-nav-icon"
import { NotificationsNavIcon } from "../atoms/nav-icons/notifications-nav-icon"
import { PerformanceNavIcon } from "../atoms/nav-icons/performance-nav-icon"
import { SupportNavIcon } from "../atoms/nav-icons/support-nav-icon"
import { SettingsNavIcon } from "../atoms/nav-icons/settings-nav-icon"
import { FeedbackNavIcon } from "../atoms/nav-icons/feedback-nav-icon"
import { HelpNavIcon } from "../atoms/nav-icons/help-nav-icon"
import LogoutBtn from "../molecules/logout-btn"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import NiceModal from "@ebay/nice-modal-react"
import { WorkInProgressModal } from "../organisms/work-in-progress-modal"

// Shared styling so the "Work in Progress" trigger buttons match NavLink
const navItemClass =
    "w-fit 2xl:w-full flex items-center gap-3 px-2 2xl:px-4 py-2 2xl:py-3 text-sidebar-foreground hover:text-secondary transition-colors text-sm font-normal duration-300 cursor-pointer text-left outline-none"

export const Sidebar = () => {
    // Only the Dashboard page is built; every other nav target shows a modal
    const showWorkInProgress = () => {
        NiceModal.show(WorkInProgressModal)
    }

    const menuItems = [
        { icon: DashboardNavIcon, label: "Dashboard", href: APP_ROUTES.dashboard },
        { icon: VendorsNavIcon, label: "Vendors", href: APP_ROUTES.vendors },
        { icon: CustomersNavIcon, label: "Customers", href: APP_ROUTES.customers },
        {
            icon: ProductsNavIcon, label: "Products", href: APP_ROUTES.products, subItems: [
                { icon: ProductsClothsNavIcon, label: "Clothing", href: APP_ROUTES.productsCloth },
                { icon: ProductsAccessoriesNavIcon, label: "Accessories", href: APP_ROUTES.productsAccessories },
                { icon: ProductsFabricsNavIcon, label: "Fabrics", href: APP_ROUTES.productsFabrics },
                { icon: ProductsAddNavIcon, label: "Add Product", href: APP_ROUTES.productsAdd },
            ]
        },
        { icon: StaticPageNavIcon, label: "Static Page", href: APP_ROUTES.staticPage },
        {
            // TODO: replace placeholder sub-pages with the real Marketing sections
            icon: MarketingNavIcon, label: "Marketing", href: APP_ROUTES.marketing, subItems: [
                { icon: MarketingNavIcon, label: "Campaigns", href: `${APP_ROUTES.marketing}/campaigns` },
                { icon: MarketingNavIcon, label: "Promotions", href: `${APP_ROUTES.marketing}/promotions` },
            ]
        },
        { icon: AdminNavIcon, label: "Admin", href: APP_ROUTES.admin },
        { icon: PaymentNavIcon, label: "Payment", href: APP_ROUTES.payment },
        {
            // TODO: replace placeholder sub-pages with the real Notifications sections
            icon: NotificationsNavIcon, label: "Notifications", href: APP_ROUTES.notifications, subItems: [
                { icon: NotificationsNavIcon, label: "All", href: APP_ROUTES.notifications },
                { icon: NotificationsNavIcon, label: "Preferences", href: `${APP_ROUTES.notifications}/preferences` },
            ]
        },
        {
            // TODO: replace placeholder sub-pages with the real Performance sections
            icon: PerformanceNavIcon, label: "Performance", href: APP_ROUTES.performance, subItems: [
                { icon: PerformanceNavIcon, label: "Overview", href: APP_ROUTES.performance },
                { icon: PerformanceNavIcon, label: "Reports", href: `${APP_ROUTES.performance}/reports` },
            ]
        },
        { icon: SupportNavIcon, label: "Support", href: APP_ROUTES.support },
        { icon: SettingsNavIcon, label: "Settings", href: APP_ROUTES.settings },
        { icon: FeedbackNavIcon, label: "Feedback", href: APP_ROUTES.feedback },
        { icon: HelpNavIcon, label: "Help", href: APP_ROUTES.help },
    ]

    return (
        <div className="invisible hidden lg:block lg:visible lg:w-fit 2xl:w-[260px] lg:h-screen lg:pl-6 lg:py-6 lg:pr-1 transition-all duration-300">
            <ScrollArea className="flex-1 w-full h-full flex justify-center [&>div>div]:w-full">
                <div className="lg:w-[78px] xl:w-full bg-sidebar flex flex-col gap-y-10 py-6 pl-[14px] pr-3 rounded-xl transition-all duration-300">
                    {/* Logo */}
                    <div className="2xl:pl-4">
                        <BrandLogo />
                    </div>

                    <div className="h-full flex flex-col justify-between items-center gap-y-9">
                        {/* Menu Items */}
                        <nav className="w-[47px] 2xl:w-full flex-1 space-y-1">
                            {menuItems?.map((item, idx) => {
                                return item.subItems ?
                                    (
                                        <Accordion key={idx} type="single" collapsible>
                                            <AccordionItem value="item-1" className="border-none">
                                                <AccordionTrigger className="flex items-center justify-center 2xl:justify-start gap-x-0 2xl:gap-x-3 px-2 2xl:px-4 py-2 2xl:py-3 text-sidebar-foreground hover:text-secondary transition-colors text-sm font-normal data-[state=open]:text-primary hover:no-underline cursor-pointer border-none outline-none shadow-none duration-300">
                                                    <span> <item.icon className="w-5 h-5 transition-colors duration-75" /></span>
                                                    <span className="invisible hidden 2xl:visible 2xl:inline-block">{item.label}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="pl-2 2xl:pl-[30px] pb-0">
                                                    {item.subItems?.map((subItem) => (
                                                        <Tooltip key={subItem.label}>
                                                            <TooltipTrigger asChild>
                                                                <button type="button" onClick={showWorkInProgress} className={navItemClass}>
                                                                    <subItem.icon className="w-5 h-5 transition-colors duration-75 " />
                                                                    <span className="invisible hidden 2xl:visible 2xl:inline-block">{subItem.label}</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="2xl:hidden 2xl:invisible">
                                                                {subItem.label}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )
                                    : (
                                        <Tooltip key={item.label}>
                                            <TooltipTrigger asChild>
                                                {item.href === APP_ROUTES.dashboard ? (
                                                    <NavLink href={item.href}>
                                                        <item.icon className="w-5 h-5" />
                                                        <span className="invisible hidden 2xl:visible 2xl:inline-block">{item.label}</span>
                                                    </NavLink>
                                                ) : (
                                                    <button type="button" onClick={showWorkInProgress} className={navItemClass}>
                                                        <item.icon className="w-5 h-5" />
                                                        <span className="invisible hidden 2xl:visible 2xl:inline-block">{item.label}</span>
                                                    </button>
                                                )}
                                            </TooltipTrigger>
                                            <TooltipContent className="2xl:hidden 2xl:invisible">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                            })}
                        </nav>

                        {/* Bottom Section */}
                        <div className="w-[47px] 2xl:w-full flex flex-col items-center gap-y-2">
                            {/* Log out */}
                            <LogoutBtn />
                        </div>
                    </div>
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </div>
    )
}
