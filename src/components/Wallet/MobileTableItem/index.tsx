import OrderStatus from '@/components/order/OrderStatus';
const { default: Typography } = require('@/components/Typography');
const MobileItem = ({ item, index }) => {
  return (
    <div
      className='px-4 py-6 bg-white border-b-[1.5px] border-solid border-gray-300'
      key={index}
    >
      <div className='flex justify-between items-center'>
        <div className='flex flex-col gap-1'>
          <div>
            {' '}
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
              {12345}
            </Typography>
          </div>
          <div className='mt-4'>
            {' '}
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
        </div>
        <div className='flex flex-col items-end'>
          <OrderStatus
            text={item.status.text}
            bgColor={item.status.bgColor}
            color={item.status.color}
            addMaxWidth={true}
          />
          <div className='flex flex-col items-end mt-6'>
            <Typography
              textColor='text-gray-200'
              textWeight='font-normal'
              textSize='text-sm'
            >
              Product
            </Typography>
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
    </div>
  );
};

export default MobileItem;
