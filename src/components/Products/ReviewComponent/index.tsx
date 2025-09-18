import Typography from '@/components/Typography';
import Image from 'next/image';
import closeIcon from '@/public/assets/svg/material-symbols_close-rounded.svg';
import ReviewItem from '../ReviewItem';

const ProductReview = ({ reviews, closeModal, productName }) => {
  return (
    <div className='w-full flex items-center justify-center mt-6'>
      <div className='bg-white p-4 rounded-[12px] w-[40%]'>
        <div>
          <div className='flex items-center justify-between'>
            <Typography
              textColor='text-black'
              textWeight='font-[700]'
              textSize='text-[18px]'
            >
              {productName}
            </Typography>

            <div onClick={closeModal} className='cursor-pointer'>
              <Image src={closeIcon} alt='' />
            </div>
          </div>
          <div className='border-dashed border-gray-200 border-t-[1px] mt-4 pt-6'>
            {reviews.map((item, index) => (
              <ReviewItem review={item} key={index}></ReviewItem>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReview;
