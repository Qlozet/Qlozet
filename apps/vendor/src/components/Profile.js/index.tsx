// Trigger Vercel rebuild
import Typography from '../Typography';
import closeIcon from '@/public/assets/svg/close-square-icon.svg';
import rotate from '@/public/assets/svg/rotate-icon.svg';
import Image from 'next/image';
import Performance from '../Performance';
import Rating from '../Rating';
import { ProfileProps } from '../../types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
const Profile = ({
  userDetails,
  showProfile,
  showProfileHandler,
}: ProfileProps) => {
  return (
    <Sheet open={showProfile} onOpenChange={(open) => !open && showProfileHandler()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-2xl custom-card-shadow !bg-white sidebar-scrollbar"
      >
        <div className="bg-white rounded-2xl pb-6 min-h-full w-full h-full">
          <SheetHeader className="px-6 py-6 pb-2">
            <SheetTitle className="text-[22px] font-bold text-grey-black text-left">
              Profile
            </SheetTitle>
          </SheetHeader>
          <div>
            <div className="items-center justify-center">
                        <Image
                          src={userDetails.profileImage}
                          width={30}
                          height={30}
                          style={{
                            width: '5rem',
                            height: '5rem',
                          }}
                          alt=''
                          className='my-2 mx-auto rounded-[50%]'
                          unoptimized
                        />
                        <div className='p-1 flex justify-center items-center'>
                          <Typography
                            textColor='text-primary'
                            textWeight='font-bold'
                            textSize='text-[18px]'
                          >
                            {userDetails.personalName}
                          </Typography>
                        </div>
                        <div className='flex justify-center items-center'>
                          <Typography
                            textColor='text-primary'
                            textWeight='font-normal'
                            textSize=''
                          >
                            {userDetails.businessName}
                          </Typography>
                        </div>
                        <div className='border-b-[1px] border-solid border-gray-100 mx-4'>
                          <div className='flex items-center justify-between  px-6 py-6 w-[65%] mx-auto'>
                            <div className='flex flex-col items-center justify-center '>
                              <Typography
                                textColor='text-primary'
                                textWeight='font-normal'
                                textSize='text-xs'
                                align='center'
                              >
                                items
                              </Typography>
                              <Typography
                                textColor='text-primary'
                                textWeight='font-bold'
                                textSize='text-[18px]'
                                align='center'
                              >
                                {userDetails.items}
                              </Typography>
                            </div>
                            <div className='h-[2rem] w-[1px] bg-gray-200'></div>
                            <div className='flex flex-col items-center justify-center'>
                              <Typography
                                textColor='text-primary'
                                textWeight='font-normal'
                                textSize='text-xs'
                                align='center'
                              >
                                Profit
                              </Typography>
                              <Typography
                                textColor='text-primary'
                                textWeight='font-bold'
                                textSize='text-[18px]'
                                align='center'
                              >
                                {userDetails.profit.toLocaleString()}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4'>
                      <Typography
                        textColor='text-primary'
                        textWeight='font-bold'
                        textSize='text-[18px]'
                      >
                        Customers Reviews
                      </Typography>
                      <Image src={rotate} alt='' />
                    </div>
                    <div className='flex items-center gap-4 px-4 py-2'>
                      <Rating newRating={Math.round(userDetails?.averageRating || 0)} />
                      <div className='flex items-center'>
                        <div className='mr-2'>
                          <Typography
                            textColor='text-primary'
                            textWeight='font-[600]'
                            textSize='text-[18px]'
                          >
                            {userDetails.averageRating}
                          </Typography>
                        </div>
                        <Typography
                          textColor='text-primary'
                          textWeight='font-normal'
                          textSize='text-xs'
                        >
                          Out of 5 star
                        </Typography>
                      </div>
                    </div>
                    <div className='pl-4'>
                      <Typography
                        textColor='text-primary'
                        textWeight='font-normal'
                        textSize='text-xs'
                      >
                        Overall rating of 100 customer’s reviews
                      </Typography>
                    </div>
                    <div className='m-4 border-b-[2px] border-solid border-gray-200 pb-8'>
                      <Performance
                        name='Excellence'
                        value={userDetails.ratings.excellent * 10}
                        color={'bg-primary'}
                      />
                      <Performance
                        name='Good'
                        value={userDetails.ratings.good * 10}
                        color={'bg-primary-100'}
                      />
                      <Performance
                        name='Average'
                        value={userDetails.ratings.average * 10}
                        color={'bg-primary-200'}
                      />

                      <Performance
                        name='Avg. Bel'
                        value={userDetails.ratings.belowAverage * 10}
                        color={'bg-primary-300'}
                      />
                      <Performance
                        name='Poor'
                        value={userDetails.ratings.poor * 10}
                        color={'bg-gray-100'}
                      />
                    </div>

          </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
