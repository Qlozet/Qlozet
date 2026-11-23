'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  useGetBusinessProfileQuery,
  useUpdateBusinessSettingsMutation,
} from '@/redux/services/settings/settings.api-slice';
import { readApiError } from '@/redux/services/types';
import { useAppSelector } from '@/redux/store';
import { selectActiveBusiness } from '@/redux/slices/auth-slice';
import { OfferingsPicker } from './offerings-picker';

/**
 * "What do you sell?", asked once: straight after sign-up, and at the next
 * sign-in for stores made before the question existed. Only the owner can
 * answer (saving the profile is owner-only), so team members never see it.
 * No close button: it is one tap, and until it is answered fabric and
 * accessory shops keep getting bespoke requests.
 */
export const OfferingsPrompt = () => {
  const activeBusiness = useAppSelector(selectActiveBusiness);
  const isOwner = activeBusiness
    ? activeBusiness.is_owner || activeBusiness.role?.toLowerCase() === 'owner'
    : undefined;
  const { data: profile, isSuccess } = useGetBusinessProfileQuery(undefined, {
    skip: isOwner === false,
  });
  const [save, { isLoading }] = useUpdateBusinessSettingsMutation();
  const [picked, setPicked] = useState<string[]>([]);

  const open =
    isOwner !== false &&
    isSuccess &&
    !!profile &&
    !profile.offerings_answered_at;
  if (!open) return null;

  const submit = async () => {
    try {
      await save({ offerings: picked }).unwrap();
      toast.success(
        picked.includes('made_to_measure')
          ? 'Saved. Customers can now send you bespoke requests.'
          : 'Saved. You can change this any time in Settings.'
      );
    } catch (error) {
      toast.error(readApiError(error, 'Could not save. Try again.'));
    }
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="max-w-[640px]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">What do you sell?</DialogTitle>
          <DialogDescription>
            Tick everything that applies. This sets up your first steps and
            decides whether customers can ask you for custom work. It never
            limits what you can list, and you can change it in Settings.
          </DialogDescription>
        </DialogHeader>

        <OfferingsPicker
          value={picked}
          onChange={setPicked}
          disabled={isLoading}
        />

        <div className="flex justify-end pt-2">
          <Button
            onClick={submit}
            disabled={!picked.length || isLoading}
            className="min-w-[140px] bg-[#3d2817] hover:bg-[#2e1e10] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
