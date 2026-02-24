export const DEFAULT_API_URL = process.env.LT_API_URL || 'https://api.lazy-tracker.com';
export const CLIENT_ID = 'lazy-tracker-cli';
export const DEFAULT_SCOPES = 'read write:tickets write:chats';

export const POLLING_INTERVAL_MS = 5000;
export const MAX_POLLING_ATTEMPTS = 180;

export const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;
