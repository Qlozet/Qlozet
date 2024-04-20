import ExportComponent from "../../ExportButton";
import WalletTableItem from "../WalletTableItem";
const WalletTable = ({ data, viewDetails, showRejectModal }) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Date
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Transaction ID
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Transaction type
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Narration
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Amount
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Status
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <ExportComponent />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <WalletTableItem
              {...item}
              viewDetails={viewDetails}
              showRejectModal={showRejectModal}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WalletTable;
