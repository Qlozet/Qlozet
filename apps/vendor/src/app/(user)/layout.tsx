'use client';

export const dynamic = 'force-dynamic';

import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';

import DasboardNavWithOutSearch from '@/components/DashboardNavBarWithoutSearch';
import MobileSideBar from '@/components/MobileSideBar';
import SideBar from '@/components/SideBar';
import Modal from '@/components/Modal';
import Logout from '@/components/Logout';

import { useGetVendorProfileQuery } from '@/redux/services/vendor/vendor.api-slice';
import { setUserData } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  handlelogout,
  setFilter,
  reduxData,
} from '@/redux/slices/filter-slice';

import CompleteKycPopover from '@/pattern/common/organisms/complete-kyc-popover';
import { If } from '@/pattern/common/atoms/If';
import { Sidebar } from '@/pattern/common/templates/sidebar';

interface UserDetails {
  businessName: string;
  profileImage: string;
  personalName: string;
  profilePic?: string;
  averageRating: string;
  profit: string;
  items: string;
  ratings?: string;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const stateData = useAppSelector(reduxData);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const [userDetails, setUserDetails] = useState<UserDetails>({
    businessName: '',
    profileImage: '',
    personalName: '',
    profilePic: '',
    averageRating: '',
    profit: '',
    items: '',
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });

  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const [showKycPopUp, setShowKycPopUp] = useState<boolean>(true);

  // Get Vendor Profile Data
  const {
    data: vendorProfileData,
    error: vendorProfileError,
    isLoading: vendorProfileLoading,
  } = useGetVendorProfileQuery();

  useEffect(() => {
    if (vendorProfileData?.data) {
      const apiData = vendorProfileData?.data;
      const details: UserDetails = {
        businessName: apiData?.businessName ?? '',
        personalName: apiData?.personalName ?? '',
        profileImage: apiData?.profileImage ?? '',
        profilePic: apiData?.profilePic ?? '',
        averageRating: apiData?.averageRating ?? '',
        profit: apiData?.profit ?? '',
        items: apiData?.items ?? '',
        ratings: apiData?.ratings ?? '',
      };

      setUserDetails(details);
      setUserData(details);
      setLoadingState({ isLoading: false, error: null });
    }
  }, [vendorProfileData]);

  // useEffect(() => {
  //   if (vendorProfileError) {
  //     console.error('Error getting vendor details:', vendorProfileError);
  //     setLoadingState({
  //       isLoading: false,
  //       error: 'Failed to load vendor details',
  //     });
  //     clearToken();
  //     router.push('/auth/sign-in');
  //   }
  // }, [vendorProfileError, router]);

  useEffect(() => {
    setLoadingState((prev) => ({ ...prev, isLoading: vendorProfileLoading }));
  }, [vendorProfileLoading]);

  const toggleMobileSidebar = useCallback((): void => {
    setShowMobileNav((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback((): void => {
    setShowMobileNav(false);
  }, []);

  const handleLogoutAction = useCallback(() => {
    dispatch(handlelogout({ logout: false }));
  }, [dispatch]);

  const handleFilterChange = useCallback(
    (data: string) => {
      dispatch(setFilter(data));
    },
    [dispatch]
  );

  // Memoized computed values
  const { addSearch, currentPage } = useMemo(() => {
    const cleanPath = pathname.replace(/^\//, '');
    const pathSegments = cleanPath.split('/');
    const basePage = pathSegments[0];

    const searchablePages = ['orders', 'products', 'wallet', 'customers'];

    return {
      addSearch: searchablePages.includes(basePage),
      currentPage: pathSegments[1] || basePage,
    };
  }, [pathname]);

  // if (loadingState.isLoading) {
  //   return (
  //     <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
  //       <div className='text-center'>
  //         <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
  //         <p className='text-gray-600'>Loading your dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (loadingState.error) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 text-xl mb-4'>⚠️</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Something went wrong
          </h2>
          <p className='text-gray-600 mb-4'>{loadingState.error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='relative bg-background w-full flex h-screen'>
      {/* Sidebar Components */}
      <Sidebar />

      <MobileSideBar
        showMobileNav={showMobileNav}
        active={currentPage}
        closeSideBar={closeMobileSidebar}
      />

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* Sticky Navigation Header */}
        <header className='sticky top-0 bg-background w-full px-8 pt-6'>
          <DasboardNavWithOutSearch
            userDetails={userDetails}
            value={stateData.state}
            addSearch={addSearch}
            setValue={handleFilterChange}
            name={currentPage}
            showSideBar={toggleMobileSidebar}
          />
        </header>

        {/* Page Content */}
        <main className="w-full overflow-auto pt-6 pl-8 pr-4 2xl:pr-8">{children}</main>
      </div>

      {/* KYC Completion Popup */}
      <If isTrue={showKycPopUp}>
        <CompleteKycPopover setShowKycPopUp={setShowKycPopUp} />
      </If>
    </div>
  );
};

export default UserLayout;
