import OrderStatus from '../OrderStatus';

const OrderTableItem = ({
  date,
  orderId,
  productName,
  productPrice,
  customerName,
  AmountPaid,
  DeliveryStatus,
  viewDetails,
}) => {
  return (
    <tr className='border-b-[1px] border-solid border-gray-300 dark:border-border bg-white dark:bg-card '>
      <td className='text-xs font-normal p-6 text-dark dark:text-foreground'>{date}</td>
      <td className='text-xs font-normal p-4 text-dark dark:text-foreground'>{orderId}</td>
      <td className='text-xs font-normal p-4 text-dark dark:text-foreground'>{customerName}</td>
      <td className='text-xs font-normal p-4 text-dark dark:text-foreground'>{AmountPaid}</td>
      <td className='text-xs font-normal p-4 text-dark dark:text-foreground'>
        <OrderStatus
          text={DeliveryStatus.name}
          bgColor={DeliveryStatus.bg}
          color={DeliveryStatus.text}
          addMaxWidth={true}
        />
      </td>
      <td className='text-xs font-normal p-4 text-dark dark:text-foreground flex items-center justify-end'>
        <div className='border rounded-[5px] max-w-[93px] '>
          <OrderStatus
            text='View details'
            color='text-[#3E1C01] dark:text-primary'
            addMaxWidth={true}
            clickHandler={() => {
              viewDetails(orderId);
            }}
          />
        </div>
      </td>
      {/* <Modal content={<OrderDetails />}></Modal> */}
    </tr>
  );
};

export default OrderTableItem;
