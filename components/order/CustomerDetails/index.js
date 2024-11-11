import OrderDetailNav from "../../order/OrderdetailsNav";
import defaultImage from "../../../public/assets/image/Rectangle.png";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../../order/OrderStatus";
import Button from "../../Button";
const CustomerDetails = ({ topNavData, closeModal, customer }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      <OrderDetailNav
        active="Customer details"
        data={topNavData}
        closeModal={closeModal}
      />
      <div className="w-full lg:w-[40%] bg-white p-4 rounded-b-[8px]">
        <div className="bg-auto bg-no-contain">
          <Image
            alt="Product Image"
            src={customer.picture}
            width={30}
            height={30}
            style={{
              width: "10rem",
              height: "auto",
            }}
            unoptimized
            className="rounded-[6px]"
          />
        </div>
        <div className="flex justify-between items-center py-4">
          <div></div>
        </div>
        <div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Name
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                {customer.customerName}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Email address
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                {customer.emailAddress}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Phone number 1
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                {customer.phone}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Phone number 2
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                {customer.phone}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-xs"
              >
                Shipping address
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                {customer.custmerAddress}
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-5  ">
          <div className="mt-10 flex items-center justify-end"></div>
          <div className="mt-10 flex items-center justify-end">
            <Button
              children="Close"
              btnSize="large"
              variant="primary"
              clickHandler={closeModal}
              maxWidth="max-w-[14rem]"
              minWidth="w-[9rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;
