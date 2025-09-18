import React from 'react';
import OrderDetailNav from '../../order/OrderdetailsNav';
import defaultImage from '@/public/assets/image/default.png';
import Typography from '../../Typography';
import OrderStatus from '../../order/OrderStatus';
import Button from '../../Button';

interface CustomerDetailsProps {
  topNavData: any[]; // Define more specific type if possible
  closeModal: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  topNavData,
  closeModal,
}) => {
  return (
    <div className='flex flex-col items-center justify-center w-full my-4'>
      <OrderDetailNav
        active='Customer details'
        data={topNavData}
        closeModal={closeModal}
      />
      <div className=' w-[40%] bg-white p-4 rounded-b-[14px]'>
        <div
          className='bg-cover bg-no-repeat bg-center w-[6rem] h-[6rem] rounded-full'
          style={{ backgroundImage: `url(${defaultImage.src})` }}
        ></div>
        <Typography
          textColor='text-black'
          textWeight='font-bold'
          textSize='text-[18px]'
        >
          Amasi Queen Shirt
        </Typography>
        <div className='max-w-[13rem]'>
          <OrderStatus
            text='View customization details'
            color='text-[#3E1C01]'
            bgColor='bg-[#D4CFCA]'
          />
        </div>
        {/* Rest of the component */}
        <div className='flex justify-end items-center gap-5  '>
          <div className='mt-10 flex items-center justify-end'>
            <Button
              children='Reject Order'
              btnSize='small'
              variant='outline'
              clickHandler={() => {}}
              maxWidth='max-w-[14rem]'
            />
          </div>
          <div className='mt-10 flex items-center justify-end'>
            <Button
              children='Confirm order'
              btnSize='small'
              variant='primary'
              clickHandler={() => {}}
              maxWidth='max-w-[14rem]'
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;
