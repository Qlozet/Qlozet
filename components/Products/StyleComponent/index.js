import { EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
const StyleComp = ({ id, image, handleEditStylePrice, price }) => {
  const [stylePrice, setStylePrice] = useState(price);
  return (
    <div className="w-[100px]   flex items-start">
      <div>
        <div className="rounded-tl rounded-b"
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: "center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            height: "4.5rem",
            width: "100%",
          }}
        ></div>
        <div className="max-h-[2rem] flex max-w-[100px] overflow-hidden  border-[1px] border-solid rounded mt-2 mx-auto">
          <div className="text-sm flex items-center justify-center h-full mt-1 pl-1">
            $
          </div>
          <input
            value={stylePrice}
            className="max-w-[50px] border-none outline-none font-normal text-sm py-1 focus:border-0 pl-2"
            onChange={(e) => {
              const newPrice = e.target.value;
              setStylePrice(newPrice);
              handleEditStylePrice(newPrice, id);
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-1 bg-gray-300 mt-1 rounded-b-r rounded-t-r"> <Trash2 className="w-4 h-4 cursor-pointer" /><EllipsisVertical className="w-4 h-4 cursor-pointer" /></div>
    </div>
  );
};

export default StyleComp;
