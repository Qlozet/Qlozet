import Typography from "@/components/Typography";
import ShippingTableItem from "../ShippingTableItem";
import SearchInput from "@/components/SearchInput";
import icon from "../../../../public/assets/svg/Icon container.svg";
import exportIcon from "../../../../public/assets/svg/Content.svg";
import Image from "next/image";
const ShippingTable = () => {
  const data = [
    {
      Name: "GIG Logistics",
      Address: "14, Jones street, Lagos Nigeria",
      PhoneNumber: "+234 8123456789",
      emailAddress: "karlkeller@gmail.com",
      noOfDeliveries: "270",
      adminName: "Hello",
      Status: "Hello",
    },
    {
      Name: "GIG Logistics",
      Address: "14, Jones street, Lagos Nigeria",
      PhoneNumber: "+234 8123456789",
      emailAddress: "karlkeller@gmail.com",
      noOfDeliveries: "270",
      adminName: "Hello",
      Status: "Hello",
    },
    {
      Name: "GIG Logistics",
      Address: "14, Jones street, Lagos Nigeria",
      PhoneNumber: "+234 8123456789",
      emailAddress: "karlkeller@gmail.com",
      noOfDeliveries: "270",
      adminName: "Hello",
      Status: "Hello",
    },
  ];
  return (
    <div>
      <table className="w-full hidden lg:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                Name
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                Address
              </div>
            </th>
            <th className="w-[10%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                Phone number
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                Email address
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                No of deliveries
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-[500]">
                Admin name
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
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
      <div className="block lg:hidden">
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
        <div className="">
          <div className="bg-gray-300 p-4 rounded-t-[12px] lg:hidden">
            <Typography
              textColor="text-dark"
              textWeight="font-[700]"
              textSize="text-[16px]"
            >
              Shipping partners
            </Typography>
          </div>
          {data.map((item) => (
            <div
              className={`border-l-[4px] border-solid border-success bg-white my-4 rounded-[12px] shadow py-4`}
            >
              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  Name
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[500]"
                    textSize="text-sm"
                  >
                    {item.Name}
                  </Typography>
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  Phone Number
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[500]"
                    textSize="text-sm"
                  >
                    {item.PhoneNumber}
                  </Typography>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  No of Deliveries
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[500]"
                    textSize="text-sm"
                  >
                    {item.noOfDeliveries}
                  </Typography>
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  Email address
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[500]"
                    textSize="text-sm"
                  >
                    {item.emailAddress}
                  </Typography>
                </div>
              </div>
              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  Address
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-[500]"
                    textSize="text-sm"
                  >
                    {item.Address}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShippingTable;
