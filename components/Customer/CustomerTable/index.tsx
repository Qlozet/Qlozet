import React from 'react';
import Image from "next/image";
import { handleExport } from "@/utils/helper";
import ExportComponent from "../../ExportButton";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import CustomerTableItem from "../CustomerTableItem";
import DropDown from "@/components/DropDown";
import SearchInput from "@/components/SearchInput";
import Typography from "@/components/Typography";
import MobileCutomerItem from "../MobileCustomer";

interface CustomerTableItemData {
  picture: string;
  customerName: string;
  status: { text: string; bgColor: string; color: string };
  totalOrders: number;
  lastOrderDate: string;
  phone: string;
  emailAddress: string;
  customerId: string;
}

interface CustomerTableProps {
  data: CustomerTableItemData[];
  viewDetails: (customerId: string) => void;
  showModal: (customerId: string) => void;
  handleFilterData: (data: string) => void;
  handleFilterWithDate: (startDate: string, endDate: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  viewDetails,
  showModal,
  handleFilterData,
  handleFilterWithDate,
}) => {
  return (
    <div className="mt-4 min-h-[50vh] overflow-hidden rounded-xl">
      <table className="w-full hidden md:block overflow-hidden rounded-xl">
        <thead className="w-full bg-[#F4F4F4] text-dark ">
          <tr>
            <th className="w-[8%] px-2 py-3 pl-6 text-xs">
              <div className="flex items-center justify-start font-medium  text-dark">
                Picture
              </div>
            </th>
            <th className="w-[12%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-medium  text-dark">
                Customer name
              </div>
            </th>
            <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-medium  text-dark">
                Total orders
              </div>
            </th>
            <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-medium  text-dark">
                Last Order date
              </div>
            </th>
            <th className="w-[6%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-medium  text-dark">
                Status
              </div>
            </th>
            <th className="w-[12%] px-2 py-3 text-xs border-solid ">
              <div className=" flex items-center justify-end  ">
                <div className="border-primary border-[1.5px] rounded-lg">
                  <ExportComponent
                    handleExport={() => {
                      handleExport(data);
                    }}
                  />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <CustomerTableItem {...item} viewDetails={showModal} key={index} />
          ))}
        </tbody>
      </table>
      <div>
        <div className="block md:hidden">
          <div className="flex items-center justify-between">
            <div className="w-[70%] block">
              <SearchInput
                placeholder="Search"
                setValue={(val) => {
                  handleFilterData(val);
                }}
                value={''} // Provide a default value or manage state for SearchInput
              />
            </div>
            <div className="flex items-center justify-center">
              <Image src={icon} alt="Filter Icon" />
            </div>
            <div className="flex items-center justify-center">
              <div
                className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center"
                onClick={() => {
                  handleExport(data);
                }}
              >
                <Image src={exportIcon} alt="Export Icon" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 py-4 bg-[#f4f4f4]">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Customers
            </Typography>
            <DropDown
              data={[
                { id: "this-week", text: "This week" },
                { id: "last-week", text: "Last week" },
                { id: "this-month", text: "This month" },
                { id: "last-month", text: "Last month" },
                { id: "choose-month", text: "Choose month" },
                { id: "custom", text: "Custom" },
              ]}
              maxWidth={"max-w-[8rem]"}
              placeholder="Time Range"
              setValue={(text, id) => {
                // Assuming DropDown setValue passes text and id
                // You might need to adjust handleFilterWithDate to accept these
                handleFilterWithDate(text, id as string);
              }}
              value={''} // Provide a default value or manage state for DropDown
            />
          </div>
          <div>
            {data.map((item, index) => (
              <MobileCutomerItem
                {...item}
                viewDetails={showModal}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;