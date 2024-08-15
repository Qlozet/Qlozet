import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import CustomizeNav from "../CustomizeNav";
import Design from "./Design";
import Tops from "../Tops";
import Bottoms from "../Bottoms";
import Dresses from "../Dresses";
import Outfits from "../Outfits";
import Skirts from "../Skirts";
const CustomizeOrder = ({ closeModal, styleData }) => {
  console.log(styleData);
  const [currentNav, setCurrentNav] = useState("Tops");
  const topNavData = [
    {
      item: "Tops",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Bottoms",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Dresses",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {},
    },
    {
      item: "Outfits",
      link: "",
      navWidth: "min-w-[10rem] lg:min-w-w-[0]",
      handleFunction: (data) => {},
    },
    {
      item: "Skirts",
      link: "",
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
      handleFunction: (data) => {},
    },
  ];

  const clickCurrentNav = (item) => {
    setCurrentNav(item);
  };
  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      <CustomizeNav
        active={currentNav}
        data={topNavData}
        closeModal={closeModal}
        clickCurrentNav={clickCurrentNav}
      />

      {currentNav === "Tops" && (
        <Tops data={styleData.filter((item) => item.class === "tops")}  />
      )}

      {currentNav === "Bottoms" && (
        <Bottoms data={styleData.filter((item) => item.class === "bottoms")} />
      )}

      {currentNav === "Dresses" && (
        <Dresses data={styleData.filter((item) => item.class === "dresses")} />
      )}
      {currentNav === "Outfits" && (
        <Outfits data={styleData.filter((item) => item.class === "outfits")} />
      )}
      {currentNav === "Skirts" && (
        <Skirts data={styleData.filter((item) => item.class === "skirts")} />
      )}
    </div>
  );
};
export default CustomizeOrder;
