import React from 'react';
import { Info } from 'lucide-react';

interface ToolTipProps {
  text: string;
}

const ToolTip: React.FC<ToolTipProps> = ({ text }) => {
  return (
    <div style={{ position: 'relative' }} className='flex items-center'>
      <div className='relative group flex items-center'>
        <p className='absolute left-2 top-[-1rem] hidden group-hover:block bg-gray-800 text-dark py-2 px-4 rounded-lg shadow-lg text-xs w-[12rem]'>
          {text}
        </p>
        <Info className='text-dark h-4 w-4 rounded-lg shadow-lg group-hover:bg-green-600 transition' />
      </div>
    </div>
  );
};

export default ToolTip;
