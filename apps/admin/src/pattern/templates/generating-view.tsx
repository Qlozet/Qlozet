'use client';

import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

// The shop studio's wait screen (qlozet-shop components/studio/GeneratingView):
// the steps a tailor would take, moving on a timer. The job reports no real
// progress, so it never claims a percentage, and the last step holds until
// the picture arrives.
const STEPS = {
  new: [
    'Reading your choices',
    'Cutting the pattern',
    'Draping the fabric',
    'Adding the details',
    'Final stitches',
  ],
  refine: [
    'Reading your change',
    'Unpicking the seams',
    'Making your change',
    'Final stitches',
  ],
  back: [
    'Turning it round',
    'Matching the fabric',
    'Drawing the back',
    'Final stitches',
  ],
} as const;
const STEP_MS = 7000;

export type StudioWork = keyof typeof STEPS;

export function GeneratingView({
  kind,
  baseImage,
  summary = [],
}: {
  kind: StudioWork;
  /** The image being changed (refine, back), shown softly behind. */
  baseImage?: string | null;
  /** What's picked, as chips, so the wait shows what's being made. */
  summary?: string[];
}) {
  const steps = STEPS[kind];
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      const elapsed = Date.now() - started;
      setSeconds(Math.floor(elapsed / 1000));
      setStep(Math.min(steps.length - 1, Math.floor(elapsed / STEP_MS)));
    }, 1000);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="absolute inset-0 z-[5] flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
      {baseImage && kind !== 'new' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={baseImage}
          alt=""
          aria-hidden
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain opacity-30 blur-sm"
        />
      )}
      <div
        role="status"
        aria-live="polite"
        className="relative flex max-w-xs flex-col items-center gap-4 px-4 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary motion-safe:animate-[studioSnip_1.4s_ease-in-out_infinite]">
          <Scissors className="size-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-grey-black dark:text-white">
            {steps[step]}…
          </p>
          <p className="mt-1 text-xs text-grey3 tabular-nums dark:text-gray-400">
            {seconds < 60
              ? `${seconds}s · this can take a minute or two`
              : `${Math.floor(seconds / 60)}m ${seconds % 60}s · still working, busy times take longer`}
          </p>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-[18px]' : 'w-1.5',
                i <= step ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
        {kind === 'new' && summary.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {summary.slice(0, 5).map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-grey3 dark:text-gray-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes studioSnip { 0%, 100% { transform: rotate(-8deg) } 50% { transform: rotate(8deg) } }`}</style>
    </div>
  );
}
