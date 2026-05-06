import Typography from '@/components/Typography';
import { useEffect, useState } from 'react';
const PriceComp = ({ priceHandler, productAmount, id, color, borderColor }) => {
  const [price, setPrice] = useState(productAmount);

  useEffect(() => {
    setPrice(productAmount);
  }, [productAmount]);
  return (
    <div
      className={`flex items-center  px-2 rounded-md justify-between border-[1.5px] border-solid ${borderColor ? 'border-primary' : 'border-gray-300'}  w-full max-w-[150px]`}
    >
      <div className='cursor-pointer py-1'>
        <Typography
          textColor='text-primary'
          textWeight='font-medium'
          textSize='text-base'
        >
          $
        </Typography>
      </div>
      <input
        placeholder=''
        value={price}
        onChange={(e) => {
          const re = /^[0-9\b]+$/;
          if (e.target.value === '' || re.test(e.target.value)) {
            setPrice(e.target.value);
            priceHandler(e.target.value, id, color);
          }
        }}
        // type="number"
        className='text-primary font-medium text-base text-center flex items-center justify-center py-1 bg-transparent'
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
};
export default PriceComp;
