import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Typography from '../Typography';
import Profile from '../Profile.js';

// Import SVG assets
import searchNormalicon from '@/public/assets/svg/search-normal.svg';
import notificationIcon from '@/public/assets/svg/notification-bing.svg';
import altireicon from '@/public/assets/svg/altire-icon.svg';
import transformText from '@/public/assets/svg/textformat.size.svg';
import clockwise from '@/public/assets/svg/arrow.clockwise.svg';
import userIcon from '@/public/assets/svg/user-octagon.svg';
import menuIcon from '@/public/assets/svg/menu-icon.svg';
import mobileProfile from '@/public/assets/svg/mobile-oct-icon.svg';

interface UserDetails {
  personalName?: string;
  [key: string]: any;
}

interface DashboardNavWithOutSearchProps {
  name?: string;
  addSearch?: boolean;
  setValue?: (value: string) => void;
  value?: string;
  showSideBar: () => void;
  hideNav?: boolean;
  userDetails?: UserDetails;
}

const DashboardNavWithOutSearch: React.FC<DashboardNavWithOutSearchProps> = ({
  name,
  addSearch,
  setValue,
  value,
  showSideBar,
  hideNav,
  userDetails,
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
        className={`${
          !hideNav ? ' ' : 'pt-2'
        } rounded-[15px] max-w-[1200px] lg:m-0 shadow-[0px_4px_10px_#AEAEC026]`}
      >
        <div className='block lg:hidden'>
          <div className='items-center justify-between px-3 py-3 bg-gray-400 rounded-[12px] hidden'>
            <Image src={transformText} alt='Text format' />
            <Image src={altireicon} alt='Altire icon' />
            <Image src={clockwise} alt='Clockwise icon' />
          </div>
          {!hideNav && (
            <div className='flex items-center justify-between mt-0 lg:mt-0'>
              <div className='flex items-center gap-4'>
                <div
                  className='w-[2rem] h-[2rem] bg-primary flex items-center justify-center rounded-[8px] cursor-pointer'
                  onClick={showSideBar}
                >
                  <Image alt='Menu icon' src={menuIcon} />
                </div>
                <div className='hidden md:block'>
                  <Typography
                    textColor='text-dark'
                    textWeight='font-medium'
                    textSize='text-[18px]'
                  >
                    {capitalizedName}
                  </Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer'>
                  <Image
                    alt='Notification icon'
                    src={notificationIcon}
                    onClick={handleNotificationClick}
                  />
                </div>
                <div className='hidden md:block'>
                  <Typography
                    textColor='text-dark'
                    textWeight='font-semibold'
                    textSize='text-[18px]'
                  >
                    {userDetails && userDetails.personalName}
                  </Typography>
                </div>
                <div className='rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer'>
                  <Image
                    alt='Profile icon'
                    src={mobileProfile}
                    onClick={handleProfileClick}
                    className='cursor-pointer'
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className='hidden lg:flex items-center justify-between bg-white py-2 px-6 rounded-[12px]'>
          <div className='hidden md:block'>
            <Typography
              textColor='text-dark'
              textWeight='font-medium'
              textSize='text-[18px]'
            >
              {capitalizedName}
            </Typography>
          </div>
          <div className='flex items-center justify-end gap-6'>
            {addSearch && (
              <div className='relative min-w-96'>
                <div className='absolute left-2 top-[10px]'>
                  <Image alt='Search icon' src={searchNormalicon} />
                </div>
                <input
                  value={value}
                  onChange={handleInputChange}
                  placeholder='Search'
                  className='py-2 pl-12 w-full border-solid border-[1.5px] placeholder-gray-200 text-dark focus:outline-none focus:border-none border-gray-2 rounded-[12px] overflow-hidden text-sm text-font-light placeholder:font-300 bg-[#F8F9FA]'
                />
              </div>
            )}
            <div className='flex items-center justify-between gap-4'>
              <div
                className='rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer'
                onClick={handleNotificationClick}
              >
                <Image alt='Notification icon' src={notificationIcon} />
              </div>
              <Typography
                textColor='text-dark'
                textWeight='font-normal'
                textSize=''
              >
                {userDetails && userDetails.personalName}
              </Typography>
              <div className='rounded-[12px] p-2 bg-[#F8F9FA] cursor-pointer'>
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
      {showProfile && (
        <Profile
          showProfileHandler={showProfileHandler}
          userDetails={userDetails}
          showProfile={showProfile}
        />
      )}
    </div>
  );
};

export default DashboardNavWithOutSearch;
