import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Measurement accuracy',
  description:
    'Measurement corrections per body part and fit feedback on made-to-fit pieces.',
  path: '/measurements',
});

export default function MeasurementsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
