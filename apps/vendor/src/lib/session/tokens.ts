import { saveCookie } from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY, REFRESH_COOKIE_KEY } from '@/lib/constants';

/** Store the access token (and the refresh token, when one is issued). */
export const storeSessionTokens = (
  accessToken: string,
  refreshToken?: string
) => {
  saveCookie({
    key: SESSION_COOKIE_KEY,
    value: accessToken,
    isObject: false,
  });
  if (refreshToken) {
    saveCookie({
      key: REFRESH_COOKIE_KEY,
      value: refreshToken,
      isObject: false,
    });
  }
};
