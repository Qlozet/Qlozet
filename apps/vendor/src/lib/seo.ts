import type { Metadata } from 'next';

// Central SEO / social-sharing config for the vendor app.
//
// NOTE ON INDEXING: this is a private, authenticated business dashboard — there
// is nothing here for a search engine to usefully index, and letting crawlers
// enumerate vendor routes is a needless disclosure. So `INDEXABLE` is false and
// every page ships `noindex, nofollow` (see also src/app/robots.ts). Open Graph
// and Twitter cards still work regardless — link unfurls in Slack/WhatsApp do
// not depend on indexing. Flip this one constant if that ever changes (e.g. if
// a public marketing or storefront route is added here).
export const INDEXABLE = false;

const FALLBACK_URL = 'http://localhost:3000';

const normalise = (url: string) => url.replace(/\/+$/, '');

export const siteConfig = {
  name: 'Qlozet Vendor',
  titleTemplate: '%s · Qlozet Vendor',
  description:
    'Run your clothing business on Qlozet — manage orders, products, collections, customers, payouts and support in one place.',
  url: normalise(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL),
  locale: 'en_US',
  themeColor: '#3E1C01',
  backgroundColor: '#FFFFFF',
  publisher: 'Qlozet',
  keywords: [
    'Qlozet',
    'vendor dashboard',
    'clothing business',
    'order management',
    'product management',
    'fashion retail',
  ],
} as const;

const robots: Metadata['robots'] = INDEXABLE
  ? { index: true, follow: true }
  : {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    };

/** Root metadata — every other page inherits and overrides pieces of this. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: 'Qlozet Team' }],
  creator: 'Qlozet Team',
  publisher: siteConfig.publisher,
  referrer: 'strict-origin-when-cross-origin',
  robots,
  // Stops iOS Safari from auto-linking numbers in tables as phone numbers.
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

interface PageMetadataInput {
  /** Page title, slotted into the "%s · Qlozet Vendor" template. */
  title: string;
  description: string;
  /** Route path, used for the canonical + OG url (e.g. "/orders"). */
  path: string;
}

/**
 * Builds per-page metadata. The icons and OG image are inherited from the root
 * layout's file-based conventions (icon.svg / apple-icon.png /
 * opengraph-image.png), so they don't need repeating here.
 */
export const buildMetadata = ({
  title,
  description,
  path,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: `${title} · ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}${path}`,
    locale: siteConfig.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} · ${siteConfig.name}`,
    description,
  },
});
