import Image from 'next/image';

import Typography from '../Typography';
import backgroungImage from '@/public/assets/image/frame.jpg';
import Button from '../Button';
const HomePageHero = () => {
  return (
    <div
      className={`mt-4 rounded-tl-[100px] rounded-tr-[100px] bg-[#F4F4F4] border-solid border-primary border pt-[138px]`}
    >
      <div className='w-full lg:w-[1206px] flex flex-col mx-auto gap-4'>
        <Typography
          textWeight='font-normal'
          align={'text-center'}
          textSize='text-[48px]'
        >
          Sales and Analytics
        </Typography>
        <Typography
          textColor={'text-[#7A7777]'}
          textWeight='font-normal'
          align={'text-center'}
          textSize='text-[24px]'
        >
          Gain valuable insights into your sales performance and customer
          preferences through Qlozet's analytics tools, helping you make
          informed decisions to optimize your business.
        </Typography>
      </div>
    </div>
  );
};

export default HomePageHero;
