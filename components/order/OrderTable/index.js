import ExportComponent from "../../ExportButton";
import OrderTableItem from "../OrderTableItem";
import SearchInput from "@/components/SearchInput";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import Image from "next/image";
import Typography from "@/components/Typography";
import DropDown from "@/components/DropDown";
import OrderStatus from "../OrderStatus";
import userInfo from "../../../public/assets/svg/Info Circle.svg";
import { handleExport } from "@/utils/helper";
import MobileTableItem from "../OrderMobileTableItem";
import { useState } from "react";
const OrderTable = ({
  data,
  viewDetails,
  showRejectModal,
  handleFilfeterData,
  handleFilterWithDate,
}) => {
  return (
    <div className=" mt-4 min-h-[50vh]">
      <table className="w-full hidden lg:block border-3px">
        <thead className="w-full bg-[#F4F4F4]  border-primary border-solid">
          <tr>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Date
              </div>
            </th>
            <th className="w-[5%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Order ID
              </div>
            </th>
            {/* <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Product name
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Product price
              </div>
            </th> */}
            <th className="w-[10%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Customer name
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Amount paid
              </div>
            </th>
            <th className="w-[9%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Delivery Status
              </div>
            </th>
            <th className="w-[10%] px-2 py-4 text-[12px]">
              <ExportComponent
                handleExport={() => {
                  handleExport(data);
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <OrderTableItem
              {...item}
              viewDetails={viewDetails}
              showRejectModal={showRejectModal}
              key={index}
            />
          ))}
        </tbody>
      </table>
      <div>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <div className="w-[70%] block">
              <SearchInput
                placeholder="Search"
                setValue={(data) => {
                  handleFilfeterData(data);
                }}
              />
            </div>
            <div className="flex items-center justify-center">
              <Image src={icon} alt="" />
            </div>
            <div className="flex items-center justify-center">
              <div
                className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center"
                onClick={() => {
                  handleExport(data);
                }}
              >
                <Image src={exportIcon} alt="" />
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-between mt-8  bg-gray-300 rounded-t-[12px] ">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Orders
            </Typography>
            <DropDown
              data={[
                "This week",
                "Last week",
                "This month",
                "Last month",
                "Choose month",
                "Custom",
              ]}
              maxWidth={"max-w-[8rem]"}
              placeholder="Time Range"
              setValue={(startDate, endDate) => {
                handleFilterWithDate(startDate, endDate);
              }}
            />
          </div>
          {data.map((item, index) => {
            return <MobileTableItem item={item} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
