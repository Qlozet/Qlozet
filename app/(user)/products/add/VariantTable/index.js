import ExportComponent from "@/components/ExportButton";
import VariantTableItem from "../VariantTableItem";

const VariantTable = ({ data }) => {
  return (
    <div className="mt-4 min-h-[50vh] ">
      <table className="w-full shadow py-4">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[10%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Variants
              </div>
            </th>
            <th className="w-[15%] p-4 text-[12px] min-w-[7rem]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Quantity
              </div>
            </th>
            <th className="w-[25%] p-4 text-[12px]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Available Sizes
              </div>
            </th>
            <th className="w-[35%] p-4 text-[12px] min-w-[17rem]">
              <div className="flex items-center justify-start font-[500] text-dark">
                Add Product images
              </div>
            </th>
            <th className="w-[5%] p-4 text-[12px] min-w-[4rem]">
              <div className="flex items-center justify-start font-[500] text-dark"></div>
            </th>
            <th className="w-[5%] p-4 text-[12px] min-w-[4rem]">
              <div className="flex items-center justify-start font-[500] text-dark"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <VariantTableItem
              key={index}
              {...item}
              //   viewDetails={viewDetails}
              //   showRejectModal={showRejectModal}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VariantTable;
