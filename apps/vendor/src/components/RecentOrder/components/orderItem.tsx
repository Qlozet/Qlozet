import Typography from '@/components/Typography';

const OrderItem = ({ order }) => {
  return (
    <div className='flex bg-gray-400 items-center my-4 rounded-[12px] justify-between'>
      <div className='px-4 py-3 mb-2 flex rounded-md items-end w-[80%]'>
        <div className='flex flex-col w-[70%]'>
          <Typography
            textColor='text-primary'
            textWeight='font-normal'
            textSize='text-xs'
          >
            {order.orderItems[0].name}
          </Typography>
          <Typography
            textColor='text-primary'
            textWeight='font-normal'
            textSize='text-xs'
          >
            {`${order.customer.firstName}  ${order.customer.lastName}`}
          </Typography>
        </div>
        <div className='flex flex-col w-[30%]'>
          <Typography
            textColor='text-primary'
            textWeight='font-normal'
            textSize='text-xs'
          >
            {order.amountPaid.toLocaleString()}
          </Typography>
          <Typography
            textColor='text-primary'
            textWeight='font-normal'
            textSize='text-[10px]'
          >
            {order.date}
          </Typography>
        </div>
      </div>
      <div className='w-[20%] flex items-center py-5'>
        <div className='bg-gray-300 rounded-[15px] px-[7px] flex items-center'>
          <button className='text-[10px]'>More</button>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
