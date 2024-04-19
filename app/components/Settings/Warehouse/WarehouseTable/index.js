import OrderTableItem from "../../../order/OrderTableItem";
import WarehouseTableItem from "../warehouseTableItem";

const WearhousetTable = () => {
  const data = [
    {
      warehouseName: "helloe",
      vendorName: "helloe",
      warehouseAddress: "helloe",
      contactName: "helloe",
      PhoneNumber: "helloe",
      Email: "helloe",
      Status: "helloe",
    },
    {
      warehouseName: "helloe",
      vendorName: "helloe",
      warehouseAddress: "helloe",
      contactName: "helloe",
      PhoneNumber: "helloe",
      Email: "helloe",
      Status: "helloe",
    },
    {
      warehouseName: "helloe",
      vendorName: "helloe",
      warehouseAddress: "helloe",
      contactName: "helloe",
      PhoneNumber: "helloe",
      Email: "helloe",
      Status: "helloe",
    },
  ];
  return (
    <table className="w-full">
      <thead className="w-full bg-[#F4F4F4] ">
        <tr>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Warehouse name
            </div>
          </th>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Vendor’s name
            </div>
          </th>
          <th className="w-[10%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Warehouse address{" "}
            </div>
          </th>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Contact name
            </div>
          </th>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Phone number
            </div>
          </th>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Email
            </div>
          </th>
          <th className="w-[8%] p-4 text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Status
            </div>
          </th>
          <th className="w-[3%] p-4 text-[12px]"></th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <WarehouseTableItem
            {...item}
            // viewDetails={viewDetails}
            // showRejectModal={showRejectModal}
          />
        ))}
      </tbody>
    </table>
  );
};

export default WearhousetTable;
