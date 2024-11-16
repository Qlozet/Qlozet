import Typography from "@/components/Typography";
import WarehouseTableItem from "../warehouseTableItem";
import threeDot from "../../../../public/assets/svg/three-dot.svg";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import icon from "../../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../../public/assets/svg/Content.svg";
import { handleExport } from "@/utils/helper";
const WearhousetTable = ({ data, handleFilterData }) => {
  return (
    <div>
      <table className="w-full hidden lg:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark ">
                Warehouse name
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                Vendor’s name
              </div>
            </th>
            <th className="w-[10%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                Warehouse address{" "}
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                Contact name
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                Phone number
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                email
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500]   text-dark">
                Status
              </div>
            </th>
            <th className="w-[3%] p-4 text-xs"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <WarehouseTableItem
              {...item}
              key={index}
            // viewDetails={viewDetails}
            // showRejectModal={showRejectModal}
            />
          ))}
        </tbody>
      </table>
      <div className=" md:hidden">
        <div>
          <div className="">
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
            <div className=" bg-[#F4F4F4] p-4 rounded-t-[12px] lg:hidden">
              <Typography
                textColor="text-dark"
                textWeight="font-[700]"
                textSize="text-[16px]"
              >
                Warehouse
              </Typography>
            </div>

            {data.map((item, index) => (
              <div
                key={index}
                className={`border-l-[4px] border-solid border-success bg-white my-4 rounded-[12px] shadow py-4`}
              >
                <div className="px-4 flex item-center justify-between ">
                  <div className="flex items-center">
                    <div
                      className={`border-solid border-[1px] border-success w-[1rem] h-[1rem] rounded-[5px]`}
                    ></div>
                  </div>

                  <div className="flex item-center justify-center">
                    <Image src={threeDot} alt="" />
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[400]"
                    textSize="text-sm"
                  >
                    Warehouse name
                  </Typography>
                  <div className="flex items-center justify-end">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[500]"
                      textSize="text-sm"
                    >
                      {item.warehouseName}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[400]"
                    textSize="text-sm"
                  >
                    Vendor ID
                  </Typography>
                  <div className="flex items-center justify-end">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[500]"
                      textSize="text-sm"
                    >
                      {item.vendorId}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[400]"
                    textSize="text-sm"
                  >
                    Phone number{" "}
                  </Typography>
                  <div className="flex items-center justify-end">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[500]"
                      textSize="text-sm"
                    >
                      {item.PhoneNumber}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[400]"
                    textSize="text-sm"
                  >
                    email address
                  </Typography>
                  <div className="flex items-center justify-end">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[500]"
                      textSize="text-sm"
                    >
                      {item.email}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[400]"
                    textSize="text-sm"
                  >
                    Address
                  </Typography>
                  <div className="flex items-center justify-end">
                    <Typography
                      textColor="text-dark"
                      textWeight="font-[500]"
                      textSize="text-sm"
                    >
                      {item.warehouseAddress}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearhousetTable;
