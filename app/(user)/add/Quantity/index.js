import Typography from "@/components/Typography";
import { useState } from "react";
const AddQuantity = ({ quantityHandler, quantity, listIndex }) => {
  const [qty, setQty] = useState(quantity);
  return (
    <div className="flex items-center py-1 px-4 rounded-[6px] justify-between border-[1px] border-solid border-gray-300">
      <div
        className="cursor-pointer"
        onClick={() => {
          setQty(qty - 1);
          quantityHandler(listIndex, "decrease");
        }}
      >
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          -
        </Typography>
      </div>
      <div>
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          {qty}
        </Typography>
      </div>
      <div
        className="cursor-pointer"
        onClick={() => {
          setQty(qty + 1);
          quantityHandler(listIndex, "increase");
        }}
      >
        <Typography
          textColor="text-primary"
          textWeight="font-[500]"
          textSize="text-[16px]"
        >
          +
        </Typography>
      </div>
    </div>
  );
};
export default AddQuantity;
