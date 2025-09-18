import Button from '@/components/Button';
import DateInput from '@/components/DateInput';
import SelectInput from '@/components/SelectInput';
import Typography from '@/components/Typography';
import closeicon from '@/public/assets/svg/material-symbols_close-rounded.svg';
import 'react-calendar/dist/Calendar.css';
import Image from 'next/image';
import { useState } from 'react';
import { getProductId } from '@/lib/utils';
import { useScheduleProductMutation } from '@/redux/services/products/products.api-slice';
import Toast from '@/components/ToastComponent/toast';
import toast from 'react-hot-toast';
import { timearray } from './data';
const ShecduleProduct = ({ closeSchedule }) => {
  const productId = getProductId();
  const [schedule, setSchedule] = useState({ date: '', time: '' });
  const [dateinputIsActive, setDateInputIsactive] = useState(false);
  const [showCalender, setShowCalender] = useState(false);
  const [scheduleProduct, { isLoading }] = useScheduleProductMutation();

  const submitSchedule = async () => {
    try {
      await scheduleProduct({
        productId,
        date: schedule.date,
        time: schedule.time,
      }).unwrap();
      toast(<Toast text='Product scheduled successfully' type='success' />);
      closeSchedule();
    } catch (error) {
      console.error('Error scheduling product:', error);
      toast(<Toast text='Failed to schedule product' type='danger' />);
    }
  };
  return (
    <div>
      <div className='mt-4 mx-auto max-w-[400px]'>
        <div className='bg-white rounded-[12px] w-full  m-auto px-4 py-6 my-6 shadow lg:min-w-[50%]'>
          <div>
            <div className='flex items-center justify-between  border-dashed border-b-[1.5px] border-gray-200 pb-4'>
              <Typography
                textColor='text-primary'
                textWeight='font-bold'
                textSize='text-sm'
              >
                Schedule product activation
              </Typography>
              <Image
                src={closeicon}
                alt=''
                onClick={closeSchedule}
                className='cursor-pointer'
              />
            </div>
            <div>
              <DateInput
                showCalender={showCalender}
                placeholder={'Select Date'}
                value={schedule.date}
                setValue={(data) => {
                  setSchedule((prevData) => {
                    return { ...prevData, date: data };
                  });
                }}
                label='Date'
                onFocus={() => {
                  setDateInputIsactive(true);
                  setShowCalender(!showCalender);
                }}
                showCalendeHandler={(data) => {
                  data ? setShowCalender(false) : setShowCalender(true);
                }}
              />
            </div>
            <div
              className='w-full'
              style={{
                display: dateinputIsActive ? 'none' : 'block',
              }}
            >
              <SelectInput
                index={showCalender ? -10 : 10}
                placeholder={'Product Tags'}
                label='Time'
                value={schedule.time}
                setValue={(data) => {
                  setSchedule((prevData) => {
                    return { ...prevData, time: data };
                  });
                }}
                data={timearray}
              />
            </div>
            <div className='my-6 flex items-center justify-center lg:justify-end '>
              <Button
                loading={isLoading}
                children='Schedule activation'
                btnSize='small'
                minWidth='min-w-[100%]'
                variant='primary'
                clickHandler={() => {
                  submitSchedule();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShecduleProduct;
