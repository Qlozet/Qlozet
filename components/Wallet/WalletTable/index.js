import SearchInput from "@/components/SearchInput";
import ExportComponent from "../../ExportButton";
import WalletTableItem from "../WalletTableItem";
import Image from "next/image";
import Typography from "@/components/Typography";
import DropDown from "@/components/DropDown";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
import MobileItem from "../MobileTableItem";
import { handleExport } from "@/utils/helper";
const WalletTable = ({
  data,
  viewDetails,
  showRejectModal,
  handleFilterData,
}) => {
  return (
    <div className="mt-4 min-h-[50vh] overflow-hidden rounded-xl">
      <table className="w-full hidden lg:block overflow-hidden rounded-xl">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-xs pl-6">
              <div className="flex items-center justify-start font-[500] text-dark">
                Date
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500] text-dark">
                Transaction ID
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500] text-dark">
                Transaction type
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500] text-dark">
                Narration
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500] text-dark">
                Amount
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-[500] text-dark">
                Status
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <ExportComponent
                handleExport={() => {
                  handleExport(data);
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            return (
              <WalletTableItem
                key={index}
                {...item}
                viewDetails={viewDetails}
                showRejectModal={showRejectModal}
              />
            );
          })}
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
                <Image src={exportIcon} />
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-between mt-14   bg-[#F4F4F4] rounded-t-[12px]">
            <Typography
              textColor="text-dark"
              textWeight="font-bold"
              textSize="text-[18px]"
            >
              Wallet
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
              maxWidth={"max-w-[7.5rem]"}
              placeholder="Time Range"
              setValue={(data) => { }}
            />
          </div>
          {data.map((item, index) => {
            return <MobileItem item={item} index={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default WalletTable;
