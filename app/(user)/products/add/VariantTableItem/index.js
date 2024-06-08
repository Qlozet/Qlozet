import OrderStatus from "@/components/order/OrderStatus";
import AddQuantity from "../Quantity";
import AvailableSize from "../AvailableSize";
import Variant from "../Variant";
import Image from "next/image";
import checkboxIcon from "../../../../../public/assets/svg/checkbox-gray.svg";
import trashGray from "../../../../../public/assets/svg/trash-gray.svg";
import Size from "@/components/Size.js";
import VariantImage from "@/components/Products/VariantImage";
import PriceComp from "../PriceComponent";
const VariantTableItem = ({
  item,
  index,
  quantityHandler,
  submitImage,
  priceHandler,
}) => {
  console.log(item);
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal px-4 py-3 text-dark border-solid border-r-[1px] border-gray-300 flex items-center gap-2">
        <Variant bg={item.color} />
        <Size value={item.sizes[0]} />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <AddQuantity
          quantityHandler={quantityHandler}
          quantity={item.quantity}
          listIndex={index}
        />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <PriceComp
          listIndex={index}
          productAmount={item.prize}
          priceHandler={priceHandler}
        />
      </td>
      <td className="text-[12px] font-normal px-4 py-2 text-dark border-solid border-r-[1px] border-gray-300">
        <div className="flex items-center gap-3">
          <VariantImage
            listIndex={index}
            imageIndex={0}
            submitImage={submitImage}
          />
          <VariantImage
            listIndex={index}
            imageIndex={1}
            submitImage={submitImage}
          />
          <VariantImage
            listIndex={index}
            imageIndex={2}
            submitImage={submitImage}
          />
          <VariantImage
            listIndex={index}
            imageIndex={3}
            submitImage={submitImage}
          />
          <VariantImage
            listIndex={index}
            imageIndex={4}
            submitImage={submitImage}
          />
        </div>
      </td>
      <td className="text-[12px] font-normal px-1  text-dark  border-solid border-r-[1px] border-gray-300">
        <div className="flex w-[100%] justify-between px-4">
          <div>
            <Image src={checkboxIcon} alt="" />
          </div>
        </div>
      </td>
      <td className="text-[12px] font-normal px-1  text-dark  border-solid border-r-[1px] border-gray-300">
        <div className="flex w-[100%] justify-between px-4">
          <div>
            <Image src={trashGray} alt="" />
          </div>
        </div>
      </td>

      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default VariantTableItem;
