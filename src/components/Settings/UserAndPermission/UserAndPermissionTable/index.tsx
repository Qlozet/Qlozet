import Typography from "@/components/Typography";
import UserAndPermissionTableItem from "../UserAndPermissionTableItem";
import SearchInput from "@/components/SearchInput";
import Image from "next/image";
import icon from "@/public/assets/svg/Icon container.svg";
import exportIcon from "@/public/assets/svg/Content.svg";
const UserAndPermissionTable = ({ handleEdit }) => {
  const data = [
    {
      name: "Shola James",
      emailAddress: "Hello",
      phoneNumber: "+234 8123456789",
      role: "Super admin",
      status: "Hello",
      address: "14, Jones street, Lagos Nigeria",
    },
    {
      name: "Shola James",
      emailAddress: "Hello",
      phoneNumber: "+234 8123456789",
      role: "Super admin",
      status: "Hello",
      address: "14, Jones street, Lagos Nigeria",
    },
    {
      name: "Shola James",
      emailAddress: "Hello",
      phoneNumber: "+234 8123456789",
      role: "Super admin",
      status: "Hello",
      address: "14, Jones street, Lagos Nigeria",
    },
  ];
  return (
    <div>
      <table className="w-full hidden lg:block">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-medium">
                Name
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-medium">
                Email address
              </div>
            </th>
            <th className="w-[10%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-medium">
                Phone number
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-medium">
                Role
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs">
              <div className="flex items-center justify-start font-medium">
                Status
              </div>
            </th>
            <th className="w-[8%] p-4  text-dark text-xs"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <UserAndPermissionTableItem
              {...item}
              handleEdit={handleEdit}
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
            <Image src={icon} alt="" />
          </div>
          <div className="flex items-center justify-center">
            <div className="w-[3rem] h-[3rem] bg-primary rounded-[12px] flex items-center justify-center">
              <Image src={exportIcon} alt="" />
            </div>
          </div>
        </div>
        <div className="">
          <div className=" bg-[#F4F4F4] p-4 rounded-t-[12px] lg:hidden">
            <Typography
              textColor="text-dark"
              textWeight="font-[700]"
              textSize=""
            >
              Users and permissions
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
                    textWeight="font-medium"
                    textSize="text-sm"
                  >
                    {item.name}
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
                    textWeight="font-medium"
                    textSize="text-sm"
                  >
                    {item.phoneNumber}
                  </Typography>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 py-2">
                <Typography
                  textColor="text-dark"
                  textWeight="font-[400]"
                  textSize="text-sm"
                >
                  Roles
                </Typography>
                <div className="flex items-center justify-end">
                  <Typography
                    textColor="text-dark"
                    textWeight="font-medium"
                    textSize="text-sm"
                  >
                    {item.role}
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
                    textWeight="font-medium"
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
                    textWeight="font-medium"
                    textSize="text-sm"
                  >
                    {item.address}
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

export default UserAndPermissionTable;
