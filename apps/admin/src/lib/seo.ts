import type { Metadata } from 'next';

// Central SEO / social-sharing config for the admin console.
//
// NOTE ON INDEXING: this is a private, authenticated operations console — there
// is nothing here for a search engine to usefully index, and letting crawlers
// enumerate admin routes is a needless disclosure. So `INDEXABLE` is false and
// every page ships `noindex, nofollow` (see also src/app/robots.ts). Open Graph
// and Twitter cards still work regardless — link unfurls in Slack/WhatsApp do
// not depend on indexing. Flip this one constant if that ever changes.
export const INDEXABLE = false;

const FALLBACK_URL = 'http://localhost:3001';

const normalise = (url: string) => url.replace(/\/+$/, '');

export const siteConfig = {
  name: 'Qlozet Admin',
  titleTemplate: '%s · Qlozet Admin',
  description:
    'Operations console for the Qlozet marketplace — manage vendors, orders, products, payouts, customers and support.',
  url: normalise(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL),
  locale: 'en_US',
  themeColor: '#3E1C01',
  backgroundColor: '#FFFFFF',
  publisher: 'Qlozet',
  keywords: [
    'Qlozet',
    'admin console',
    'marketplace operations',
    'vendor management',
    'order management',
    'clothing marketplace',
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
  /** Page title, slotted into the "%s · Qlozet Admin" template. */
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
