'use client';

export const dynamic = 'force-dynamic';

import React, {
  Suspense,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { selectMustChangePassword } from '@/redux/slices/auth-slice';
import { AUTH_ROUTES } from '@/lib/routes';

import CompleteKycPopover from '@/pattern/common/organisms/complete-kyc-popover';
import { If } from '@/pattern/common/atoms/If';
import { Sidebar } from '@/pattern/common/templates/sidebar';
import { type UserDetails } from '@/types';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayoutInner: React.FC<UserLayoutProps> = ({ children }) => {
  const stateData = useAppSelector(reduxData);
  const mustChangePassword = useAppSelector(selectMustChangePassword);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  // Route guard: redirect team members who must change their password
  useEffect(() => {
    if (mustChangePassword) {
      router.replace(AUTH_ROUTES.createNewPassword);
    }
  }, [mustChangePassword, router]);

  const [userDetails, setUserDetails] = useState<UserDetails>({
    businessName: '',
    profileImage: '',
    personalName: '',
    averageRating: 0,
    profit: 0,
    items: 0,
    ratings: {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0,
      poor: 0,
    },
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
        averageRating: Number(apiData?.averageRating ?? 0),
        profit: Number(apiData?.profit ?? 0),
        items: Number(apiData?.items ?? 0),
        ratings: typeof apiData?.ratings === 'object' && apiData?.ratings !== null
          ? apiData.ratings
          : {
              excellent: 0,
              good: 0,
              average: 0,
              belowAverage: 0,
              poor: 0,
            },
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

  const searchParams = useSearchParams();
  const isEditing = !!searchParams.get('edit');

  // Memoized computed values
  const { addSearch, currentPage } = useMemo(() => {
    const cleanPath = pathname.replace(/^\//, '');
    const pathSegments = cleanPath.split('/');
    const basePage = pathSegments[0];
    const subPage = pathSegments[1];
    const actionPage = pathSegments[2];

    const searchablePages = ['orders', 'products', 'wallet', 'customers'];

    let computedPageName = subPage || basePage;

    if (subPage === 'discounts') {
      if (actionPage === 'create' && isEditing) computedPageName = 'Edit Discount';
      else if (actionPage === 'create') computedPageName = 'Add Discount';
      else if (actionPage === 'edit') computedPageName = 'Edit Discount';
    } else if (subPage === 'collections') {
      if (actionPage === 'create' && isEditing) computedPageName = 'Edit Collection';
      else if (actionPage === 'create') computedPageName = 'Add Collection';
      else if (actionPage === 'edit') computedPageName = 'Edit Collection';
    } else if (subPage === 'add-product') {
      computedPageName = isEditing ? 'Edit Product' : 'Add Product';
    }

    return {
      addSearch: searchablePages.includes(basePage),
      currentPage: computedPageName,
    };
  }, [pathname, isEditing]);

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
        <header className='sticky top-0 bg-background w-full px-4 md:px-8 pt-4 md:pt-6'>
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
        <main className="w-full overflow-auto pt-4 md:pt-6 px-4 md:px-8 pb-4 md:pb-8">{children}</main>
      </div>

      {/* KYC Completion Popup */}
      <If isTrue={showKycPopUp}>
        <CompleteKycPopover setShowKycPopUp={setShowKycPopUp} />
      </If>
    </div>
  );
};

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <Suspense fallback={null}>
      <UserLayoutInner>{children}</UserLayoutInner>
    </Suspense>
  );
};

export default UserLayout;

