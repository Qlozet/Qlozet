import React from 'react';
import OrderDetailNav from "../OrderdetailsNav";
import Image from "next/image";
import Typography from "../../Typography";

interface CustomerData {
  picture: string;
  customerName: string;
  // Add other customer properties as needed
}

interface CustomerDetailsProps {
  topNavData: any[]; // Define a more specific type if possible
  closeModal: () => void;
  customer: CustomerData;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ topNavData, closeModal, customer }) => {
  return (
    <div className="w-full h-full">
      <div className="p-4 rounded-b-[8px] bg-white max-w-[618px] mt-8 mx-auto">
        <OrderDetailNav
          active="Customer details"
          data={topNavData}
          closeModal={closeModal}
        />
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
            className="rounded-md"
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
                Total Orders
              </Typography>
            </div>
            <div className="flex-1">
              <Typography
                textColor="text-dark"
                textWeight="font-bold"
                textSize="text-xs"
              >
                21
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
                Status
              </Typography>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-5  ">
          <div className="mt-10 flex items-center justify-end"></div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;