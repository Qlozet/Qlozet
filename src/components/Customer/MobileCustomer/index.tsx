import React from 'react';
import Image from 'next/image';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { setCustomerId } from '@/lib/utils';
import exportIcon from '@/public/assets/svg/Content.svg'; // Assuming this is the correct path

interface MobileCustomerItemProps {
  picture: string;
  customerName: string;
  status: { text: string; bgColor: string; color: string };
  totalOrders: number;
  lastOrderDate: string;
  phone: string;
  emailAddress: string;
  viewDetails: (customerId: string) => void;
  customerId: string;
}

const MobileCustomerItem: React.FC<MobileCustomerItemProps> = ({
  picture,
  customerName,
  status,
  totalOrders,
  lastOrderDate,
  phone,
  emailAddress,
  viewDetails,
  customerId,
}) => {
  return (
    <div>
      <div className='flex gap-6 mb-4 bg-white '>
        <div className='bg-primary w-1 h-[10rem]'></div>
        <div className=' w-full flex flex-col  justify-between py-5 pr-4'>
          <div className='flex items-center gap-3'>
            <div className='w-[2rem] h-[2rem] bg-primary rounded-[12px] flex items-center justify-center'>
              <Image src={exportIcon} alt='Export Icon' />
            </div>
            <Typography
              textColor='text-black'
              textWeight='font-normal'
              textSize=''
            >
              {customerName}
            </Typography>
          </div>
          <div className='flex items-center justify-between gap-3'>
            <Typography
              textColor='text-black'
              textWeight='font-normal'
              textSize=''
            >
              Total Orders
            </Typography>
            <Typography
              textColor='text-black'
              textWeight='font-normal'
              textSize=''
            >
              {totalOrders}
            </Typography>
          </div>
          <div>
            <Button
              children='View Customer'
              btnSize='large'
              variant='outline'
              clickHandler={() => {
                setCustomerId(customerId);
                viewDetails(customerId);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCustomerItem;
