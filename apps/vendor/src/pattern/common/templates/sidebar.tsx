"use client"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

import NavLink from "../molecules/nav-link"
import BrandLogo from "../molecules/brand-logo"
import { APP_ROUTES } from "@/lib/routes"
import { DashboardNavIcon } from "../atoms/nav-icons/dashboard-nav-icon"
import { OrdersNavIcon } from "../atoms/nav-icons/orders-nav-icon"
import { ProductsNavIcon } from "../atoms/nav-icons/products-nav-icon"
import { WalletNavIcon } from "../atoms/nav-icons/wallet-nav-icon"
import { CustomersNavIcon } from "../atoms/nav-icons/customers-nav-icon"
import { SettingsNavIcon } from "../atoms/nav-icons/settings-nav-icon"
import { SupportNavIcon } from "../atoms/nav-icons/support-nav-icon"
import LogoutBtn from "../molecules/logout-btn"
import { ThemeToggle } from "../molecules/theme-toggle"
import { ProductsClothsNavIcon } from "../atoms/nav-icons/products-cloths-nav-icon"
import { ProductsAccessoriesNavIcon } from "../atoms/nav-icons/products-accessories-nav-icon"
import { ProductsFabricsNavIcon } from "../atoms/nav-icons/products-fabrics-nav-icon"
import { ProductsCollectionsNavIcon } from "../atoms/nav-icons/products-collections-nav-icon"
import { ProductsDiscountsNavIcon } from "../atoms/nav-icons/products-discounts-nav-icon"
import { ProductsSizeGuidesNavIcon } from "../atoms/nav-icons/products-size-guides-nav-icon"
import { ProductsVideosNavIcon } from "../atoms/nav-icons/products-videos-nav-icon"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useScreenSize } from "@/lib/hooks/useScreenSize"
import { If } from "../atoms/If"
import { ThemeToggleSwitch } from "../molecules/theme-toggle-switch"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const Sidebar = () => {
    const menuItems = [
        { icon: DashboardNavIcon, label: "Dashboard", href: APP_ROUTES.dashboard },
        { icon: OrdersNavIcon, label: "Orders", href: APP_ROUTES.orders },
        {
            icon: ProductsNavIcon, label: "Products", href: APP_ROUTES.products, subItems: [
                { icon: ProductsClothsNavIcon, label: "Clothing", href: APP_ROUTES.productsCloth },
                { icon: ProductsAccessoriesNavIcon, label: "Accessories", href: APP_ROUTES.productsAccessories },
                { icon: ProductsFabricsNavIcon, label: "Fabrics", href: APP_ROUTES.productsFabrics },
                { icon: ProductsCollectionsNavIcon, label: "Collections", href: APP_ROUTES.productsCollections },
                { icon: ProductsDiscountsNavIcon, label: "Discounts", href: APP_ROUTES.productsDiscounts },
                { icon: ProductsSizeGuidesNavIcon, label: "Size Guides", href: APP_ROUTES.productsSizeGuides },
                { icon: ProductsVideosNavIcon, label: "Videos", href: APP_ROUTES.productsVideos },
            ]
        },
        { icon: WalletNavIcon, label: "Wallet", href: APP_ROUTES.wallet },
        { icon: CustomersNavIcon, label: "Customers", href: APP_ROUTES.customers },
        { icon: SettingsNavIcon, label: "Settings", href: APP_ROUTES.settings },
        { icon: SupportNavIcon, label: "Support", href: APP_ROUTES.support },
    ]

    const pathname = usePathname();
    const [expandedItem, setExpandedItem] = useState<string | undefined>();

    useEffect(() => {
        const activeIndex = menuItems.findIndex(item => item.subItems && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
        if (activeIndex !== -1) {
            setExpandedItem(`item-${activeIndex}`);
        } else {
            setExpandedItem(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const screenSize = useScreenSize();
    console.log("SCREEN SIZE: ", screenSize.toString() ?? "");

    return (
        <div className="invisible hidden lg:block lg:visible lg:w-fit 2xl:w-[260px] lg:h-screen lg:pl-6 lg:py-6 lg:pr-1 transition-all duration-300">
            <ScrollArea className="flex-1 w-full h-full bg-sidebar rounded-xl custom-card-shadow transition-all duration-300 [&>div>div]:w-full [&>div>div]:min-h-full">
                <div className="lg:w-[78px] xl:w-full min-h-[calc(100vh-3rem)] flex flex-col gap-y-10 py-6 pl-[14px] pr-3 transition-all duration-300">
                    {/* Logo */}
                    <div className="2xl:pl-4">
                        <BrandLogo />
                    </div>

                    <div className="flex-1 w-full flex flex-col items-center gap-y-9">
                        {/* Menu Items */}
                        <nav className="w-[47px] 2xl:w-full space-y-2">
                            {menuItems?.map((item, idx) => {
                                return item.subItems ?
                                    (
                                        <Accordion 
                                            key={idx} 
                                            type="single" 
                                            collapsible
                                            value={expandedItem === `item-${idx}` ? `item-${idx}` : ""}
                                            onValueChange={(val) => setExpandedItem(val)}
                                        >
                                            <AccordionItem value={`item-${idx}`} className="border-none">
                                                <AccordionTrigger className="flex items-center justify-center 2xl:justify-start gap-x-0 2xl:gap-x-3 px-2 2xl:px-4 py-2 2xl:py-3 text-[#ACB5BD] dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors text-sm font-normal data-[state=open]:text-primary dark:data-[state=open]:text-white hover:no-underline cursor-pointer border-none outline-none shadow-none duration-300">
                                                    <span> <item.icon className="w-6 h-6 transition-colors duration-75" /></span>
                                                    <span className="invisible hidden 2xl:visible 2xl:inline-block">{item.label}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-0 2xl:pl-[30px] flex flex-col items-center 2xl:items-start 2xl:block">
                                                    {/* Vertical dashed line for collapsed view */}
                                                    <div className="w-[1px] h-[10px] border-l-2 border-dashed border-[#D3D8DB] dark:border-gray-600 2xl:hidden my-0.5"></div>
                                                    
                                                    {/* Sub-items container with dashed border in collapsed view */}
                                                    <div className="flex flex-col items-center 2xl:items-start 2xl:block w-[40px] 2xl:w-full border-2 border-dashed border-[#D3D8DB] dark:border-gray-600 rounded-xl p-1 gap-y-1 2xl:border-none 2xl:rounded-none 2xl:p-0 2xl:gap-y-0">
                                                        {item.subItems?.map((subItem) => {
                                                            const isActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                                                            return (
                                                                <Tooltip key={subItem.label}>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="relative w-full flex justify-center 2xl:justify-start">
                                                                            <NavLink href={subItem.href} className="w-full justify-center 2xl:justify-start">
                                                                                <subItem.icon className="w-6 h-6 transition-colors duration-75 " />
                                                                                <span className="invisible hidden 2xl:visible 2xl:inline-block">{subItem.label}</span>
                                                                            </NavLink>
                                                                            {/* Active dot indicator for collapsed view */}
                                                                            {isActive && (
                                                                                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-1 rounded-full bg-[#8E2829] 2xl:hidden"></div>
                                                                            )}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="2xl:hidden 2xl:invisible">
                                                                        {subItem.label}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )
                                    : (
                                        <Tooltip key={item.label}>
                                            <TooltipTrigger asChild>
                                                <NavLink href={item.href}>
                                                    <item.icon className="w-6 h-6" />
                                                    <span className="invisible hidden 2xl:visible 2xl:inline-block">{item.label}</span>
                                                </NavLink>
                                            </TooltipTrigger>
                                            <TooltipContent className="2xl:hidden 2xl:invisible">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                            })}
                        </nav>

                        {/* Bottom Section */}
                        <div className="w-[47px] 2xl:w-full flex flex-col items-center gap-y-2 mt-auto">
                            <If isTrue={screenSize.gt("xl")}>
                                <ThemeToggle />
                            </If>
                            <If isTrue={screenSize.lt("2xl") && screenSize.gte("xl")}>
                                <ThemeToggleSwitch />
                            </If>

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
