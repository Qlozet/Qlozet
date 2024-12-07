import Typography from "@/components/Typography";
import { useEffect, useState } from "react";
const PriceComp = ({ priceHandler, productAmount, id, color }) => {
  const [price, setPrice] = useState(productAmount);

  useEffect(() => {
    setPrice(productAmount)
  }, [productAmount])
  return (
    <div className="flex items-center  px-2 rounded-md justify-between border-[1px] border-solid border-gray-300">
      <div className="cursor-pointer py-1">
        <Typography
          textColor="text-primary"
          textWeight="font-medium"
          textSize=""
        >
          $
        </Typography>
      </div>
      <input
        placeholder=""
        value={price}
        onChange={(e) => {
          setPrice(e.target.value);
          priceHandler(e.target.value, id, color);
        }}
        className="w-full h-full ml-2 font-medium  p-1"
      />
    </div>
  );
};
export default PriceComp;
