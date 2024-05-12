import threeDotIcon from "../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import OrderStatus from "@/components/order/OrderStatus";
import Modal from "../../Modal";
import defaultImage from "../../../public/assets/image/default.png";
import Quantity from "../Quantity";
const ProductTableItem = ({
  picture,
  productName,
  productPrice,
  category,
  productType,
  tag,
  quiantity,
  ProductStatus,
}) => {
  return (
    <tr className="border-b-[1.5px] border-solid border-gray-300 bg-white">
      <td className="text-[12px] font-normal p-4 text-dark">
        <Image src={defaultImage} alt="" />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{productName}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productPrice}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{category}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{productType}</td>
      <td className="text-[12px] font-normal p-4 text-dark">{tag}</td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <Quantity />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">
        <OrderStatus
          text="Active"
          bgColor="bg-success-300"
          color="text-success"
          addMaxWidth={true}
        />
      </td>
      <td className="text-[12px] font-normal p-4 text-dark">{tag}</td>
    </tr>
  );
};

export default ProductTableItem;
