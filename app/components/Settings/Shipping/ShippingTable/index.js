import ShippingTableItem from "../ShippingTableItem";
const ShippingTable = () => {
  const data = [
    {
      Name: "Hello",
      Address: "Hello",
      PhoneNumber: "Hello",
      emailAddress: "Hello",
      noOfDeliveries: "Hello",
      adminName: "Hello",
      Status: "Hello",
    },
    {
      Name: "Hello",
      Address: "Hello",
      PhoneNumber: "Hello",
      emailAddress: "Hello",
      noOfDeliveries: "Hello",
      adminName: "Hello",
      Status: "Hello",
    },
    {
      Name: "Hello",
      Address: "Hello",
      PhoneNumber: "Hello",
      emailAddress: "Hello",
      noOfDeliveries: "Hello",
      adminName: "Hello",
      Status: "Hello",
    },
  ];
  return (
    <table className="w-full">
      <thead className="w-full bg-[#F4F4F4] ">
        <tr>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Name
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Address
            </div>
          </th>
          <th className="w-[10%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Phone number
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Email address
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              No of deliveries
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Admin name
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Status
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <ShippingTableItem
            {...item}
            // viewDetails={viewDetails}
            // showRejectModal={showRejectModal}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ShippingTable;
