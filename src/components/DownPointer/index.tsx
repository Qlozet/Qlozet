import React from 'react';
import Image from 'next/image';
import arrowdown from '@/public/assets/svg/arrowdown.svg';

const DownPointer: React.FC = () => {
  return (
    <div className='flex items-center justify-center'>
      <button className='mx-auto inline-block my-6'>
        <Image src={arrowdown} alt='Down arrow' />
      </button>
    </div>
  );
};

export default DownPointer;
