/**
 * Pages a walk-in opens on their own phone (door QR, ticket, customer card,
 * a stylist's work) and the salon TV.
 * Nothing on them may ever send the guest to /login, even when the phone
 * still holds an old staff login cookie.
 */
const PUBLIC_PREFIXES = ['/huduma/', '/foleni/', '/tiketi/', '/kadi/', '/tv/', '/mhudumu/'];

export function isPublicPath(path?: string): boolean {
  let p = path;
  if (p === undefined) {
    try {
      p = globalThis.location?.pathname ?? '';
    } catch {
      p = '';
    }
  }
  return PUBLIC_PREFIXES.some((prefix) => (p ?? '').startsWith(prefix));
}
