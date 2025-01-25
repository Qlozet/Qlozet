import ExportComponent from "../../ExportButton";
import CustomerHistoryTableItem from "../CustomerHistoryTableItemMobile";
import HistoryTableItem from "../HistoryTableItem";
// import OrderTableItem from "../OrderTableItem";
const HistoryTable = ({ data, modal }) => {
  return (
    <div className="">
      <table className="w-full hidden md:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Date
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Product name
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Product price
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Amount paid
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Delivery Status
              </div>
            </th>
            <th className="w-[8%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <HistoryTableItem
              modal={modal}
              date="Hello"
              productName="Hello"
              productPrice="Hello"
              AmountPaid="Hello"
              DeliveryStatus="Hello"
            />
          ))}
        </tbody>
      </table>
      <div>
        {/* <div>
          {data.map((item, index) => {
            <CustomerHistoryTableItem item={item} index={index} />;
          })}
        </div> */}
      </div>
    </div>
  );
};

export default HistoryTable;
