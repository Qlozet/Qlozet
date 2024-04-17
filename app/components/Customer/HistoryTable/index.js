import ExportComponent from "../../ExportButton";
import HistoryTableItem from "../HistoryTableItem";
// import OrderTableItem from "../OrderTableItem";
const HistoryTable = ({ data, modal }) => {
  return (
    <div className="">
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
                Product name
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Product price
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Amount paid
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Delivery Status
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <HistoryTableItem
            modal={modal}
            date="Hello"
            productName="Hello"
            productPrice="Hello"
            AmountPaid="Hello"
            DeliveryStatus="Hello"
          />
          <HistoryTableItem
            modal={modal}
            date="Hello"
            productName="Hello"
            productPrice="Hello"
            AmountPaid="Hello"
            DeliveryStatus="Hello"
          />
          <HistoryTableItem
            modal={modal}
            date="Hello"
            productName="Hello"
            productPrice="Hello"
            AmountPaid="Hello"
            DeliveryStatus="Hello"
          />
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
