'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, ScanFace, Smartphone } from 'lucide-react';
import { readApiError } from '@/redux/services/types';
import {
  useStartVerificationSessionMutation,
  useGetVerificationQuery,
} from '@/redux/services/verification/verification.api-slice';

const SDK_SRC = 'https://dashboard.qoreid.com/qoreid-sdk/qoreid.js';

declare global {
  interface Window {
    QoreIdSDK?: {
      init: (options: Record<string, unknown>) => void;
    };
  }
}

/** Load the SDK once, and reuse it on later attempts. */
const loadSdk = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.QoreIdSDK) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('sdk')));
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('sdk'));
    document.body.appendChild(script);
  });

/**
 * A rough read on whether this device can realistically pass a liveness check.
 *
 * Not a hard gate — a desktop with a decent webcam is fine, and we cannot
 * tell a good camera from a bad one. It only decides whether to lead with
 * "do this on your phone", which is advice worth giving: laptop cameras are
 * low-resolution and badly lit, liveness fails on them far more often, and
 * every failed run is billed.
 */
const looksLikeAPhone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(pointer: coarse)').matches === true &&
    window.innerWidth < 900
  );
};

export const QoreIdSessionCard = ({
  canStart,
  attemptsLeft,
}: {
  canStart: boolean;
  attemptsLeft: number;
}) => {
  const [startSession, { isLoading: isStarting }] =
    useStartVerificationSessionMutation();
  const { refetch } = useGetVerificationQuery();

  const [running, setRunning] = useState(false);
  const [onPhone, setOnPhone] = useState(false);
  // Avoids a setState after the SDK closes on an unmounted card.
  const mounted = useRef(true);

  useEffect(() => {
    setOnPhone(looksLikeAPhone());
    return () => {
      mounted.current = false;
    };
  }, []);

  const begin = useCallback(async () => {
    try {
      setRunning(true);
      // Mint first: a session that fails to mint should never open an empty
      // modal, and the attempt is only spent once the backend says so.
      const session = await startSession().unwrap();
      const token = session?.data?.sdk_token;
      const reference = session?.data?.reference;

      if (!token) {
        toast.error('Verification could not be started. Try again shortly.');
        setRunning(false);
        return;
      }

      await loadSdk();

      window.QoreIdSDK?.init({
        token,
        customerReference: reference,
        submittedEventTrigger: () => {
          toast.success('Submitted — checking your results.');
          // Results arrive by webhook, not from the browser, so the page has
          // to ask the server rather than trust what the SDK just told it.
          refetch();
        },
        closedEventTrigger: () => {
          if (mounted.current) setRunning(false);
          refetch();
        },
        errorEventTrigger: () => {
          if (mounted.current) setRunning(false);
          toast.error('Verification could not be completed. Try again.');
        },
      });
    } catch (error) {
      setRunning(false);
      toast.error(readApiError(error, 'Could not start verification.'));
    }
  }, [startSession, refetch]);

  const busy = isStarting || running;

  return (
    <div className="space-y-4">
      {!onPhone && (
        <div className="flex items-start gap-3 rounded-lg bg-[#F8F9FA] p-3 dark:bg-muted/60">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-brown3" />
          <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
            <span className="font-semibold">Use your phone for this.</span> You
            will be asked to photograph your ID and take a short video of your
            face. Phone cameras pass first time far more often than laptop ones
            — open the Qlozet vendor app on your phone, come back to this page,
            and tap Start. You can continue here if this computer has a good
            camera.
          </p>
        </div>
      )}

      <ul className="space-y-1.5 text-xs text-grey2 dark:text-gray-400">
        <li>• A short video of your face, taken now</li>
        <li>• Your virtual NIN or your Nigerian passport</li>
        <li>• Your CAC registration (RC/BN) number</li>
        <li>• Your payout account, which we check against your name</li>
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={!canStart || busy}
          onClick={begin}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ScanFace className="size-4" />
          )}
          {busy ? 'Opening…' : 'Start verification'}
        </button>

        {/* Say why it is disabled rather than leaving a grey button. */}
        {!canStart && attemptsLeft <= 0 && (
          <span className="text-xs text-grey2 dark:text-gray-400">
            You have used your attempt. Contact support if you need another.
          </span>
        )}
        {!canStart && attemptsLeft > 0 && (
          <span className="text-xs text-grey2 dark:text-gray-400">
            Accept the agreement below first.
          </span>
        )}
      </div>

      <p className="text-xs leading-relaxed text-grey2 dark:text-gray-400">
        Your documents and the video are handled by our identity provider and
        never reach Qlozet. We keep the result, not the images.
      </p>
    </div>
  );
};
