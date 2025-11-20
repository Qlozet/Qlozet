"use client"

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
                { icon: ProductsVideosNavIcon, label: "Videos", href: APP_ROUTES.productsVideos },
            ]
        },
        { icon: WalletNavIcon, label: "Wallet", href: APP_ROUTES.wallet },
        { icon: CustomersNavIcon, label: "Customers", href: APP_ROUTES.customers },
        { icon: SettingsNavIcon, label: "Settings", href: APP_ROUTES.settings },
        { icon: SupportNavIcon, label: "Support", href: APP_ROUTES.support },
    ]

    const screenSize = useScreenSize();
    console.log("SCREEN SIZE: ", screenSize.toString() ?? "");

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
                        <nav className="w-[47px] 2xl:w-full flex-1 space-y-2">
                            {menuItems.map((item, idx) => {
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
                                                                <NavLink href={subItem.href}>
                                                                    <subItem.icon className="w-5 h-5 transition-colors duration-75 " />
                                                                    <span className="invisible hidden 2xl:visible 2xl:inline-block">{subItem.label}</span>
                                                                </NavLink>
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
                                                <NavLink href={item.href}>
                                                    <item.icon className="w-5 h-5" />
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
                        <div className="w-[47px] 2xl:w-full flex flex-col items-center gap-y-2">
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
