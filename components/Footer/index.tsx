import React from 'react';
import Link from "next/link";
import Typography from "../Typography";
import Logo from "../Logo";

interface FooterLink {
    name: string;
    link: string;
}

const Footer: React.FC = () => {
    const firstList: FooterLink[] = [
        { name: "Help", link: "/help" },
        { name: "Returns", link: "/returns" },
        { name: "Contact Us", link: "/contact-us" },
        { name: "Ordering and Shipping", link: "/ordering-and-shipping" },
    ];
    const firstList2: FooterLink[] = [
        { name: "Grow your Clothing Business", link: "/grow-your" },
    ];
    const secondList: FooterLink[] = [
        { name: "Repairs", link: "/repairs" },
        { name: "In-Store Care", link: "/in-store-care" },
        { name: "Contact Us", link: "/contact-us" },
        { name: "Gift Cards", link: "/gift-cards" },
        { name: "Appointments", link: "/appointments" },
        { name: "The Altire Exchange", link: "/exchange" },
        { name: "View All Services", link: "/services" },
    ];
    // ... Add other lists with types ...

    return (
        <div className="bg-white ">
            <div className="w-[80%] mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 items-start justify-between">
                    {/* Column 1 */}
                    <div>
                        <div>
                            <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Customer Care</h5>
                            <ul>
                                {firstList.map((item) => (
                                    <li className="text-center lg:text-start text-sm py-2" key={item.name}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6">
                            <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Sell With Us</h5>
                            <ul>
                                {firstList2.map((item) => (
                                    <li className="text-center lg:text-start text-sm py-2" key={item.name}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Other columns here */}
                </div>
            </div>
            <div className="border-t-[1px] border-b-[1px] border-gray-200 border-solid py-8 px-6">
                {/* Follow and Sign up Section */}
            </div>
            <div className="flex flex-col items-center justify-center py-6">
                <div>
                    <ul className="flex items-center gap-6">
                        <li className="text-sm py-2"><Link href="/cookie-policy">Cookie Policy</Link></li>
                        <li className="text-sm py-2"><Link href="/privacy-policy">Privacy Policy</Link></li>
                        <li className="text-sm py-2"><Link href="/terms-of-service">Terms of Service</Link></li>
                    </ul>
                </div>
                <div className="m-4">
                    <Logo brown={true} />
                </div>
            </div>
        </div>
    );
};

export default Footer;