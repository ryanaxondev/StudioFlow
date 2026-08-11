export const MAGIC_LINK_EXPIRES_IN_SECONDS = 15 * 60;
export const SESSION_ROLLING_EXPIRES_IN_SECONDS = 14 * 24 * 60 * 60;
export const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;
export const SESSION_ABSOLUTE_EXPIRES_IN_MS = 30 * 24 * 60 * 60 * 1000;

export const ACCESS_REQUEST_RATE_LIMIT = {
  windowSeconds: 60,
  maxAttempts: 5,
} as const;

export const ACCESS_VERIFY_RATE_LIMIT = {
  windowSeconds: 60,
  maxAttempts: 10,
} as const;

export const DEFAULT_AUTHENTICATED_DESTINATION = "/account";
