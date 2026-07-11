import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Typography from '../Typography';
import Profile from '../Profile.js';
import { UserDetails } from '@/types';
import { Search, Bell, Menu, User } from 'lucide-react';
import notificationIcon from '@/public/assets/svg/notification-bing.svg';
import altireicon from '@/public/assets/svg/altire-icon.svg';
import transformText from '@/public/assets/svg/textformat.size.svg';
import clockwise from '@/public/assets/svg/arrow.clockwise.svg';
import userIcon from '@/public/assets/svg/user-octagon.svg';
import menuIcon from '@/public/assets/svg/menu-icon.svg';
import mobileProfile from '@/public/assets/svg/mobile-oct-icon.svg';
import { cn } from '@/lib/utils';



interface DashboardNavWithOutSearchProps {
  name?: string;
  addSearch?: boolean;
  showSideBar: () => void;
  hideNav?: boolean;
  userDetails?: UserDetails;
  setValue?: (data: string) => void;
  value?: string;
  isLoading?: boolean;
}

const DashboardNavWithOutSearch: React.FC<DashboardNavWithOutSearchProps> = ({
  name,
  addSearch,
  setValue,
  value,
  showSideBar,
  hideNav,
  userDetails,
  isLoading,
}) => {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState<boolean>(false);

  const showProfileHandler = (): void => {
    setShowProfile(!showProfile);
  };

  const capitalizedName: string = name
    ? name.replace(/\b\w/g, (char: string) => char.toUpperCase())
    : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (setValue) {
      setValue(e.target.value);
    }
  };

  const handleNotificationClick = (): void => {
    router.push('notification');
  };

  const handleProfileClick = (): void => {
    setShowProfile(true);
  };
  return (
    <div className=''>
      <div
        className={cn(
          !hideNav ? ' ' : 'pt-2', "rounded-2xl lg:m-0 shadow-[0px_4px_10px_#AEAEC026]"
        )}
      >
        {/* Mobile navigation */}
        <div className='block lg:hidden'>
          <div className='items-center justify-between px-3 py-3 bg-gray-400 rounded-[12px] hidden'>
            <Image src={transformText} alt='Text format' />
            <Image src={altireicon} alt='Altire icon' />
            <Image src={clockwise} alt='Clockwise icon' />
          </div>
          {/* Mobile Navigation End */}
          {!hideNav && (
            <div className='flex items-center justify-between bg-white dark:bg-card py-2 px-3 sm:px-4 rounded-[12px] border border-border shadow-sm transition-colors'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 bg-primary hover:bg-primary/90 flex items-center justify-center rounded-[10px] cursor-pointer transition-colors shadow-sm'
                  onClick={showSideBar}
                >
                  <Menu className='size-5 text-primary-foreground' />
                </div>
                <div className='block'>
                  <Typography
                    textColor='text-dark dark:text-foreground'
                    textWeight='font-semibold'
                    textSize='text-[16px] sm:text-[18px]'
                  >
                    {capitalizedName}
                  </Typography>
                </div>
              </div>
              
              <div className='flex items-center gap-2 sm:gap-3'>
                <div 
                  className='rounded-[10px] size-10 flex items-center justify-center bg-[#F8F9FA] dark:bg-muted cursor-pointer hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors'
                  onClick={handleNotificationClick}
                >
                  <Bell className='size-5 text-gray-800 dark:text-white' />
                </div>
                <div 
                  className='rounded-[10px] size-10 flex items-center justify-center bg-[#F8F9FA] dark:bg-muted cursor-pointer hover:bg-gray-100 dark:hover:bg-muted/80 transition-colors'
                  onClick={handleProfileClick}
                >
                  <Image
                    alt='Profile icon'
                    src={userIcon}
                    className='size-5 dark:brightness-200'
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='hidden lg:w-full lg:flex items-center gap-6 bg-white dark:bg-card py-2 px-6 rounded-[12px]'>
          <div className='hidden md:block'>
            <Typography
              textColor='text-dark dark:text-foreground'
              textWeight='font-medium'
              textSize='text-[18px]'
            >
              {capitalizedName}
            </Typography>
          </div>
          {addSearch && (
            <div className='flex flex-1 justify-center'>
              <div className='relative w-full max-w-xl'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                  <Search className='text-gray-400 dark:text-muted-foreground size-5' />
                </div>
                <input
                  value={value}
                  onChange={handleInputChange}
                  placeholder='Search'
                  className='py-2 pl-12 w-full border-solid border-[1.5px] placeholder-gray-4 dark:placeholder-muted-foreground text-dark dark:text-foreground focus:outline-none focus:border-none border-gray-2 dark:border-border rounded-[12px] overflow-hidden text-sm font-light placeholder:font-light bg-[#F8F9FA] dark:bg-muted'
                />
              </div>
            </div>
          )}
          <div className='flex items-center justify-end gap-6 ml-auto'>
            <div className='flex items-center justify-between gap-4'>
              <div
                className='rounded-[12px] p-2 bg-[#F8F9FA] dark:bg-muted cursor-pointer flex items-center justify-center'
                onClick={handleNotificationClick}
              >
                <Bell className='size-5 text-gray-800 dark:text-white' />
              </div>
              <Typography
                textColor='text-dark dark:text-foreground'
                textWeight='font-normal'
                textSize=''
              >
                {userDetails && userDetails.personalName}
              </Typography>
              <div className='rounded-[12px] p-2 bg-[#F8F9FA] dark:bg-muted cursor-pointer'>
                <Image
                  alt='User icon'
                  src={userIcon}
                  onClick={handleProfileClick}
                  className='cursor-pointer'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Profile
        showProfileHandler={showProfileHandler}
        userDetails={userDetails}
        showProfile={showProfile}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardNavWithOutSearch;
