import { useEffect, useState } from 'react';
import VariantTableItem from '../VariantTableItem/index2.js';
const VariantTable = ({
  data,
  QuantityHandler,
  submitVariantImage,
  quantityHandler,
  priceHandler = { priceHandler },
  handleChecked,
  handleDeleteVariantFromTable,
}) => {
  const [groupVariantArray, setGroupVariantArray] = useState([]);
  useEffect(() => {
    const groupedByColor = Object.entries(
      data.reduce((acc, item) => {
        const groupKey = `${item.color}-${item.index}`;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      }, {})
    ).map(([key, items]) => {
      const [color, index] = key.split('-');
      return {
        name: color,
        index: Number(index),
        data: items,
      };
    });
    setGroupVariantArray(groupedByColor.sort((a, b) => b.index - a.index));
  }, [data]);
  return (
    <div className='overflow-x-scroll min-w-full scrollbar-hide'>
      <div className='w-full py-4 px-4 flex items-center justify-between  min-w-[1000px] bg-[#EBEBEB] '>
        <div className='flex w-[15%] items-center justify-start font-medium text-dark '>
          Variants
        </div>
        <div className='flex items-center justify-start w-[15%] font-medium text-dark'>
          Quantity
        </div>
        <div className='flex items-center justify-start font-medium text-dark w-[15%]'>
          Price
        </div>
        <div className='flex items-center justify-start font-medium text-dark w-[33%]'>
          Available Sizes
        </div>
        <div className='flex items-center justify-start font-medium text-dark w-[29%]'>
          Add Product images
        </div>
        <div className='flex items-center justify-start font-medium text-dark w-[4%]'></div>
        <div className='flex items-center justify-start font-medium text-dark w-[4%]'></div>
      </div>

      {groupVariantArray.map((item, index) => {
        return (
          <VariantTableItem
            QuantityHandler={QuantityHandler}
            key={index}
            data={item}
            index={index}
            submitImage={submitVariantImage}
            quantityHandler={quantityHandler}
            priceHandler={priceHandler}
            handleChecked={handleChecked}
            handleDeleteVariantFromTable={handleDeleteVariantFromTable}
          />
        );
      })}
    </div>
  );
};

export default VariantTable;
