/**
 * The store routes answer 403 with one of these messages when the person can
 * no longer work in the store they have open. Unlike a plain "your role can't
 * do that" 403, each needs the session steered somewhere else:
 *
 * - `set-password`: still on the temporary password from their invite, so
 *   every store route is closed until they choose their own.
 * - `revoked`: the owner turned their access off, or removed them from the
 *   team. Another store they belong to may still be open to them.
 */
export type AccessLoss = 'set-password' | 'revoked';

const ACCESS_LOSS_MESSAGES: ReadonlyArray<[RegExp, AccessLoss]> = [
  [/set your own password before using the store/i, 'set-password'],
  [/store owner has turned off your access to this store/i, 'revoked'],
  [/you are not a member of this business team/i, 'revoked'],
];

/** Which access loss a failed request reports, or null for anything else. */
export const classifyAccessLoss = (
  status: unknown,
  message: string | null | undefined
): AccessLoss | null => {
  if (status !== 403 || !message) return null;
  for (const [pattern, kind] of ACCESS_LOSS_MESSAGES) {
    if (pattern.test(message)) return kind;
  }
  return null;
};

/**
 * One access loss is handled per episode: a page fires several requests at
 * once and each comes back with the same 403, but the person should see one
 * toast and one redirect. The guard is cleared once they're somewhere that
 * works again (switched store, set their password).
 */
let handlingAccessLoss = false;

export const beginAccessLossHandling = (): boolean => {
  if (handlingAccessLoss) return false;
  handlingAccessLoss = true;
  return true;
};

export const resetAccessLossGuard = (): void => {
  handlingAccessLoss = false;
};
