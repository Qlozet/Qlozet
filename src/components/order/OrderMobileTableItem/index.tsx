import React from 'react';
import Typography from '@/components/Typography';
import OrderStatus from '../OrderStatus';

interface DeliveryStatus {
  name: string;
  bg: string;
  text: string;
}

interface MobileTableItemProps {
  item: {
    orderId: string;
    AmountPaid: string;
    DeliveryStatus: DeliveryStatus;
    productName: string;
  };
}

const MobileTableItem: React.FC<MobileTableItemProps> = ({ item }) => {
  return (
    <div className=''>
      <div className='flex justify-between items-center bg-white py-6 px-4 border-b-[.5px] border-gray-300 border-solid '>
        <div className='flex flex-col gap-1 text-sm'>
          <div className='mb-4'>
            <Typography
              textColor='text-[#707FA3]'
              textWeight='font-normal'
              textSize='text-sm'
            >
              Ref ID
            </Typography>
            <Typography
              textColor='text-dark'
              textWeight='font-normal'
              textSize=''
            >
              {item.orderId}
            </Typography>
          </div>
          <Typography
            textColor='text-[#707FA3]'
            textWeight='font-normal'
            textSize='text-[14px]'
          >
            Amount
          </Typography>
          <Typography
            textColor='text-dark'
            textWeight='font-normal'
            textSize=''
          >
            {item.AmountPaid}
          </Typography>
        </div>
        <div className='flex flex-col items-end '>
          <div className='mb-4'>
            {' '}
            <OrderStatus
              text={item.DeliveryStatus.name}
              bgColor={item.DeliveryStatus.bg}
              color={item.DeliveryStatus.text}
              addMaxWidth={true}
            />
          </div>
          <div className='mt-4 flex flex-col items-end '>
            <div className='flex-col '>
              <Typography
                textColor='text-[#707FA3]'
                textWeight='font-normal'
                textSize='text-[14px]'
              >
                Product
              </Typography>
            </div>

            <p className='overflow-hidden text-ellipsis  whitespace-nowrap max-w-[200px] '>
              {' '}
              {item.productName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTableItem;
