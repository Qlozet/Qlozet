'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AUTH_ROUTES } from '@/lib/routes';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { removeCookie } from '@/lib/helpers/cookies-manager';
import { formatNaira } from '@/lib/orders';
import { initialsFrom, readUserAvatar, readUserName } from '@/lib/current-user';
import {
  useGetCurrentUserQuery,
  useGetRolesQuery,
} from '@/redux/services/users/users.api-slice';
import { useGetAdminDashboardQuery } from '@/redux/services/dashboard/dashboard.api-slice';
import { WeeklyDigestSection } from './weekly-digest-section';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-1 flex-col items-center">
    <p className="text-[22px] font-bold tracking-tight text-[#1C1C1E]">
      {value}
    </p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#8E8E93]">
      {label}
    </p>
  </div>
);

/**
 * Profile drawer — the admin counterpart of the vendor app's Profile sheet,
 * using the same card treatment.
 *
 * Deliberately NOT carried over from vendor: the "Customers Reviews" box.
 * Reviews are a vendor concept (customers rate the businesses they buy from) —
 * a platform admin is never rated, so that card could only ever be empty. The
 * stats row shows marketplace totals instead of a vendor's items/profit.
 */
export const ProfileSheet = ({ open, onOpenChange }: ProfileSheetProps) => {
  const skip = { skip: !open };

  const { data: userData, isLoading: isLoadingUser } = useGetCurrentUserQuery(
    undefined,
    skip
  );
  // `/users/me` returns `role` as an id, so resolve it to a display name.
  const { data: rolesData } = useGetRolesQuery(undefined, skip);
  const { data: metricsData, isLoading: isLoadingMetrics } =
    useGetAdminDashboardQuery(undefined, skip);

  const user = userData?.data;
  const name = readUserName(user);
  const avatarUrl = readUserAvatar(user);
  const email = typeof user?.email === 'string' ? user.email : null;

  const roleName = useMemo(() => {
    const raw = user?.role;
    if (raw && typeof raw === 'object') {
      const nested = (raw as { name?: unknown }).name;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
    if (typeof raw !== 'string' || !raw.trim()) return null;

    const match = (rolesData?.data ?? []).find((role) => role._id === raw);
    if (match?.name) return match.name;

    // Unresolved id — show nothing rather than a raw ObjectId.
    return /^[a-f0-9]{24}$/i.test(raw.trim()) ? null : raw.trim();
  }, [user, rolesData]);

  const metrics = metricsData?.data;

  const handleLogout = () => {
    removeCookie(SESSION_COOKIE_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('AltireuserDetails');
      window.location.replace(AUTH_ROUTES.signIn);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md sm:!top-6 sm:!bottom-6 sm:!right-6 sm:!h-[calc(100vh-3rem)] sm:rounded-[15px] custom-card-shadow !bg-white border border-gray-100"
      >
        <div className="flex h-full flex-col rounded-[15px] bg-white">
          <SheetHeader className="shrink-0 border-b border-border px-4 py-5">
            <SheetTitle className="w-full text-left text-lg font-semibold text-[#0C0C0D]">
              Profile
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-5 px-4 py-5">
              {/* ── Identity + marketplace stats ── */}
              {isLoadingUser ? (
                <div className="flex flex-col items-center rounded-[20px] p-6">
                  <Skeleton className="mb-4 size-40 rounded-full" />
                  <Skeleton className="mb-2 h-6 w-40" />
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <div className="overflow-hidden rounded-[20px] bg-white p-6">
                  <div className="flex flex-col items-center">
                    {/* The card is white; the avatar sits on a grey circle. */}
                    <div className="mb-4 size-40 overflow-hidden rounded-full bg-[hsla(0,0%,92%,1)]">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          width={160}
                          height={160}
                          alt={name ?? 'Profile'}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-5xl font-bold text-gray-500">
                            {name ? initialsFrom(name) : '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-center text-[20px] font-semibold tracking-tight text-[#1C1C1E]">
                      {name ?? 'Signed in'}
                    </p>
                    {roleName && (
                      <p className="mt-0.5 text-center text-[15px] font-medium capitalize text-[#8E8E93]">
                        {roleName}
                      </p>
                    )}
                    {email && (
                      <p className="mt-1 break-all text-center text-[13px] text-[#8E8E93]">
                        {email}
                      </p>
                    )}
                  </div>

                  {/* The design's Items / Profit row, with the platform-level
                      equivalents an admin actually has. */}
                  <div className="mt-8 flex items-center justify-center">
                    {isLoadingMetrics ? (
                      <>
                        <Skeleton className="h-12 flex-1" />
                        <div className="mx-4 h-10 w-px bg-[#DDE2E5]" />
                        <Skeleton className="h-12 flex-1" />
                      </>
                    ) : (
                      <>
                        <Stat
                          label="Orders"
                          value={(metrics?.totalOrders ?? 0).toLocaleString()}
                        />
                        <div className="mx-4 h-10 w-px bg-[#DDE2E5]" />
                        <Stat
                          label="Gross Sales"
                          value={formatNaira(metrics?.grossSales ?? 0)}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Weekly digest (design's "Task Last Month" slot) ── */}
              <WeeklyDigestSection />
            </div>
          </div>

          <div className="shrink-0 border-t border-border px-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
