import Typography from '@/components/Typography';

const AvailableSize = () => {
  return (
    <div>
      <div>
        <div className='flex items-center gap-2'>
          <div className=' flex items-center justify-center w-[2.5rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-md'>
            <Typography
              textColor='text-primary'
              textWeight='font-medium'
              textSize='text-sm'
            >
              S
            </Typography>
          </div>
          <div className=' flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-md'>
            <Typography
              textColor='text-primary'
              textWeight='font-medium'
              textSize='text-sm'
            >
              M
            </Typography>
          </div>
          <div className=' flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-md'>
            <Typography
              textColor='text-primary'
              textWeight='font-medium'
              textSize='text-sm'
            >
              L
            </Typography>
          </div>
          <div className=' flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-md'>
            <Typography
              textColor='text-primary'
              textWeight='font-medium'
              textSize='text-sm'
            >
              XL
            </Typography>
          </div>
          <div className=' flex items-center justify-center w-[3rem] h-[1.7rem] border-gray-300 border-solid border-[1.5px] rounded-md'>
            <Typography
              textColor='text-primary'
              textWeight='font-medium'
              textSize='text-sm'
            >
              XXL
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableSize;
