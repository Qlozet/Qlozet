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
  handleFilfeterData,
}) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full hidden md:block">
        <thead className="w-full bg-[#F4F4F4] text-dark ">
          <tr>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Picture
              </div>
            </th>
            <th className="w-[12%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Customer name
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Email address
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Phone number
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Total orders
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Last Order date
              </div>
            </th>
            <th className="w-[6%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Status
              </div>
            </th>
            <th className="w-[12%] px-2 py-4 text-[12px]">
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
                "Last month",
                "This month",
                "Choose month",
                "Custom",
              ]}
              placeholder="Time Range"
              maxWidth={"max-w-[7.5rem]"}
              setValue={(data) => {}}
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
