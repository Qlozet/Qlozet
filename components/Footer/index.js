import Link from "next/link";
import Typography from "../Typography";
import Logo from "../Logo";

const Footer = () => {
    const firstList = [
        {
            name: "Help",
            link: "help",
        },
        {
            name: "Returns",
            link: "returns",
        },
        {
            name: "Contact Us",
            link: "contact-us",
        },
        {
            name: "Ordering and Shipping",
            link: "ordering-and-shipping",
        },
    ];
    const firstList2 = [
        {
            name: "Grow your Clothing Business",
            link: "grow-your",
        },
    ];

    const secondList = [
        {
            name: "Repairs",
            link: "repairs",
        },
        {
            name: "In-Store Care",
            link: "in-store-care",
        },
        {
            name: "Contact Us",
            link: "contact-us",
        },
        {
            name: "Gift Cards",
            link: "Gift-cards",
        },
        {
            name: "Appointments",
            link: "Gift-cards",
        },
        {
            name: "The Altire Exchange",
            link: "Gift-cards",
        },
        {
            name: "View All Services",
            link: "Gift-cards",
        },
    ];
    const thirdList = [
        {
            name: "The Altire Story",
            link: "repairs",
        },
        {
            name: "Investors",
            link: "in-store-care",
        },
        {
            name: "Careers",
            link: "contact-us",
        },
        {
            name: "Modern Slavery Act",
            link: "Gift-cards",
        },
    ];
    const fourthList = [
        {
            name: "Our Manifesto",
            link: "repairs",
        },
        {
            name: "Responsible Leather",
            link: "in-store-care",
        },
        {
            name: "Low Impact Materials",
            link: "contact-us",
        },
        {
            name: "Road To Zero",
            link: "Gift-cards",
        },
        {
            name: "Responsibility",
            link: "Gift-cards",
        },
    ];
    const fifthList = [
        {
            name: "United Kingdom",
            link: "repairs",
        },
        {
            name: "Store Locator",
            link: "in-store-care",
        },
    ];

    return (
        <div className="bg-white ">
            <div className="w-[80%] mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 items-start justify-between">
                    <div>
                        <div>
                            <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Customer Care</h5>
                            <ul className="">
                                {firstList.map((item, index) => {
                                    return (
                                        <li className="text-center lg:text-start text-sm py-2" key={index}>
                                            <Link href={item.link}>{item.name}</Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="mt-6">
                            <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Sell WIth Us</h5>
                            <ul className="">
                                {firstList2.map((item, index) => {
                                    return (
                                        <li className="text-center lg:text-start text-sm py-2" key={index}>
                                            <Link href={item.link}>{item.name}</Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Services</h5>
                        <ul className="">
                            {secondList.map((item, index) => {
                                return (
                                    <li className="text-center lg:text-start text-sm py-2" key={index}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-center lg:text-start font-semibold text-normal pb-2">About Altire</h5>
                        <ul className="">
                            {thirdList.map((item, index) => {
                                return (
                                    <li className="text-center lg:text-start text-sm py-2" key={index}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>{" "}
                    <div>
                        <h5 className="text-center lg:text-start font-semibold text-normal pb-2">Made To Last</h5>
                        <ul className="">
                            {fourthList.map((item, index) => {
                                return (
                                    <li className="text-center lg:text-start text-sm py-2" key={index}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>{" "}
                    <div>
                        <h5 className="text-center lg:text-start font-semibold text-normal pb-2">
                            Select Your Region
                        </h5>
                        <ul className="">
                            {fifthList.map((item, index) => {
                                return (
                                    <li className="text-center lg:text-start text-sm py-2" key={index}>
                                        <Link href={item.link}>{item.name}</Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div></div>
            </div>
            <div className="border-t-[1px] border-b-[1px] border-gray-200 border-solid py-8 px-6">
                <div className="lg:w-[80%] mx-auto  lg:flex items-start justify-between gap-2 lg:gap-0">
                    <div>
                        <Typography
                            textColor="text-dark"
                            textWeight="font-bold"
                            textSize="text-medium"
                            align={"left"}
                        >
                            Follow Altire
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            textColor="text-dark"
                            textWeight="font-bold"
                            textSize="text-medium"
                            align={"left"}
                        >
                            Sign Up For Updates
                        </Typography>
                        <div className="flex border-[1px] border-primary border-solid mt-2 rounded-md overflow-hidden">
                            <input
                                className="placeholder:text-[#808080] placeholder:text-sm min-w-[255px] px-4 py-2 outline-none"
                                placeholder="Enter your email"
                            ></input>
                            <button className="font-semibold  bg-primary min-h-full px-10 text-white flex items-center ">
                                GO
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
                <div>
                    <ul className="flex items-center gap-6">
                        <li className="text-sm py-2">
                            <Link href={""}>Cookie Policy</Link>
                        </li>
                        <li className="text-sm py-2">
                            <Link href={""}>Cookie Policy</Link>
                        </li>
                        <li className="text-sm py-2">
                            <Link href={""}>Cookie Policy</Link>
                        </li>
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
