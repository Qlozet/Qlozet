import { useState, useEffect } from "react";
import ExportComponent from "../../ExportButton";
import OrderTableItem from "../OrderTableItem";
import SearchInput from "@/components/SearchInput";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import Image from "next/image";
import Typography from "@/components/Typography";
import DropDown from "@/components/DropDown";
import { handleExport } from "@/utils/helper";
import MobileTableItem from "../OrderMobileTableItem";
const OrderTable = ({
  data,
  viewDetails,
  showRejectModal,
  handleFilterData,
  handleFilterWithDate,
}) => {
  const [exportData, setExportData] = useState([]);
  useEffect(() => {
  }, []);
  return (
    <div className=" mt-4 min-h-[50vh] overflow-hidden rounded-xl mb-8">
      <table className="w-full hidden lg:block border-3px overflow-hidden rounded-xl ">
        <thead className="w-full bg-[#F4F4F4]  px-[8px] border-solid border-primary rounded-tl-xl rounded-tr-xl">
          <tr className="">
            <th className="w-[8%] px-6 py-3 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Date
              </div>
            </th>
            <th className="w-[5%] px-3 py-3 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Order ID
              </div>
            </th>

            <th className="w-[10%] px-3 py-3 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Customer name
              </div>
            </th>
            <th className="w-[8%] px-3 py-3 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Amount paid
              </div>
            </th>
            <th className="w-[9%] px-3 py-3 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Delivery Status
              </div>
            </th>
            <th className="w-[10%] px-3 py-3 text-xs">
              <div className="flex items-center justify-end"> <ExportComponent
                handleExport={() => {
                  handleExport(exportData);
                }}
              /></div>

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
                  handleFilterData(data);
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
          <div className="p-2 flex items-center justify-between mt-4  bg-[#F4F4F4] rounded-t-[12px] ">
            <Typography
              textColor="text-dark"
              textWeight="font-medium"
              textSize="text-[18px]"
            >
              Orders
            </Typography>
            <DropDown
              data={[
                "Delivered",
                "Pending",
                "Failed",

              ]}
              maxWidth={"max-w-[8rem]"}
              placeholder="Time Range"
              setValue={(startDate, endDate, value) => {
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
