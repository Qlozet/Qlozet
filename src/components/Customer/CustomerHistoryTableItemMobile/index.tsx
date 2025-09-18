import React from 'react';
import OrderStatus from '@/components/order/OrderStatus';
import Typography from '@/components/Typography';

interface CustomerHistoryTableItemProps {
  item: {
    transactionId: string;
    amount: string;
    // Add other properties of item if available
  };
  index: number;
}

const CustomerHistoryTableItem: React.FC<CustomerHistoryTableItemProps> = ({
  item,
  index,
}) => {
  return (
    <div className='p-4 bg-white' key={index}>
      <div className='flex justify-between items-center'>
        <div>
          <Typography
            textColor='text-gray-200'
            textWeight='font-normal'
            textSize='text-sm'
          >
            transaction Id
          </Typography>
          <Typography
            textColor='text-dark'
            textWeight='font-normal'
            textSize=''
          >
            {item.transactionId}
          </Typography>
          <Typography
            textColor='text-gray-200'
            textWeight='font-normal'
            textSize='text-sm'
          >
            Amount
          </Typography>
          <Typography
            textColor='text-dark'
            textWeight='font-normal'
            textSize=''
          >
            {item.amount}
          </Typography>
        </div>
        <div className='flex flex-col items-end'>
          <OrderStatus
            text='Out for delivery'
            bgColor='bg-[#DEF1FF]'
            color='text-[#3893FE]'
            addMaxWidth={true}
          />
          <div className='my-2'>
            <Typography
              textColor='text-gray-200'
              textWeight='font-normal'
              textSize='text-sm'
            >
              Product
            </Typography>
          </div>
          <Typography
            textColor='text-dark'
            textWeight='font-normal'
            textSize=''
          >
            12345678910
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryTableItem;
