import questionMarkIcon from "../../../public/assets/svg/question-mark 1.svg";
import closeIcon from "../../../public/assets/svg/close-square.svg";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearToken } from "@/utils/localstorage";
import { getProductId } from "@/utils/localstorage";
import { deleteRequest } from "@/api/method";
import toast from "react-hot-toast";
import { useState } from "react";
import Toast from "@/components/ToastComponent/toast";
const DeleteProduct = ({ deleteFunction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    const productId = getProductId();
    try {
      setIsLoading(true);
      const response = await deleteRequest(`/vendor/products/${productId}`);
      response && setIsLoading(false);

      if (response?.code === 200) {
        toast(<Toast text={response?.message} type="success" />);
        deleteFunction(productId);
      } else {
      }
    } catch (error) {
      error && setIsLoading(false);
      toast(<Toast text={error?.message} type="success" />);
    }
  };
  const router = useRouter();
  return (
    <div className="relative bg-white  w-full lg:w-[35%] rounded-[12px] flex flex-col items-center gap-6 p-6">
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => {
          deleteFunction();
        }}
      >
        <Image src={closeIcon} alt="" />
      </div>
      <Image src={questionMarkIcon} alt="" />
      <Typography
        textColor="text-black"
        textWeight="font-bold"
        textSize="text-[18px]"
        align="text-center"
      >
        Are you sure you want to delete this product?
      </Typography>
      <Typography
        textColor="text-black"
        textWeight="font-normal"
        textSize="text-xs"
        align="text-center"
      >
        Removing this product will erase all stored information about it from
        your dashboard.
      </Typography>
      <Button
        loading={isLoading}
        children="Delete Product"
        btnSize="large"
        variant="danger"
        clickHandler={() => {
          handleDelete();
        }}
      />
    </div>
  );
};
export default DeleteProduct;
