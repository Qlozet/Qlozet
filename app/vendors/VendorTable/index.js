import VendorTableItem from "../VendorTableItem";

const VendorTable = ({ data }) => {
  return (
    <div className="mt-4">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s name
              </div>
            </th>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Address{" "}
              </div>
            </th>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Date onboarded
              </div>
            </th>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Onboarded by
              </div>
            </th>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]">
                Vendor’s status
              </div>
            </th>
            <th className="w-[18%] p-4">
              <div className="flex items-center justify-start font-[500]"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <VendorTableItem {...item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorTable;
