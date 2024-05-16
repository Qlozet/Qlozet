import SearchInput from "@/components/SearchInput";
import ExportComponent from "../../ExportButton";
import WalletTableItem from "../WalletTableItem";
import Image from "next/image";
import Typography from "@/components/Typography";
import DropDown from "@/components/DropDown";
import OrderStatus from "@/components/order/OrderStatus";
import icon from "../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../public/assets/svg/Content.svg";
const WalletTable = ({ data, viewDetails, showRejectModal }) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full hidden md:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Date
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Transaction ID
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Transaction type
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Narration
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Amount
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Status
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <ExportComponent />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <WalletTableItem
              key={index}
              {...item}
              viewDetails={viewDetails}
              showRejectModal={showRejectModal}
            />
          ))}
        </tbody>
      </table>

      <div>
        <div className="block md:hidden">
          <div className="flex items-center justify-between">
            <div className="w-[70%] block">
              <SearchInput placeholder="Search" />
            </div>
            <div className="flex items-center justify-center">
              <Image src={icon} />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center">
                <Image src={exportIcon} />
              </div>
            </div>
          </div>
          <div className="p-2 flex items-center justify-between mt-14  bg-gray-300 rounded-t-[12px]">
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
              placeholder="Time Range"
              setValue={(data) => {}}
            />
          </div>
          {data.map((item, index) => {
            return (
              <div className="p-4 bg-white" key={index}>
                <div className="flex justify-between items-center">
                  <div>
                    <Typography
                      textColor="text-gray-200"
                      textWeight="font-normal"
                      textSize="text-[14px]"
                    >
                      Ref ID
                    </Typography>
                    <Typography
                      textColor="text-dark"
                      textWeight="font-normal"
                      textSize="text-[16px]"
                    >
                      12345678910
                    </Typography>
                    <Typography
                      textColor="text-gray-200"
                      textWeight="font-normal"
                      textSize="text-[14px]"
                    >
                      Account
                    </Typography>
                    <Typography
                      textColor="text-dark"
                      textWeight="font-normal"
                      textSize="text-[16px]"
                    >
                      $123,476,000
                    </Typography>
                  </div>
                  <div className="flex flex-col items-end">
                    <OrderStatus
                      text="Out for delivery"
                      bgColor="bg-[#DEF1FF]"
                      color="text-[#3893FE]"
                      addMaxWidth={true}
                    />
                    <div className="my-2">
                      <Typography
                        textColor="text-gray-200"
                        textWeight="font-normal"
                        textSize="text-[14px]"
                      >
                        Product
                      </Typography>
                    </div>
                    <Typography
                      textColor="text-dark"
                      textWeight="font-normal"
                      textSize="text-[16px]"
                    >
                      12345678910
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WalletTable;
