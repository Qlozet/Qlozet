import Image from "next/image";
import { useState } from "react";
const StyleComp = ({ image, setPriceHandler, price }) => {
  console.log(price);
  return (
    <div className=" max-w-[80px]">
      <Image
        src={image}
        alt=""
        className="m-auto max-w-[50px] max-h-[50px]"
        width={50}
        height={50}
      />
      <div className="max-h-[2rem] flex max-w-[80px] overflow-hidden  border-[1px] border-solid border-gray-200 rounded mt-2 mx-auto">
        <div className="font-medium text-[14px] flex items-center justify-center h-full mt-1">
          $
        </div>
        <input
          value={price}
          className="max-w-[50px] border-none outline-none font-medium text-[14px] py-1 focus:border-0"
          onChange={(e) => {
            console.log(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default StyleComp;
