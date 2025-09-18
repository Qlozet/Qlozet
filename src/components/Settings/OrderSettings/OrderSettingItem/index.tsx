import ToggleSwitch from '@/components/Switch';
import Typography from '@/components/Typography';
import { ChevronRight } from 'lucide-react';

const OrderSettingItem = ({ title, info, subInfo, checked, onChange }) => {
  return (
    <div className='pt-4 flex flex-col gap-2 mt-4'>
      <Typography textWeight='font-[500]'>{title}</Typography>
      <div className='flex flex-col gap-3'>
        {info && (
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <span className='w-[2px] h-[2px] bg-dark block rounded-full'></span>
              <p className='text-dark text-sm md:w-[334px]'>{info}</p>
            </div>
            <ToggleSwitch onChange={onChange} value={checked} />
          </div>
        )}
        {subInfo.map((text, index) => (
          <div className='flex items-center justify-between' key={index}>
            <div className='flex items-center gap-4 '>
              <span className='w-[2px] h-[2px] bg-gray-200 block rounded-full'></span>
              <p className='text-gray-200 text-sm'>{text}</p>
            </div>
            <ChevronRight className='text-gray-200' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSettingItem;
