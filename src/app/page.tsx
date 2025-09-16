"use client";

import { useEffect } from "react";
import HomePageHeader from "@/components/Header";
import Image, { StaticImageData } from "next/image";
import Footer from "@/components/Footer";
import headerImage from "@/public/assets/image/headerImage.jpg";
import VideoContainer from "@/components/VideoContainer/VideoContainer";
import HeaderSection from "@/components/HeaderSection/HeaderSection";
import DownPointer from "@/components/DownPointer";
import section2Image from "@/public/assets/image/VariantImage.png";
import shippingcompanyImage from "@/public/assets/image/shippingPartners.png";
import image2 from "@/public/assets/image/homepageimage3.png";
import dashboardImage from "@/public/assets/image/Dashboard 1.png";
import dashboardImage1 from "@/public/assets/image/productChartPage.png";

import card1 from "@/public/assets/image/card1.png";
import card2 from "@/public/assets/image/card2.png";
import card3 from "@/public/assets/image/card3.png";

import Typography from "@/components/Typography";
import Button from "@/components/Button";

import BrandPartners from "@/components/BrandPartners";
import React from "react";

// Type definition for the objects in the designersImage array.
// This ensures type safety and provides autocompletion for properties.
interface DesignerCard {
  image: StaticImageData; // Use StaticImageData for imported image files.
  title: string;
  description: string;
}

const Home: React.FC = () => {
  const designersImage: DesignerCard[] = [
    {
      image: card1,
      title: "Get started fast",
      description:
        "Designer Victoria started his Solaces selling unique kaftans and Agbada online and in person.",
    },
    {
      image: card2,
      title: "Grow as big as you want",
      description:
        "Suited grew from working form a home to becoming the giant it is now with $500,000 sales today.",
    },
    {
      image: card3,
      title: "Raise the bar",
      description:
        "With the help of Qlozet, Garm Island sells their Iconic street wars direct to customers around the world.",
    },
  ];

  useEffect(() => {
    // router.push("/auth/signin");
  }, []);

  return (
    <main className="m-auto">
      <div
        className="hero-container"
        style={{
          backgroundImage: `url(${headerImage.src})`,
        }}
      >
        <div className="w-full  bg-[rgba(0,0,0,.5)]">
          <HomePageHeader />
          <div className="flex flex-col items-start justify-center gap-6 w-full lg:w-[641px]  lg:ml-[87.5px] h-[700px] lg:h-[925px]">
            <Typography
              textColor={"text-white"}
              align={"text-left"}
              className={"font-bold text-3xl lg:font-[600] lg:text-[64px] "}
            >
              Welcome to Qlozet
            </Typography>
            <Typography
              textColor={"text-white"}
              textWeight="font-[400]"
              align={"text-left"}
              textSize="text-[20px]"
            >
              We are the driving force behind the dreams of emerging designers
              and tailors entrepreneurs
            </Typography>
            <div>
              {" "}
              <Button
                loading={false}
                children="SELL WITH US"
                btnSize="large"
                variant="outline"
                className="bg-white w-[144px]   text-xs font-bold"
                clickHandler={() => {}}
              />
            </div>
          </div>
          <div className="bg-[#F4F4F4] rounded-tr-[40px] rounded-tl-[40px] lg:rounded-tr-[100px] lg:rounded-tl-[100px] pt-[138px] flex flex-col gap-4">
            <HeaderSection
              title={"Sales and Analytics"}
              text={`Gain valuable insights into your sales performance and customer
                preferences through Qlozet's analytics tools, helping you make informed
                decisions to optimize your business.`}
            />
            <VideoContainer />
            <DownPointer />
            <HeaderSection
              title={"Flexible Selling Options"}
              text={`Choose your preferred selling model - whether it's selling
             ready-to-wear items, offering made-to-order services, or providing customizations,
              Qlozet accommodates various selling preferences.`}
            />
            <div className="lg:h-[627px] lg:w-[1016px] flex items-center justify-center mx-auto">
              <Image
                className="h-full w-full"
                src={section2Image}
                alt="Flexible Selling Options"
                unoptimized
              />
            </div>
            <DownPointer />
            <HeaderSection
              title={"Hassle-Free Logistics"}
              text={`Let Qlozet handle the logistics and a delivery process, 
                saving you time and effort in managing shipping and order fulfillment.`}
            />
            <div
              className="flex flex-col lg:flex-row items-center justify-between gap-8 w-full
             lg:w-[927px] mx-auto"
            >
              <Image src={shippingcompanyImage} alt="Shipping Partners" />
              <Image
                src={image2}
                alt="Logistics"
                className="w-full lg:w-[405px] h-auto lg:h-[404px]"
              />
            </div>
            <HeaderSection
              title={"Hassle-Free Logistics"}
              text={`Let Qlozet handle the logistics and delivery process, 
                saving you time and effort in managing shipping and order fulfillment.`}
            />
            <div className="flex items-center justify-center gap-8 w-full lg:max-w-[1206px] mx-auto">
              <Image src={dashboardImage} alt="Dashboard Preview 1" unoptimized />
              <Image
                src={dashboardImage1}
                alt="Dashboard Preview 2"
                unoptimized
                className="hidden lg:block"
              />
              <Image
                src={dashboardImage}
                alt="Dashboard Preview 3"
                unoptimized
                className="hidden lg:block"
              />
            </div>
            <DownPointer />
            <HeaderSection
              title={"Hassle-Free Logistics"}
              text={`Let Qlozet handle the logistics and delivery process, 
                saving you time and effort in managing shipping and order fulfillment.`}
            />
            <div className=" grid grid-cols-1 lg:grid-cols-3  gap-8 w-full lg:w-[1206px] mx-auto">
              {designersImage.map((item, index) => (
                <div
                  className={`flex flex-col items-center justify-center`}
                  key={index}
                >
                  <Image src={item.image} alt={item.title} unoptimized />
                  <div className="flex flex-col gap-3 mt-4 items-center justify-center lg:item-start lg:justify-start">
                    <Typography
                      textWeight="font-normal"
                      textSize="text-[28px]"
                      className={"text-center lg:text-left"}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      textWeight="font-normal"
                      textSize="text-[16px]"
                      className={"text-center lg:text-left"}
                    >
                      {item.description}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white ">
            <DownPointer />
          </div>
        </div>
      </div>
      <BrandPartners />
      <Footer />
    </main>
  );
};

export default Home;