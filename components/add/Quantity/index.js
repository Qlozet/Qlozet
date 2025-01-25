import Typography from "@/components/Typography";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
const AddQuantity = ({ quantityHandler, quantity, listIndex, borderColor }) => {
  const [qty, setQty] = useState(quantity);
  return (
    <div className={`flex items-center py-1 px-4 rounded-md  justify-between border-[1.5px]  border-solid ${borderColor ? "border-primary" : "border-gray-300"} w-full max-w-[150px]`}>
      <button
        className="cursor-pointer hover:bg-gray-300 w-4 h-7 flex items-center justify-center rounded"
        onClick={() => {
          setQty(parseInt(qty) + 1);
          quantityHandler(listIndex, "decrease");
        }}
      >
        <Minus />
      </button>
      <div>
        <input value={qty} className="text-primary font-medium text-base  flex items-center justify-center w-full " onChange={(e) => {
          const re = /^[0-9\b]+$/;
          if (e.target.value === "" || re.test(e.target.value)) {
            setQty(e.target.value);
          }
        }} style={{
          backgroundColor: "transparent"
        }} />

      </div>
      <button
        className="cursor-pointer hover:bg-gray-300 w-4 h-7 flex items-center justify-center rounded"
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
