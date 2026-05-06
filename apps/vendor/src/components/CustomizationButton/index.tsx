import customisationIcon from '@/public/assets/svg/customisation-icon.svg';
import Image from 'next/image';
import React from 'react';

interface CustomiSationButtonProps {
  handleClick: () => void;
  text?: string;
}

const CustomiSationButton: React.FC<CustomiSationButtonProps> = ({
  handleClick,
  text,
}) => {
  return (
    <div>
      <div
        className='rounded cursor-pointer flex items-center justify-center border-solid border-[2px] border-gray-300 min-w-[4.5rem] h-[4.5rem]'
        onClick={handleClick}
      >
        <div>
          <Image src={customisationIcon} alt='' />
        </div>
      </div>
      {text && <p className='text-sm w-full text-center py-2'>{text}</p>}
    </div>
  );
};

export default CustomiSationButton;
