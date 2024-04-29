import UserAndPermissionTableItem from "../UserAndPermissionTableItem";

const UserAndPermissionTable = ({ handleEdit }) => {
  const data = [
    {
      name: "Hello",
      emailAddress: "Hello",
      phoneNumber: "Hello",
      role: "Hello",
      status: "Hello",
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
              Email address
            </div>
          </th>
          <th className="w-[10%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Phone number
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Role
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]">
            <div className="flex items-center justify-start font-[500]">
              Status
            </div>
          </th>
          <th className="w-[8%] p-4  text-dark text-[12px]"></th>
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
  );
};

export default UserAndPermissionTable;
