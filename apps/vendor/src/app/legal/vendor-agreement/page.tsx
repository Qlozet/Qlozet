import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Markdown } from '@/components/ui/markdown';
import { env } from '@/env/client';
import { AUTH_ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Vendor Agreement',
  description:
    'The agreement every store on Qlozet accepts before it can sell.',
};

interface AgreementDoc {
  version: string;
  current: boolean;
  body: string;
}

/**
 * The agreement from the public endpoint — the same text the verification
 * page serves, so what someone reads before signing up and what they accept
 * later can never differ. Unwraps the API's `{ data }` envelope when present.
 */
async function loadAgreement(version?: string): Promise<AgreementDoc | null> {
  const query = version ? `?version=${encodeURIComponent(version)}` : '';
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_BASE_URL}/legal/vendor-agreement${query}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const doc = (json?.data ?? json) as Partial<AgreementDoc> | null;
    return doc?.body ? (doc as AgreementDoc) : null;
  } catch {
    return null;
  }
}

/** Public: reachable signed out (see PUBLIC_PREFIXES in src/proxy.ts). */
export default async function VendorAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ version?: string | string[] }>;
}) {
  const { version } = await searchParams;
  const wanted = Array.isArray(version) ? version[0] : version;
  const doc = await loadAgreement(wanted?.trim() || undefined);

  return (
    <main className="w-full min-w-0 bg-accent px-4 py-10 dark:bg-background">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href={AUTH_ROUTES.signup} aria-label="Qlozet">
            <span className="dark:hidden">
              <Logo brown />
            </span>
            <span className="hidden dark:block">
              <Logo white />
            </span>
          </Link>
          <Link
            href={AUTH_ROUTES.signup}
            className="text-sm font-medium text-primary underline underline-offset-2 dark:text-white"
          >
            Back to sign up
          </Link>
        </div>

        <article className="rounded-xl border border-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card md:p-8">
          <header className="mb-6 space-y-1 border-b border-border pb-4">
            <h1 className="text-xl font-bold text-grey-black dark:text-white md:text-2xl">
              Qlozet Vendor Agreement
            </h1>
            {doc && (
              <p className="text-xs text-grey2 dark:text-gray-400">
                Version {doc.version}
                {doc.current
                  ? ' · in force now'
                  : ' · an earlier version, no longer in force'}
              </p>
            )}
            {doc && !doc.current && (
              <Link
                href="/legal/vendor-agreement"
                className="inline-block text-xs font-medium text-primary underline underline-offset-2 dark:text-white"
              >
                Read the version in force
              </Link>
            )}
          </header>

          {doc ? (
            <Markdown content={doc.body} className="text-sm leading-relaxed" />
          ) : (
            <p className="text-sm text-grey2 dark:text-gray-400">
              {wanted
                ? `We could not find version ${wanted} of the agreement.`
                : 'The agreement could not be loaded. Reload the page to try again.'}
            </p>
          )}
        </article>
      </div>
    </main>
  );
}
