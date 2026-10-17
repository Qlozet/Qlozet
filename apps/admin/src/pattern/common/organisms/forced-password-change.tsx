'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { removeCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';
import { AUTH_ROUTES } from '@/lib/routes';
import { readApiError } from '@/redux/services/types';
import { useChangePasswordMutation } from '@/redux/services/auth/auth.api-slice';

const MIN_LENGTH = 8;

interface ForcedPasswordChangeProps {
  /** Called once the new password is saved, so the console can load. */
  onChanged: () => void;
}

/**
 * Shown instead of the console while an administrator is still on the
 * temporary password they were emailed. The API refuses everything but the
 * password routes until it is changed, so there is nothing else to show.
 */
export const ForcedPasswordChange = ({
  onChanged,
}: ForcedPasswordChangeProps) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const tooShort = next.length > 0 && next.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== next;
  const sameAsOld = next.length > 0 && next === current;
  const ready =
    current.length > 0 &&
    next.length >= MIN_LENGTH &&
    confirm === next &&
    !sameAsOld;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    try {
      await changePassword({
        current_password: current,
        new_password: next,
      }).unwrap();
      toast.success('Password set. Welcome to the console.');
      onChanged();
    } catch (error) {
      toast.error(readApiError(error, 'The password could not be changed.'));
    }
  };

  const signOut = () => {
    removeCookie(SESSION_COOKIE_KEY);
    window.location.replace(AUTH_ROUTES.signIn);
  };

  const type = show ? 'text' : 'password';

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center py-10">
      <div className="rounded-2xl bg-white p-6 custom-card-shadow dark:bg-card sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-[hsla(210,9%,31%,1)] dark:text-white">
              Set your password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You signed in with a temporary password. Choose your own before
              you continue.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="current-password"
              className="text-sm font-medium text-grey-black dark:text-white"
            >
              Temporary password
            </label>
            <Input
              id="current-password"
              type={type}
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="text-sm font-medium text-grey-black dark:text-white"
            >
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={type}
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="pr-11"
                aria-invalid={tooShort || sameAsOld}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide passwords' : 'Show passwords'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-grey3 transition-colors hover:text-grey-black dark:text-gray-400 dark:hover:text-white"
              >
                {show ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p
              className={
                tooShort || sameAsOld
                  ? 'text-xs text-destructive'
                  : 'text-xs text-gray-500 dark:text-gray-400'
              }
            >
              {sameAsOld
                ? 'Choose a password different from the temporary one.'
                : `At least ${MIN_LENGTH} characters.`}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium text-grey-black dark:text-white"
            >
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type={type}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={mismatch}
            />
            {mismatch && (
              <p className="text-xs text-destructive">
                The passwords do not match.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!ready || isLoading}
            className="h-11 w-full"
          >
            {isLoading ? 'Saving…' : 'Save password and continue'}
          </Button>
        </form>

        <button
          type="button"
          onClick={signOut}
          className="mt-4 w-full cursor-pointer text-center text-sm text-gray-500 hover:text-grey-black dark:text-gray-400 dark:hover:text-white"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
};
