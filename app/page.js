"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePageHeader from "@/components/Header";
import HomePageHero from "@/components/HomePageHero";
import SectionFlex from "@/components/sectionFlex";
import image1 from "../public/assets/svg/frame7.svg";
import image2 from "../public/assets/svg/frame10.svg";
import image3 from "../public/assets/svg/frame11.svg";
import image4 from "../public/assets/svg/frame12.svg";
import image13 from "../public/assets/svg/frame13.svg";
import Typography from "@/components/Typography";
import Sponsors from "@/components/Sponsors";
import Image from "next/image";
import Footer from "@/components/Footer";
export default function Home() {
  useEffect(() => {
    // router.push("/auth/signin");
  }, []);

  return (
    <main className="bg-white h-[100vh] m-auto">
      <HomePageHeader />
      <div className="pb-6">
        <HomePageHero />
      </div>
      <div className=" bg-[#C0C0C0] p-8 overflow-hidden">
        <SectionFlex
          image1={image1}
          image2={image2}
          heading={"Increased Visibility "}
          subText={
            "Showcase your fashion designs to a wider audience across Nigeria and beyond, increasing your brand exposure and attracting potential customers."
          }
        ></SectionFlex>

        <SectionFlex
          heading={"Flexible Selling Options"}
          subText={`Choose your preferred selling model - whether it's selling ready-to-wear items, offering made-to-order services, or providing customizations, Altire accommodates various selling preferences.
`}
          reverseFlex={true}
          image1={image3}
          image2={image4}
        ></SectionFlex>

        <SectionFlex
          image1={image1}
          image2={image2}
          heading={"Sales Analytics and Insighs"}
          subText={
            "Gain valuable insights into your sales performance and customer preferences through Altire's analytics tools, helping you make informed decisions to optimize your business."
          }
        ></SectionFlex>
        <SectionFlex
          reverseFlex={true}
          image1={image1}
          image2={image2}
          heading={"Hassle-Free Logistics"}
          subText={`Let Altire handle the logistics and delivery process, saving you time and effort in managing shipping and order fulfillment.
`}
        ></SectionFlex>
        <SectionFlex
          heading={`Marketing Support`}
          subText={`Benefit from Altire's marketing efforts to promote your designs, including social media campaigns, email newsletters, and targeted advertising to boost your sales.`}
          image1={image3}
          image2={image4}
        ></SectionFlex>
        <SectionFlex
          reverseFlex={true}
          image1={image1}
          image2={image2}
          heading={`Cost-Effective Solution`}
          subText={`Benefit from Altire's affordable subscription plans or commission-based pricing structure, offering a cost-effective way to start and grow your fashion business online.`}
        ></SectionFlex>
      </div>
      <div className="flex flex-col items-center bg-[#C0C0C0] py-4">
        <Typography
          textColor="dark"
          textWeight="font-bold"
          textSize="text-5xl"
          align={"center"}
        >
          Free from our brand partners
        </Typography>
        <Sponsors />
      </div>
      <div className="bg-[#C0C0C0] pb-12">
        <div className="px-12 w-[80%] m-auto" style={{
        background: 'linear-gradient(180deg, black 50%, white , #C0C0C0)'
      }}>
        <div className="w-[80%] m-auto">
          <div className="py-12">
            <Typography
              textColor="text-white"
              textWeight="font-bold"
              textSize="text-5xl"
              align={"left"}
            >
              Applications and Solutions
            </Typography>
            <div className="py-4"> <Typography
              textColor="text-white"
              textWeight="font-bold"
              textSize="text-medium"
              align={"left"}
            >
              Altire is an e-commerce platform that connects customers to the
              best designers, fabroc dealers’ tailors and sty;ist at afforadable
              rates. Enables customers select every detail from fabric to style
              to time period.
            </Typography></div>
          </div>
          <Image src={image13} alt=""/>
        </div>
      </div></div>

      <Footer />
    </main>
  );
}
