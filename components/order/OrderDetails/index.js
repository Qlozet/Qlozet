import OrderDetailNav from "../OrderdetailsNav";
import defaultImage from "../../../public/assets/image/default.png";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../OrderStatus";
import Button from "../../Button";
const OrderDetails = ({ topNavData, closeModal }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 mb-3">
      <div className="px-5 "></div>
      <OrderDetailNav
        active="Order details"
        data={topNavData}
        closeModal={closeModal}
      />
      <div className=" w-[40%] bg-white p-4 rounded-b-[14px]">
        <div className="bg-auto bg-no-contain">
          <Image
            src={defaultImage}
            className="w-[148.13px] h-[203.13px] rounded-[12px]"
          />
        </div>
        <Typography
          textColor="text-dark"
          textWeight="font-bold"
          textSize="text-[18px]"
        >
          Amasi Queen Shirt
        </Typography>
        <div className="max-w-[13rem]">
          <OrderStatus
            text="View customization details"
            color="text-[#3E1C01]"
            // addMaxWidth={true}
            bgColor="bg-[#D4CFCA]"
          />
        </div>
        <div className="flex justify-between items-center py-4">
          <div>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Ship Order
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Toggle button to set order as ready to ship
            </Typography>
          </div>
          <div></div>
        </div>

        <div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-dark"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
        </div>

        <div className="flex justify-end items-center gap-5  ">
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Reject Order"
              btnSize="large"
              variant="outline"
              clickHandler={() => {}}
              maxWidth="max-w-[14rem]"
            />
          </div>
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Confirm order "
              btnSize="large"
              variant="primary"
              clickHandler={() => {}}
              maxWidth="max-w-[14rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
