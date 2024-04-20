import ExportComponent from "../../ExportButton";
import CustomerTableItem from "../CustomerTableItem";
const CustomerTable = ({ data, viewDetails, showModal }) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Picture
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Customer name
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Email address
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Phone number
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Total orders
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]">
                Last Order date
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
            <CustomerTableItem {...item} viewDetails={showModal} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
