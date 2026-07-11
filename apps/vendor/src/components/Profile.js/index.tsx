// Trigger Vercel rebuild
import Typography from '../Typography';
import closeIcon from '@/public/assets/svg/close-square-icon.svg';
import rotate from '@/public/assets/svg/rotate-icon.svg';
import Image from 'next/image';
import Performance from '../Performance';
import Rating from '../Rating';
import { ProfileProps } from '../../types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = ({
  userDetails,
  showProfile,
  showProfileHandler,
  isLoading,
}: ProfileProps) => {
  return (
    <Sheet open={showProfile} onOpenChange={(open) => !open && showProfileHandler()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md !top-6 !bottom-6 !right-6 !h-[calc(100vh-3rem)] rounded-[15px] custom-card-shadow !bg-white dark:!bg-card border border-gray-100 dark:border-border"
      >
        <div className="flex flex-col h-full bg-white dark:bg-card rounded-[15px]">
          {/* Header */}
          <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
            <SheetTitle className="text-lg font-semibold text-[#0C0C0D] dark:text-white text-left w-full">
              Profile
            </SheetTitle>
          </SheetHeader>
          
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto sidebar-scrollbar">
            <div className="space-y-5 px-6 py-5">
              
              {isLoading ? (
                <>
                  {/* Box 1 Skeleton */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-6 flex flex-col items-center">
                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-6" />
                    <div className="flex w-full justify-between px-4">
                      <div className="flex flex-col items-center flex-1">
                        <Skeleton className="h-6 w-16 mb-2" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <div className="w-px h-10 bg-[#DDE2E5] dark:bg-border mx-4" />
                      <div className="flex flex-col items-center flex-1">
                        <Skeleton className="h-6 w-16 mb-2" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  </div>

                  {/* Box 2 Skeleton */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-5">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-6 max-w-[250px]" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>

                  {/* Box 3 Skeleton */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] p-5">
                    <Skeleton className="h-5 w-32 mb-6" />
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Box 1: Profile Info */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] overflow-hidden p-6">
                    <div className="flex flex-col items-center">
                      {/* Avatar */}
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-white dark:bg-muted mb-4 border-2 border-white dark:border-border shadow-sm">
                        <Image
                          src={userDetails?.profileImage || ''}
                          width={96}
                          height={96}
                          alt="Profile Image"
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      
                      {/* Names */}
                      <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-semibold" textSize="text-[20px]" className="tracking-tight text-center">
                        {userDetails?.personalName}
                      </Typography>
                      <Typography textColor="text-[#8E8E93] dark:text-gray-300" textWeight="font-medium" textSize="text-[15px]" className="mt-0.5 text-center">
                        {userDetails?.businessName}
                      </Typography>
                    </div>

                    {/* Items & Profit */}
                    <div className="flex justify-center items-center mt-8">
                      <div className="flex flex-col items-center flex-1">
                        <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-bold" textSize="text-[22px]" className="tracking-tight">
                          {userDetails?.items?.toLocaleString() || '0'}
                        </Typography>
                        <Typography textColor="text-[#8E8E93] dark:text-gray-400" textWeight="font-semibold" textSize="text-[10px]" className="tracking-widest uppercase mt-1">
                          Items
                        </Typography>
                      </div>
                      
                      <div className="w-px h-10 bg-[#DDE2E5] dark:bg-border mx-4" />
                      
                      <div className="flex flex-col items-center flex-1">
                        <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-bold" textSize="text-[22px]" className="tracking-tight">
                          ${userDetails?.profit?.toLocaleString() || '0'}
                        </Typography>
                        <Typography textColor="text-[#8E8E93] dark:text-gray-400" textWeight="font-semibold" textSize="text-[10px]" className="tracking-widest uppercase mt-1">
                          Profit
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Customers Reviews */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-semibold" textSize="text-[15px]">
                        Customers Reviews
                      </Typography>
                    </div>

                    <div className="flex items-center gap-3 mb-1">
                      <Rating newRating={Math.round(userDetails?.averageRating || 0)} />
                      <div className="flex items-baseline gap-1.5">
                        <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-bold" textSize="text-[18px]">
                          {userDetails?.averageRating || '0'}
                        </Typography>
                        <Typography textColor="text-[#8E8E93] dark:text-gray-300" textWeight="font-medium" textSize="text-[13px]">
                          Out of 5 Stars
                        </Typography>
                      </div>
                    </div>

                    <div className="mb-5">
                      <span className="text-[13px] text-[#A67B5B] dark:text-[#E0D5CB] font-medium hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-1">
                        Overall rating of 100 customer's reviews <span className="text-[16px] leading-none mb-0.5">›</span>
                      </span>
                    </div>

                    {/* Performance Bars */}
                    <div className="space-y-1">
                      <Performance name="Excellent" value={(userDetails?.ratings?.excellent || 35) * 10} color="bg-[#1C1C1E] dark:bg-white" />
                      <Performance name="Good" value={(userDetails?.ratings?.good || 25) * 10} color="bg-[#1C1C1E] dark:bg-white" />
                      <Performance name="Average" value={(userDetails?.ratings?.average || 20) * 10} color="bg-[#1C1C1E] dark:bg-white" />
                      <Performance name="Avg. Below" value={(userDetails?.ratings?.belowAverage || 15) * 10} color="bg-[#1C1C1E] dark:bg-white" />
                      <Performance name="Poor" value={(userDetails?.ratings?.poor || 5) * 10} color="bg-[#1C1C1E] dark:bg-white" />
                    </div>
                  </div>

                  {/* Box 3: Tasks Last Month */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#DDE2E5] dark:border-border">
                      <Typography textColor="text-[#1C1C1E] dark:text-white" textWeight="font-semibold" textSize="text-[15px]">
                        Tasks Last Month
                      </Typography>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#DDE2E5] dark:border-border">
                        <span className="text-[14px] font-medium text-[#1C1C1E] dark:text-white">Restock New kaftan products</span>
                        <span className="text-[13px] text-[#8E8E93] dark:text-gray-400">5d ago</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#DDE2E5] dark:border-border">
                        <span className="text-[14px] font-medium text-[#1C1C1E] dark:text-white truncate max-w-[70%]">Purchase report for last month for investor client</span>
                        <span className="text-[13px] text-[#8E8E93] dark:text-gray-400">5d ago</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-3.5">
                        <span className="text-[14px] font-medium text-[#1C1C1E] dark:text-white">New product order from port</span>
                        <span className="text-[13px] text-[#8E8E93] dark:text-gray-400">5d ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
