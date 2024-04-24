import ExportComponent from "../../ExportButton";
import CustomerTableItem from "../CustomerTableItem";
const CustomerTable = ({ data, viewDetails, showModal }) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] text-dark ">
          <tr>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Picture
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Customer name
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Email address
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Phone number
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Total orders
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Last Order date
              </div>
            </th>
            <th className="w-[8%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
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
