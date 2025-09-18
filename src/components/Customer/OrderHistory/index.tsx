import React from 'react';
import OrderDetailNav from '../../order/OrderdetailsNav';
import defaultImage from '@/public/assets/image/default.png';
import Button from '../../Button';
import HistoryTable from '../HistoryTable';

interface OrderHistoryProps {
  topNavData: any[]; // Consider defining a more specific type for topNavData
  closeModal: () => void;
  customerHistory: any[]; // Consider defining a more specific type for customerHistory
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  topNavData,
  closeModal,
  customerHistory,
}) => {
  return (
    <div className='flex flex-col items-center justify-center w-full mt-6'>
      <OrderDetailNav
        active='Order history'
        data={topNavData}
        closeModal={closeModal}
        width='w-[60%]'
      />
      <div className='w-[60%]'>
        <HistoryTable data={customerHistory} modal={() => {}} />{' '}
        {/* Pass a dummy modal function for now */}
      </div>
      <div className='bg-white flex items-center justify-end w-[60%] rounded-b-[12px] px-4 py-8'>
        <Button
          children='Submit'
          btnSize='large'
          variant='primary'
          clickHandler={() => {}}
          maxWidth='max-w-[12rem]'
        />
      </div>
    </div>
  );
};
export default OrderHistory;
