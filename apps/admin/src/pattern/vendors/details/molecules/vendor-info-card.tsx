'use client';

import { InfoCard, type InfoCardProps } from '@/pattern/common/molecules/info-card';

// Thin alias kept for the vendor detail grid; the implementation now lives in
// the shared InfoCard so the vendor and customer grids stay in sync.
export type VendorInfoCardProps = Pick<
  InfoCardProps,
  'label' | 'value' | 'linkLabel' | 'onLinkClick' | 'valueClassName'
>;

export const VendorInfoCard = (props: VendorInfoCardProps) => (
  <InfoCard {...props} />
);
