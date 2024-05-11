import ExportComponent from "../../ExportButton";
import ProductTableItem from "../ProductTableItem";
const ProductTable = ({ data, viewDetails, showModal }) => {
  return (
    <div className="mt-4 min-h-[50vh]">
      <table className="w-full">
        <thead className="w-full bg-[#F4F4F4] text-dark ">
          <tr>
            <th className="w-[5%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Picture
              </div>
            </th>
            <th className="w-[11%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Product Name
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Product price
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Category
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Product type
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Tag
              </div>
            </th>
            <th className="w-[9%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Quantity
              </div>
            </th>
            <th className="w-[9%] px-2 py-4 text-[12px]">
              <div className="flex items-center justify-start font-[500]  text-dark">
                Product Status
              </div>
            </th>
            <th className="w-[8%] px-2 py-4 text-[12px]">
              <ExportComponent />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <ProductTableItem {...item} viewDetails={showModal} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
