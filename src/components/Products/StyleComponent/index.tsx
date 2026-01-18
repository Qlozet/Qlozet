import { EllipsisVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
const StyleComp = ({ id, image, handleEditStylePrice, price }) => {
  const [stylePrice, setStylePrice] = useState(price);
  return (
    <div className='w-[80px]'>
      <div>
        <div
          className='rounded border border-solid border-borderColor relative overflow-hidden'
          style={{
            backgroundColor: '#F1F1F1',
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            height: '4.5rem',
            width: '100%',
          }}
        >
          <div className='absolute top-0 right-0 gap-2 p-1 bg-[#00000033] rounded-bl'>
            {/* <Trash2 className="w-4 h-4 cursor-pointer" /> */}
            <EllipsisVertical className='w-4 h-4 cursor-pointer' />
          </div>
        </div>
        <div className='max-h-[2rem] flex max-w-[100px] overflow-hidden  border-[1px] border-solid border-borderColor rounded mt-2 mx-auto bg-[#F5F5F5]'>
          <div className='text-xs flex items-center justify-center h-full mt-1 pl-1'>
            $
          </div>
          <input
            style={{
              backgroundColor: 'transparent',
            }}
            value={stylePrice}
            className='max-w-[50px] border-none outline-none font-normal py-1 focus:border-0 pl-2 text-xs'
            onChange={(e) => {
              const newPrice = e.target.value;
              setStylePrice(newPrice);
              handleEditStylePrice(newPrice, id);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StyleComp;
