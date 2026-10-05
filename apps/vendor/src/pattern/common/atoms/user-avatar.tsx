'use client';

// User Avatar — Atom
// The signed-in user's picture, used by the header button and the profile
// sheet. Shows the picture when there is a real one, and the initial when
// there isn't — or when the URL fails to load.

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { box: 'size-8', text: 'text-xs', px: '32px' },
  md: { box: 'size-10', text: 'text-sm', px: '40px' },
  xl: { box: 'size-40', text: 'text-5xl', px: '160px' },
} as const;

/**
 * The User schema defaults profile_picture to a hard-coded Google-cached
 * stock photo, so "has a value" is not the same as "has a picture" — every
 * user who never uploaded one carries the same stranger's face. Treat that
 * host as absent and fall through to the initial, which at least belongs to
 * the person.
 */
const PLACEHOLDER_HOSTS = ['encrypted-tbn0.gstatic.com'];

export const isRealAvatar = (src?: string | null): boolean => {
  const value = src?.trim();
  if (!value) return false;
  return !PLACEHOLDER_HOSTS.some((host) => value.includes(host));
};

interface UserAvatarProps {
  /** The user's own picture (User.profile_picture). */
  src?: string | null;
  /** Used for the initial and the alt text. */
  name?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const { box, text, px } = SIZES[size];

  const showImage = isRealAvatar(src) && !failed;
  const initial = (name ?? '').trim().charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        showImage
          ? 'bg-gray-100 dark:bg-muted'
          : 'bg-[hsla(0,0%,92%,1)] dark:bg-muted',
        box,
        className
      )}
    >
      {showImage ? (
        <Image
          src={(src as string).trim()}
          alt={name ? `${name}'s profile picture` : 'Profile picture'}
          fill
          sizes={px}
          className="object-cover"
          // Pictures live on whichever host the backend stored them on. The
          // image optimizer rejects any host missing from next.config's
          // remotePatterns and then silently renders nothing, so serve these
          // directly — they are avatar-sized and the loss is nil.
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            'flex size-full items-center justify-center font-bold text-gray-500 dark:text-gray-300',
            text
          )}
        >
          {initial}
        </span>
      )}
    </div>
  );
};
