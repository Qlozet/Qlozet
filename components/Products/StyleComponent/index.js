import Image from "next/image";
import { useState } from "react";
const StyleComp = ({ image, setPriceHandler }) => {
  const [price, setPrice] = useState("");
  return (
    <div className=" max-w-[80px]">
      <Image src={image} alt="" className="m-auto" width={50} height={50} />
      <div className="max-h-[2rem] flex max-w-[80px] overflow-hidden gap-4 border-[1px] border-solid border-gray-200 rounded mt-2 mx-auto">
        <span className="font-medium text-[14px] pl-1">$</span>
        <input
          value={price}
          className="max-w-[50px] border-none outline-none font-medium text-[14px] py-1 focus:border-0"
          onChange={(e) => {
            setPrice(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default StyleComp;
