import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Image from 'next/image';
import moment from 'moment';
import calenderIcon from '@/public/assets/svg/calendar.svg';

interface DateInputProps {
  label: string;
  setValue: (date: string) => void;
  value: string;
  leftIcon?: React.ReactNode;
  showCalender: boolean;
  showCalendeHandler: (val: any) => void; // Consider a more specific type if possible
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  setValue,
  value,
  leftIcon,
  showCalender,
  showCalendeHandler,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleCalendarChange = (date: Date | Date[]) => {
    const selectedDate = Array.isArray(date) ? date[0] : date;
    const isValidDate = selectedDate && !isNaN(selectedDate.getTime());

    if (isValidDate) {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      setValue(formattedDate);
    }
    showCalendeHandler(isValidDate);
  };

  return (
    <div className='my-3 relative'>
      {leftIcon}
      <label className='text-sm font-light my-2 text-dark'> {label}</label>
      <input
        value={value}
        className={`border-solid border-[1.5px] placeholder-gray-200 text-dark block w-full p-2 focus:border-primary-100 border-gray-2 rounded-[8px] focus:outline-none focus:bg-[#DDE2E5] text-sm`}
        onChange={handleDateChange}
        onClick={() => showCalendeHandler('')}
        readOnly // Prevent manual input if calendar is the only way to set date
      />
      <Image
        alt='Calendar icon'
        src={calenderIcon}
        className='absolute top-[2.3rem] right-[1rem] cursor-pointer'
      />
      {showCalender && (
        <div
          className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-[rgba(0,0,0,.5)]'
          style={{ zIndex: 2000 }}
        >
          <div
            className='w-full h-full border-1 border-solid border-b-dark flex items-center justify-center'
            style={{ zIndex: 2000 }}
          >
            <Calendar
              onChange={handleCalendarChange}
              value={value ? new Date(value) : new Date()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput;
