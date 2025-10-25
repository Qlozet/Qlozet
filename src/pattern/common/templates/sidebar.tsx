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

    return (
        <div className="invisible hidden lg:block lg:visible lg:w-[260px] lg:h-screen lg:pl-6 lg:py-6 lg:pr-1 lg:overflow-y-auto">
            <div className="bg-sidebar flex flex-col gap-y-10 py-6 pl-[14px] pr-3 rounded-xl">
                {/* Logo */}
                <div className="pl-4">
                    <BrandLogo />
                </div>

                <div className="h-full flex flex-col justify-between gap-y-9">
                    {/* Menu Items */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item, idx) => {
                            return item.subItems ?
                                (
                                    <Accordion key={idx} type="single" collapsible>
                                        <AccordionItem value="item-1" className="border-none">
                                            <AccordionTrigger className="flex items-center justify-start gap-3 px-4 py-3 text-sidebar-foreground hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium data-[state=open]:text-primary hover:no-underline cursor-pointer border-none outline-none shadow-none">
                                               <span> <item.icon className="w-5 h-5" /></span>
                                                <span>{item.label}</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-[30px] pb-0">
                                                {item.subItems?.map((subItem) => (
                                                    <NavLink key={subItem.label} href={subItem.href}>
                                                        <subItem.icon className="w-5 h-5" />
                                                        <span>{subItem.label}</span>
                                                    </NavLink>
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )
                                : (
                                    <NavLink key={item.label} href={item.href}>
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                )
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="space-y-2">
                        <ThemeToggle />

                        {/* Log out */}
                        <LogoutBtn />
                    </div>
                </div>
            </div>
        </div>
    )
}
