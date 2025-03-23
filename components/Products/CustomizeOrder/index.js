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
import SearchInput from "@/components/SearchInput";
import { Info, Plus, X } from "lucide-react";
const stylesImage1 = "/assets/image/vector1.png";
const CustomizeOrder = ({ closeModal, styleData }) => {
  const [currentNav, setCurrentNav] = useState("Tops");

  const clickCurrentNav = (item) => {
    setCurrentNav(item);
  };

  const styles = ["Tops", "Dresses", "Bottoms", "Neck", "Sleeves", "Full Fit"];
  const stylesBottom = ["Round", "V-shaped", "High", "Low", "Collared"];
  const clothsStyles = [
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
    { imageUrl: stylesImage1, name: "Queen anna" },
  ];
  return (
    <div className="flex flex-col items-center justify-center w-full my-4 ">
      {/* <CustomizeNav
        active={currentNav}
        data={topNavData}
        closeModal={closeModal}
        clickCurrentNav={clickCurrentNav}
      />
      {currentNav === "Tops" && (
        <Tops data={styleData.filter((item) => item.class === "tops")} />
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
      )} */}

      <div className="bg-white  w-full lg:w-[775px] rounded-[16px]">
        <div className="flex items-center justify-between border-dashed border-b-[1.5px] border-gray-300 mx-6">
          <div className="w-[85%] flex items-center ">
            <div className="w-56">
              <Typography textWeight={"font-500"}>Select Styles</Typography>
            </div>
            <SearchInput />
          </div>
          <button className="bg-transparent border-none flex items-center">
            <X />
          </button>
        </div>
        <div className="my-6 flex items-center justify-end px-6">
          <Button
            children={
              <span className="flex justify-center items-center ">
                Add Style <Plus className="text-dark h-4 w-4" />
              </span>
            }
            btnSize="small"
            variant="outline"
            clickHandler={() => {
              router.push("/add");
              clearProductId();
            }}
          />
        </div>

        <div className="bg-primary-300 rounded-[12px] flex items-center px-3 py-3 gap-4 mx-6">
          <button className=" w-8 h-8 bg-[#CBC2BB] rounded-[12px] flex items-center justify-center">
            <Info />
          </button>
          <div>
            <p className="text-sm text-[#808192] ">
              Choose the styles you would like to present to your customers{" "}
            </p>
          </div>
        </div>

        <div className="my-6">
          {" "}
          <div className="flex items-center mx-4">
            {styles.map((item, index) => (
              <span
                key={index}
                className={`h-[40px] px-3 flex items-center justify-center text-sm cursor-pointer rounded-t-[10px] ${currentNav === item ? "bg-[#F8F8F8F8]" : ""
                  }`}
                onClick={() => setCurrentNav(item)}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="bg-[#F8F8F8F8] pt-[2px] pb-10">
            <div className="#F8F8F8F1">
              <div className="flex items-center mx-4 mt-4">
                {stylesBottom.map((item, index) => (
                  <span
                    key={index}
                    className={`h-[40px] px-3 flex items-center justify-center text-sm cursor-pointer rounded-t-[10px] ${currentNav === item ? "bg-[#ECEBEB]" : ""
                      }`}
                    onClick={() => setCurrentNav(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mx-6 ">
                <div className="grid grid-cols-7 gap-4 ">
                  {clothsStyles.map((item) => (
                    <div className="flex items-center justify-center flex-col gap-4 bg-white  py-8 rounded-[16px]">
                      <img src={item.imageUrl} />
                      <p className="text-xs">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>
          <div className="mx-6 mt-6">
            <Button
              minWidth={"152px"}
              children={
                <span className="flex justify-center items-center ">
                  Use Styles <Plus className="text-dark h-4 w-4" />
                </span>
              }
              btnSize="small"
              variant="primary"
              clickHandler={() => {
                router.push("/add");
                clearProductId();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomizeOrder;
