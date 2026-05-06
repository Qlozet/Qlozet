'use client';
import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import Typography from '@/components/Typography';
import { useLazyVerifyVendorAccountQuery } from '@/redux/services/settings/settings.api-slice';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import { toast } from 'sonner';

interface VerificationParams {
  userid: string;
}

interface VerificationProps {
  params: Promise<VerificationParams>;
}

const Verication: React.FC<VerificationProps> = ({ params }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [verifyVendorAccount] = useLazyVerifyVendorAccountQuery();

  const verifyAccount = async (): Promise<void> => {
    try {
      const resolvedParams = await params;
      const response = await verifyVendorAccount(resolvedParams.userid).unwrap();
      setLoading(false);
      if (response?.success) {
        toast.success(response?.message);
      } else {
        toast.error('An error occurred');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setLoading(false);
      toast.error('An error occurred');
    }
  };

  useEffect(() => {
    verifyAccount();
  }, []);
  return (
    <section
      className={` w-full h-screen p-4 flex justify-center bg-[#F8F9FA]`}
    >
      {loading ? (
        <Loader></Loader>
      ) : (
        <div className="max-w-[735px]">
          <div className='py-16 flex justify-center'>
            <Logo brown={true} />
          </div>
          <div
            className="py-6 rounded-[16px] shadow-sm bg-contain bg-no-repeat"
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
                Account created successfully
              </Typography>
            </div>
            <div className='pt-6 pb-4 px-6 border-t-[1px] border-solid border-gray-200'>
              <Typography
                textColor='text-dark'
                textWeight='font-normal'
                textSize=''
                align='text-center'
              >
                Your Altire account has been successfully set up, and we&apos;ve
                received your information. Our team will thoroughly review the
                details and documents provided. Your account verification status
                will be communicated to you via the email you provided within
                the next 48 hours.
              </Typography>
              <div>
                <p
                  className='text-primary font-medium text-sm center cursor-pointer'
                  onClick={() => {
                    router.push('/auth/signin');
                  }}
                >
                  Return to login
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Verication;
