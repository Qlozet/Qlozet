import OrderDetailNav from "../../order/OrderdetailsNav";
import defaultImage from "../../../public/assets/image/Rectangle.png";
import Image from "next/image";
import Typography from "../../Typography";
import OrderStatus from "../../order/OrderStatus";
import Button from "../../Button";
const CustomerDetails = ({ topNavData, closeModal, customer }) => {
  console.log(customer);
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
            alt="Customer image"
            src={defaultImage}
            className="w-[148px] h-[115px] rounded-[12px]"
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
                textSize="text-[12px]"
              >
                Name
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[12px]"
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
                textSize="text-[12px]"
              >
                Email address
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[12px]"
              >
                {customer.customerEmail}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-[12px]"
              >
                Phone number 1
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[12px]"
              >
                {customer.customerPhoneNumber}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-[12px]"
              >
                Phone number 2
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[12px]"
              >
                {customer.customerPhoneNumber}
              </Typography>
            </div>
          </div>
          <div className="flex items-center py-3 gap-10 border-t-[1px] border-solid border-gray-200 ">
            <div className="w-[35%]">
              <Typography
                textColor="text-dark"
                textWeight="font-[400]"
                textSize="text-[12px]"
              >
                Shipping address
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-[12px]"
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
