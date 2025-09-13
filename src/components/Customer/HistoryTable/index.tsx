import React from 'react';
import ExportComponent from "../../ExportButton";
import CustomerHistoryTableItem from "../CustomerHistoryTableItemMobile";
import HistoryTableItem from "../HistoryTableItem";

interface HistoryTableItemData {
  id: string;
  date: string;
  productName: string;
  productPrice: string;
  AmountPaid: string;
  DeliveryStatus: string;
}

interface HistoryTableProps {
  data: HistoryTableItemData[];
  modal: () => void; // Assuming modal is a function that opens a modal
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data, modal }) => {
  return (
    <div className="">
      <table className="w-full hidden md:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">Date</div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">Product name</div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">Product price</div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">Amount paid</div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">Delivery Status</div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <HistoryTableItem
              key={item.id} // Use a unique key from item data
              modal={modal}
              date={item.date}
              productName={item.productName}
              productPrice={item.productPrice}
              AmountPaid={item.AmountPaid}
              DeliveryStatus={item.DeliveryStatus}
              id={item.id}
            />
          ))}
        </tbody>
      </table>
      <div>
        {/* Mobile view rendering can go here if needed */}
      </div>
    </div>
  );
};

export default HistoryTable;