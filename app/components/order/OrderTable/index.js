import OrderTableItem from "../OrderTableItem";
const OrderTable = ({ data }) => {
  return (
    <div className="mt-4">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[12%] p-4">
              {/* <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div> */}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <OrderTableItem {...item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
