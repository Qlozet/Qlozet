import Typography from "@/components/Typography";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
const AddQuantity = ({ quantityHandler, quantity, listIndex }) => {
  const [qty, setQty] = useState(quantity);
  return (
    <div className="flex items-center py-2 px-4 rounded-md  justify-between border-[1px]  border-solid border-gray-300">
      <button
        className="cursor-pointer hover:bg-gray-300 w-7 h-7 flex items-center justify-center rounded"
        onClick={() => {
          setQty(parseInt(qty) + 1);
          quantityHandler(listIndex, "decrease");
        }}
      >

        <Minus />
      </button>
      <div>
        <input value={qty} className="text-primary font-medium text-base max-w-20 flex items-center justify-center" onChange={(e) => {
          const re = /^[0-9\b]+$/;
          if (e.target.value === "" || re.test(e.target.value)) {
            setQty(e.target.value);
          }
        }} />

      </div>
      <button
        className="cursor-pointer hover:bg-gray-300 w-7 h-7 flex items-center justify-center rounded"
        onClick={() => {
          setQty(parseInt(qty) + 1);
          quantityHandler(listIndex, "increase");
        }}
      >
        <Plus />
      </button>
    </div>
  );
};
export default AddQuantity;
