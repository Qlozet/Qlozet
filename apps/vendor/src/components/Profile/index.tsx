// Trigger Vercel rebuild
import Typography from '../Typography';
import closeIcon from '@/public/assets/svg/close-square-icon.svg';
import rotate from '@/public/assets/svg/rotate-icon.svg';
import Image from 'next/image';
import Performance from '../Performance';
import Rating from '../Rating';
import { ProfileProps } from '../../types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import WeeklyDigestSection from '@/pattern/common/organisms/weekly-digest-section';
import { useGetProfileQuery } from '@/redux/services/auth/auth.api-slice';
import { useGetVendorProductRatingsQuery } from '@/redux/services/products/products.api-slice';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import NiceModal from '@ebay/nice-modal-react';
import { ProductReviewsSheet } from '@/pattern/products/organisms/product-reviews-sheet';
import { OverlayScroll } from '@/components/OverlayScroll';

// Bands rendered in the reviews breakdown, in display order.
const RATING_BANDS = [
  { key: 'excellent', name: 'Excellent' },
  { key: 'good', name: 'Good' },
  { key: 'average', name: 'Average' },
  { key: 'belowAverage', name: 'Avg. Below' },
  { key: 'poor', name: 'Poor' },
] as const;

const Profile = ({
  userDetails,
  showProfile,
  showProfileHandler,
  isLoading,
}: ProfileProps) => {
  // Live vendor reviews (aggregated across the vendor's products). The
  // userDetails transform doesn't populate ratings, so read them here.
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const businessId = activeBusiness?._id ?? '';
  const { data: vrRaw } = useGetVendorProductRatingsQuery(
    { business_id: businessId },
    { skip: !businessId || !showProfile }
  );
  const summary = (vrRaw as any)?.data?.summary ?? (vrRaw as any)?.summary;

  const bandCount = (key: (typeof RATING_BANDS)[number]['key']): number => {
    const map: Record<string, string> = {
      excellent: 'five_star',
      good: 'four_star',
      average: 'three_star',
      belowAverage: 'two_star',
      poor: 'one_star',
    };
    return summary?.[map[key]] ?? userDetails?.ratings?.[key] ?? 0;
  };
  const averageRating =
    summary?.average_rating ?? userDetails?.averageRating ?? 0;
  const totalReviews =
    summary?.total_reviews ??
    RATING_BANDS.reduce(
      (sum, band) => sum + (userDetails?.ratings?.[band.key] ?? 0),
      0
    );
  const hasReviews = totalReviews > 0;

  // The signed-in user's email isn't part of UserDetails, so read it from
  // /users/me directly. Skipped until the sheet is actually opened.
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !showProfile,
  });
  const email = profileData?.data?.email;

  return (
    <Sheet
      open={showProfile}
      onOpenChange={(open) => !open && showProfileHandler()}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:rounded-[15px] custom-card-shadow !bg-white dark:!bg-card border border-gray-100 dark:border-border"
      >
        <div className="flex flex-col h-full bg-white dark:bg-card rounded-[15px]">
          {/* Header */}
          <SheetHeader className="shrink-0 border-b border-border px-4 py-5 sm:px-6">
            <SheetTitle className="text-lg font-semibold text-[#0C0C0D] dark:text-white text-left w-full">
              Profile
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable body */}
          <OverlayScroll className="flex-1">
            <div className="space-y-5 px-4 py-5 sm:px-6">
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
                  {/* Box 1: Profile Info.
                      Per the design the card itself is white — it's the avatar
                      that sits on a grey circle, not the whole panel. */}
                  <div className="rounded-[20px] bg-white dark:bg-card overflow-hidden p-6">
                    <div className="flex flex-col items-center">
                      {/* Avatar */}
                      <div className="size-40 rounded-full overflow-hidden bg-[hsla(0,0%,92%,1)] dark:bg-muted mb-4">
                        {/* No <Image> without a src — next/image treats "" as a
                            missing prop and re-requests the page. Fall back to
                            the initial instead. */}
                        {userDetails?.profileImage ? (
                          <Image
                            src={userDetails.profileImage}
                            width={160}
                            height={160}
                            alt="Profile Image"
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-5xl font-bold text-gray-500 dark:text-gray-300">
                              {(
                                userDetails?.personalName ||
                                userDetails?.businessName ||
                                ''
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Names */}
                      <Typography
                        textColor="text-[#1C1C1E] dark:text-white"
                        textWeight="font-semibold"
                        textSize="text-[20px]"
                        className="tracking-tight text-center"
                      >
                        {userDetails?.personalName}
                      </Typography>
                      <Typography
                        textColor="text-[#8E8E93] dark:text-gray-300"
                        textWeight="font-medium"
                        textSize="text-[15px]"
                        className="mt-0.5 text-center"
                      >
                        {userDetails?.businessName}
                      </Typography>
                      {/* Email comes straight from /users/me — it isn't part of
                          the UserDetails the layout threads down. */}
                      {email && (
                        <Typography
                          textColor="text-[#8E8E93] dark:text-gray-400"
                          textWeight="font-normal"
                          textSize="text-[13px]"
                          className="mt-1 text-center break-all"
                        >
                          {email}
                        </Typography>
                      )}
                    </div>

                    {/* Items & Profit */}
                    <div className="flex justify-center items-center mt-8">
                      <div className="flex flex-col items-center flex-1">
                        <Typography
                          textColor="text-[#1C1C1E] dark:text-white"
                          textWeight="font-bold"
                          textSize="text-[22px]"
                          className="tracking-tight"
                        >
                          {userDetails?.items?.toLocaleString() || '0'}
                        </Typography>
                        <Typography
                          textColor="text-[#8E8E93] dark:text-gray-400"
                          textWeight="font-semibold"
                          textSize="text-[10px]"
                          className="tracking-widest uppercase mt-1"
                        >
                          Items
                        </Typography>
                      </div>

                      <div className="w-px h-10 bg-[#DDE2E5] dark:bg-border mx-4" />

                      <div className="flex flex-col items-center flex-1">
                        <Typography
                          textColor="text-[#1C1C1E] dark:text-white"
                          textWeight="font-bold"
                          textSize="text-[22px]"
                          className="tracking-tight"
                        >
                          ${userDetails?.profit?.toLocaleString() || '0'}
                        </Typography>
                        <Typography
                          textColor="text-[#8E8E93] dark:text-gray-400"
                          textWeight="font-semibold"
                          textSize="text-[10px]"
                          className="tracking-widest uppercase mt-1"
                        >
                          Profit
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Customers Reviews */}
                  <div className="rounded-[20px] bg-[hsla(0,0%,96%,1)] dark:bg-[#4A4949] overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Typography
                        textColor="text-[#1C1C1E] dark:text-white"
                        textWeight="font-semibold"
                        textSize="text-[15px]"
                      >
                        Customers Reviews
                      </Typography>
                      {hasReviews && (
                        <button
                          type="button"
                          onClick={() =>
                            NiceModal.show(ProductReviewsSheet, {
                              businessId,
                              title: 'Customer reviews',
                            })
                          }
                          className="text-[12px] font-semibold text-[#A67B5B] dark:text-[#E0D5CB] underline"
                        >
                          Read reviews
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-1">
                      {/* Not rounded to a whole star — react-stars renders
                          halves, which is how the design shows e.g. 4.8. */}
                      <Rating newRating={averageRating || 0} />
                      <div className="flex items-baseline gap-1.5">
                        <Typography
                          textColor="text-[#1C1C1E] dark:text-white"
                          textWeight="font-bold"
                          textSize="text-[18px]"
                        >
                          {averageRating || '0'}
                        </Typography>
                        <Typography
                          textColor="text-[#8E8E93] dark:text-gray-300"
                          textWeight="font-medium"
                          textSize="text-[13px]"
                        >
                          Out of 5 Stars
                        </Typography>
                      </div>
                    </div>

                    <div className="mb-5">
                      <span className="text-[13px] text-[#A67B5B] dark:text-[#E0D5CB] font-medium flex items-center gap-1">
                        Overall rating of {totalReviews} customer
                        {totalReviews === 1 ? '' : 's'}&apos; reviews
                      </span>
                    </div>

                    {/* Performance bars. The counts are shown as-is: an absent
                        or all-zero breakdown renders the empty note below
                        rather than a fabricated 35/25/20/15/5 split. */}
                    {hasReviews ? (
                      <div className="space-y-1">
                        {RATING_BANDS.map((band) => (
                          <Performance
                            key={band.name}
                            name={band.name}
                            value={bandCount(band.key)}
                            total={totalReviews}
                            color="bg-[#1C1C1E] dark:bg-white"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-[13px] text-[#8E8E93] dark:text-gray-400">
                        No customer reviews yet.
                      </p>
                    )}
                  </div>

                  {/* Box 3: Weekly Digest (AI) — replaces the old static tasks */}
                  <WeeklyDigestSection />
                </>
              )}
            </div>
          </OverlayScroll>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Profile;
