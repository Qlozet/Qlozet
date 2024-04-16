import Typography from "../../Typography";
import OrderStatus from "../OrderStatus";
import OrderDetailNav from "../OrderdetailsNav";
import defaultImage from "../../../../public/assets/image/default.png";
import Button from "../../Button";

const CustomerDetails = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      <OrderDetailNav active="Customer details" />
      <div className=" w-[40%] bg-white p-4 rounded-b-[14px]">
        <div
          className="bg-auto bg-no-repeat bg-center w-[6rem] h-[6rem]"
          style={{ backgroundImage: `url(${defaultImage})` }}
        ></div>
        <div className="flex justify-between items-center py-4">
          <div></div>
        </div>

        <div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-black"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-black"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-black"
              textWeight="font-bold"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <Typography
              textColor="text-black"
              textWeight="font-normal"
              textSize="text-[14px]"
            >
              Amasi Queen Shirt
            </Typography>
            <Typography
              textColor="text-black"
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
              children="Close"
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

export default CustomerDetails;
