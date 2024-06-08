import Typography from "@/components/Typography";
import { useState } from "react";
const PriceComp = ({ priceHandler, productAmount, listIndex }) => {
  const [price, setPrice] = useState(productAmount);
  return (
    <div className="flex items-center  px-4 rounded-[6px] justify-between border-[1px] border-solid border-gray-300">
      <div className="cursor-pointer py-1">
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          $
        </Typography>
      </div>
      <input
        placeholder=""
        value={price}
        onChange={(e) => {
          setPrice(e.target.value);
          priceHandler(e.target.value, listIndex);
        }}
        className="w-full h-full ml-6 font-[500] text-[16px]"
      />
      {/* <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          {productAmount}
        </Typography>
      </div> */}
    </div>
  );
};
export default PriceComp;
