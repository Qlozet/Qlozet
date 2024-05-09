import OrderDetailNav from "../../order/OrderdetailsNav";
import defaultImage from "../../../public/assets/image/Rectangle.png";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../../order/OrderStatus";
import Button from "../../Button";
const CustomerDetails = ({ topNavData, closeModal }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      <OrderDetailNav
        active="Customer details"
        data={topNavData}
        closeModal={closeModal}
      />
      <div className="w-full md:w-[40%] bg-white p-4 rounded-b-[14px]">
        <div className="bg-auto bg-no-contain">
          <Image
            src={defaultImage}
            className="w-[148px] h-[115px] rounded-[12px]"
          />
        </div>
        <div className="flex justify-between items-center py-4">
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
          <div className="mt-10 flex items-center justify-end"></div>
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Close"
              btnSize="large"
              variant="primary"
              clickHandler={() => {}}
              maxWidth="max-w-[14rem]"
              minWidth="w-[7rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;
