import Typography from "@/components/Typography";
import Image from "next/image";
import closeIcon from "../../../../public/assets/svg/material-symbol-close-icon.svg";
import { useState } from "react";
const Design = ({ id, image, name, reduce }) => {
  let data = [];
  const selecteHandler = () => {
    setSelcted(true);
    const localData = localStorage.getItem("styleTypes");
    console.log(localData);
    if (!localData) {
      data = [{ id, name, image }];
    } else {
      const savedData = JSON.parse(localData);
      console.log(savedData);
      data = [...savedData, { id, name, image }];
    }
    localStorage.setItem("styleTypes", JSON.stringify(data));
  };

  const handleUnselect = () => {
    setSelcted(false);
  };

  const [selected, setSelcted] = useState(false);
  return (
    <div
      className={`flex-col gap-2 ${
        reduce ? "items-center" : ""
      }  justify-center border-solid  rounded-[6px] ${
        reduce ? "" : "min-w-[5rem]"
      }`}
    >
      <div className="relative">
        {selected && (
          <div>
            <div className="absolute top-0 left-0 flex items-center justify-center p-1 bg-[rgba(0,0,0,.5)] w-full h-full z-10"></div>
            <div
              className="absolute top-1 right-1 z-20 bg-danger rounded-[50%] p-[2px] cursor-pointer"
              onClick={handleUnselect}
            >
              <Image src={closeIcon} alt="" width={18} height={18} />
            </div>
          </div>
        )}

        <div>
          <Image
            src={image}
            alt=""
            className={`${
              reduce ? "w-[100%]" : "w-[4rem] h-auto"
            } cursor-pointer `}
            onClick={selecteHandler}
            width={18}
            height={18}
          />
        </div>
      </div>

      <Typography
        textColor="text-dark"
        textWeight="font-[400]"
        textSize="text-[10px]"
        align="center"
      >
        {name}
      </Typography>
    </div>
  );
};

export default Design;
