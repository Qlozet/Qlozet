import React from 'react';

interface PerformanceProps {
  name: string;
  value: number;
  color: string;
}

const Performance = ({ name, value, color }: PerformanceProps) => {
  return (
    <div className='flex items-center w-full justify-between gap-3 my-2 text-[12px]'>
      <div className='w-[22%] truncate font-medium'>{name}</div>
      <div className='flex-1'>
        <div className='h-2 rounded-[6px] bg-[#F2F2F7] w-full'>
          <div
            className={`${color} h-2 rounded-[6px]`}
            style={{
              width: `${Math.min(value, 100)}%`,
            }}
          ></div>
        </div>
      </div>
      <div className='w-[12%] text-right font-medium'>{value}</div>
    </div>
  );
};

export default Performance;
