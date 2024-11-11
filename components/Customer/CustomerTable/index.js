import { handleExport } from "@/utils/helper";
import ExportComponent from "../../ExportButton";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import CustomerTableItem from "../CustomerTableItem";
import DropDown from "@/components/DropDown";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import MobileCutomerItem from "../MobileCustomer";
const CustomerTable = ({
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
              <div className="flex items-center justify-start font-[500]  text-dark">
                Picture
              </div>
            </th>
            <th className="w-[12%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Customer name
              </div>
            </th>
            {/* <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Email address
              </div>
            </th>
            <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Phone number
              </div>
            </th> */}
            <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Total orders
              </div>
            </th>
            <th className="w-[8%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Last Order date
              </div>
            </th>
            <th className="w-[6%] px-2 py-3 text-xs">
              <div className="flex items-center justify-start font-[500]  text-dark">
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
                <Image src={exportIcon} />
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-between mb-4">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Customers
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
