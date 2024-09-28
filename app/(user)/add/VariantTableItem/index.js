import AddQuantity from "../Quantity";
import Variant from "../Variant";
import Image from "next/image";
import trashGray from "../../../../public/assets/svg/trash-gray.svg";
import Size from "@/components/Size.js";
import VariantImage from "@/components/Products/VariantImage";
import PriceComp from "../PriceComponent";
import CheckBoxInput from "@/components/CheckboxInput";
const VariantTableItem = ({
  item,
  index,
  quantityHandler,
  submitImage,
  priceHandler,
  handleChecked,
  handleDeleteVariantFromTable
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal px-4 py-3 text-dark border-solid border-r-[1px] border-gray-300 flex items-center gap-2">
        <Variant bg={item.color && item.color} />
        <Size value={item.size} />
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
          productAmount={item.price}
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
            <CheckBoxInput handleChange={(data) => {
              handleChecked(data, item.id)
            }} value={item.checked} />
          </div>
        </div>
      </td>
      <td className="text-[12px] font-normal px-1  text-dark  border-solid border-r-[1px] border-gray-300">
        <div className="flex w-[100%] justify-between px-3">
          <button className="hover:bg-primary p-1 rounded-sm" onClick={() => {
            handleDeleteVariantFromTable(item.id)
          }}>
            <Image src={trashGray} alt="" />
          </button>
        </div>
      </td>

      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default VariantTableItem;
