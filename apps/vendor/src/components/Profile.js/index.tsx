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
        className="w-full overflow-y-auto p-0 sm:max-w-md !top-4 !bottom-4 !right-4 !h-[calc(100vh-2rem)] rounded-2xl custom-card-shadow !bg-white sidebar-scrollbar"
      >
        <div className="bg-white rounded-2xl pb-8 min-h-full w-full h-full text-grey-black">
          <SheetHeader className="px-6 py-6 pb-2">
            <SheetTitle className="text-[22px] font-bold text-grey-black text-left flex justify-between items-center">
              Profile
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center mt-4">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden bg-gray-100 mb-4 shadow-sm border border-gray-100">
              <Image
                src={userDetails?.profileImage || ''}
                width={120}
                height={120}
                alt="Profile Image"
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            
            {/* Names */}
            <Typography textColor="text-grey-black" textWeight="font-semibold" textSize="text-xl">
              {userDetails?.personalName}
            </Typography>
            <Typography textColor="text-gray-600" textWeight="font-normal" textSize="text-[15px]" className="mt-1">
              {userDetails?.businessName}
            </Typography>
          </div>

          {/* Items & Profit */}
          <div className="flex justify-center items-center mt-8 mb-6">
            <div className="flex flex-col items-center flex-1">
              <Typography textColor="text-gray-700" textWeight="font-medium" textSize="text-xs">
                Items
              </Typography>
              <Typography textColor="text-grey-black" textWeight="font-semibold" textSize="text-[22px]">
                {userDetails?.items?.toLocaleString() || '0'}
              </Typography>
            </div>
            
            <div className="h-10 w-px bg-gray-300 mx-2"></div>
            
            <div className="flex flex-col items-center flex-1">
              <Typography textColor="text-gray-700" textWeight="font-medium" textSize="text-xs">
                Profit
              </Typography>
              <Typography textColor="text-grey-black" textWeight="font-semibold" textSize="text-[22px]">
                ${userDetails?.profit?.toLocaleString() || '0'}
              </Typography>
            </div>
          </div>

          <div className="border-b border-gray-200 mx-6 mb-6"></div>

          {/* Customers Reviews */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <Typography textColor="text-grey-black" textWeight="font-bold" textSize="text-[16px]">
                Customers Reviews
              </Typography>
              <Image src={rotate} alt="refresh" className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" unoptimized />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Rating newRating={Math.round(userDetails?.averageRating || 0)} />
              <div className="flex items-center gap-1.5">
                <Typography textColor="text-grey-black" textWeight="font-bold" textSize="text-lg">
                  {userDetails?.averageRating || '0'}
                </Typography>
                <Typography textColor="text-gray-600" textWeight="font-normal" textSize="text-[11px]" className="mt-0.5">
                  Out of 5 Stars
                </Typography>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[11px] text-gray-700 underline underline-offset-2 hover:text-black cursor-pointer transition-colors">
                Overall rating of 100 customer's reviews
              </span>
            </div>

            {/* Performance Bars */}
            <div className="space-y-1">
              <Performance
                name="Excellent"
                value={(userDetails?.ratings?.excellent || 35) * 10}
                color="bg-[#462310]"
              />
              <Performance
                name="Good"
                value={(userDetails?.ratings?.good || 25) * 10}
                color="bg-[#A67B5B]"
              />
              <Performance
                name="Average"
                value={(userDetails?.ratings?.average || 20) * 10}
                color="bg-[#BBA295]"
              />
              <Performance
                name="Avg. Below"
                value={(userDetails?.ratings?.belowAverage || 15) * 10}
                color="bg-[#99847F]"
              />
              <Performance
                name="Poor"
                value={(userDetails?.ratings?.poor || 5) * 10}
                color="bg-[#606261]"
              />
            </div>
          </div>

          <div className="border-b border-gray-200 mx-6 mb-6"></div>

          {/* Task Last Month (Static Placeholder based on Mockup) */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Typography textColor="text-grey-black" textWeight="font-bold" textSize="text-[15px]">
                Task Last Month
              </Typography>
              <Image src={rotate} alt="refresh" className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" unoptimized />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[11px] text-gray-800 font-medium">All</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <span className="text-[11px] text-gray-500">Delivered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <span className="text-[11px] text-gray-500">Order</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-[12px] font-semibold text-gray-600">#New Category add</span>
              <span className="text-[11px] text-gray-500">Last Week</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-grey-black">Restock New kaftan products</span>
                <span className="text-[11px] text-gray-500">5d ago</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-semibold text-grey-black max-w-[70%]">Purchase report for last month for investor client</span>
                <span className="text-[11px] text-gray-500 mt-1">5d ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-grey-black">New product order from port</span>
                <span className="text-[11px] text-gray-500">5d ago</span>
              </div>
            </div>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
