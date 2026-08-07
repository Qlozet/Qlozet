// Tolerant accessors for the signed-in user (GET /users/me).
//
// The response shape isn't documented in Swagger, so these read the most likely
// keys and return null when nothing usable is present — the caller then shows a
// skeleton or a neutral fallback rather than a fabricated name.

import type { CurrentUser } from '@/redux/services/users/users.api-slice';

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** Display name, or null when the API gave us nothing to show. */
export const readUserName = (user?: CurrentUser): string | null => {
  if (!user) return null;

  const composed = [str(user.first_name), str(user.last_name)]
    .filter(Boolean)
    .join(' ');

  return (
    str(user.full_name) ??
    (composed || undefined) ??
    str(user.username) ??
    str(user.email) ??
    null
  );
};

/** Avatar image URL, or null when the user has none. */
export const readUserAvatar = (user?: CurrentUser): string | null => {
  if (!user) return null;
  return (
    str(user.profile_image) ??
    str(user.profileImage) ??
    str(user.avatar) ??
    str(user.image) ??
    null
  );
};

/** Up to two uppercase initials for the avatar fallback. */
export const initialsFrom = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
