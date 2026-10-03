export const NICK_PATTERN = /^[a-z0-9_]{3,32}$/;

export function normalizeNick(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
