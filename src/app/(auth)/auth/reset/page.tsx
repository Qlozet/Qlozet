import Logo from '@/components/Logo';
import Typography from '@/components/Typography';

const Page: React.FC = () => {
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      <div className='max-w-[735px]'>
        <div className='py-16 flex justify-center'>
          <Logo />
        </div>
        <div
          className='py-6 rounded-[16px] shadow-sm bg-contain bg-no-repeat'
          style={{
            backgroundImage: "url('/assets/image/verificationbg.jpg')"
          }}
        >
          <div className='pb-2'>
            <Typography
              textColor='text-dark'
              textWeight='font-bold'
              textSize='text-[24px]'
              align='text-center'
            >
              Reset code sent to email
            </Typography>
          </div>
          <div className='pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200'>
            <Typography
              textColor='text-dark'
              textWeight='font-normal'
              textSize=''
              align='text-center'
            >
              We&apos;ve sent a code to the email associated with your business
              account (example@gmail.com). Please check your email inbox and
              utilize the code provided to create a new password.
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
