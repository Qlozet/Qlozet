import VariantTableItem from "../VariantTableItem";
import styles from "./index.module.css";
const VariantTable = ({
  data,
  QuantityHandler,
  submitVariantImage,
  quantityHandler,
  priceHandler = { priceHandler },
  handleChecked,
  handleDeleteVariantFromTable
}) => {
  return (
    <div className={`overflow-x-scroll ${styles.scrollbarElement}`}>
      <table className="w-full shadow py-4">
        <thead className="w-full bg-[#F4F4F4] ">
          <tr>
            <th className="w-[10%] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark">
                Variants
              </div>
            </th>
            <th className="w-[15%] p-4 text-xs min-w-[7rem]">
              <div className="flex items-center justify-start font-medium text-dark">
                Quantity
              </div>
            </th>
            <th className="w-[15%] min-w-[6rem] p-4 text-xs">
              <div className="flex items-center justify-start font-medium text-dark min-w-[6rem]">
                Price
              </div>
            </th>
            <th className="w-[35%] p-4 text-xs min-w-[17rem]">
              <div className="flex items-center justify-start font-medium text-dark">
                Add Product images
              </div>
            </th>
            <th className="w-[5%] p-4 text-xs min-w-[4rem]">
              <div className="flex items-center justify-start font-medium text-dark"></div>
            </th>
            <th className="w-[5%] p-4 text-xs min-w-[4rem]">
              <div className="flex items-center justify-start font-medium text-dark"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            return (
              <VariantTableItem
                QuantityHandler={QuantityHandler}
                key={index}
                item={item}
                index={index}
                submitImage={submitVariantImage}
                quantityHandler={quantityHandler}
                priceHandler={priceHandler}
                handleChecked={handleChecked}
                handleDeleteVariantFromTable={handleDeleteVariantFromTable}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VariantTable;
