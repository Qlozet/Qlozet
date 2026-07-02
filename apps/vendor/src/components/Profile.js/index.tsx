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
        className="w-full overflow-y-auto p-0 sm:max-w-md !top-4 !bottom-4 !right-4 !h-[calc(100vh-2rem)] rounded-[6px] custom-card-shadow !bg-white sidebar-scrollbar border border-gray-100"
      >
        <div className="bg-white rounded-[6px] pb-8 min-h-full w-full h-full text-[#1C1C1E]">
          <SheetHeader className="px-6 py-6 pb-2">
            <SheetTitle className="text-[17px] font-semibold text-[#1C1C1E] text-left w-full">
              Profile
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center mt-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F2F2F7] mb-4">
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
            <Typography textColor="text-[#1C1C1E]" textWeight="font-semibold" textSize="text-[20px]" className="tracking-tight">
              {userDetails?.personalName}
            </Typography>
            <Typography textColor="text-[#8E8E93]" textWeight="font-medium" textSize="text-[15px]" className="mt-0.5">
              {userDetails?.businessName}
            </Typography>
          </div>

          {/* Items & Profit */}
          <div className="flex justify-center items-center mt-8 mb-2 px-8">
            <div className="flex flex-col items-center flex-1">
              <Typography textColor="text-[#1C1C1E]" textWeight="font-bold" textSize="text-[22px]" className="tracking-tight">
                {userDetails?.items?.toLocaleString() || '0'}
              </Typography>
              <Typography textColor="text-[#8E8E93]" textWeight="font-semibold" textSize="text-[10px]" className="tracking-widest uppercase mt-1">
                Items
              </Typography>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <Typography textColor="text-[#1C1C1E]" textWeight="font-bold" textSize="text-[22px]" className="tracking-tight">
                ${userDetails?.profit?.toLocaleString() || '0'}
              </Typography>
              <Typography textColor="text-[#8E8E93]" textWeight="font-semibold" textSize="text-[10px]" className="tracking-widest uppercase mt-1">
                Profit
              </Typography>
            </div>
          </div>

          <div className="border-t-[0.5px] border-[#E5E5EA] w-full mt-8 mb-6"></div>

          {/* Customers Reviews */}
          <div className="px-6 mb-2">
            <div className="flex items-center justify-between mb-4">
              <Typography textColor="text-[#1C1C1E]" textWeight="font-semibold" textSize="text-[17px]">
                Customers Reviews
              </Typography>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <Rating newRating={Math.round(userDetails?.averageRating || 0)} />
              <div className="flex items-baseline gap-1.5">
                <Typography textColor="text-[#1C1C1E]" textWeight="font-bold" textSize="text-[18px]">
                  {userDetails?.averageRating || '0'}
                </Typography>
                <Typography textColor="text-[#8E8E93]" textWeight="font-medium" textSize="text-[13px]">
                  Out of 5 Stars
                </Typography>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-[13px] text-[#A67B5B] font-medium hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-1">
                Overall rating of 100 customer's reviews <span className="text-[16px] leading-none mb-0.5">›</span>
              </span>
            </div>

            {/* Performance Bars */}
            <div className="space-y-1">
              <Performance
                name="Excellent"
                value={(userDetails?.ratings?.excellent || 35) * 10}
                color="bg-[#1C1C1E]"
              />
              <Performance
                name="Good"
                value={(userDetails?.ratings?.good || 25) * 10}
                color="bg-[#1C1C1E]"
              />
              <Performance
                name="Average"
                value={(userDetails?.ratings?.average || 20) * 10}
                color="bg-[#1C1C1E]"
              />
              <Performance
                name="Avg. Below"
                value={(userDetails?.ratings?.belowAverage || 15) * 10}
                color="bg-[#1C1C1E]"
              />
              <Performance
                name="Poor"
                value={(userDetails?.ratings?.poor || 5) * 10}
                color="bg-[#1C1C1E]"
              />
            </div>
          </div>

          <div className="border-t-[0.5px] border-[#E5E5EA] w-full mt-8 mb-6"></div>

          {/* Task Last Month (Apple Settings Style) */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <Typography textColor="text-[#1C1C1E]" textWeight="font-semibold" textSize="text-[17px]">
                Tasks Last Month
              </Typography>
            </div>

            <div className="flex flex-col mt-4">
              <div className="flex justify-between items-center py-3.5 border-b-[0.5px] border-[#E5E5EA]">
                <span className="text-[15px] font-medium text-[#1C1C1E]">Restock New kaftan products</span>
                <span className="text-[15px] text-[#8E8E93]">5d ago</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b-[0.5px] border-[#E5E5EA]">
                <span className="text-[15px] font-medium text-[#1C1C1E] truncate max-w-[70%]">Purchase report for last month for investor client</span>
                <span className="text-[15px] text-[#8E8E93]">5d ago</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[15px] font-medium text-[#1C1C1E]">New product order from port</span>
                <span className="text-[15px] text-[#8E8E93]">5d ago</span>
              </div>
            </div>
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
