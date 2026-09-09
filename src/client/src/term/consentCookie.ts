import { TERMS_VERSION } from "./disclaimerFallback.ts";

export const CONSENT_COOKIE_NAME = "boreholes_consent";

const CONSENT_SCHEMA_VERSION = 2;
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const ANONYMOUS_SUBJECT = "anonymous";

interface Consent {
  analytics: boolean;
}

/**
 * Derives the cookie's subject key from an OIDC subject id, or from the anonymous placeholder when
 * nobody is signed in.
 */
const toSubjectKey = (subject: string | undefined): string => {
  let hash = 2166136261;
  const value = subject ?? ANONYMOUS_SUBJECT;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

/**
 * Builds the cookie value recording that the given subject accepted the current terms.
 * Exposed so end-to-end tests can seed a consent that the application accepts.
 */
export const buildConsentCookieValue = (subject: string | undefined, analytics: boolean): string => {
  const consent = {
    v: CONSENT_SCHEMA_VERSION,
    terms: TERMS_VERSION,
    subject: toSubjectKey(subject),
    analytics,
  };
  return encodeURIComponent(JSON.stringify(consent));
};

/**
 * Reads the consent stored for the given subject. Returns null whenever the disclaimer has to be
 * shown again: no cookie, a cookie written by an older application version, terms that changed
 * since, or a consent given by a different user of the same browser.
 */
export const readConsent = (subject: string | undefined): Consent | null => {
  const match = document.cookie.split("; ").find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match.slice(CONSENT_COOKIE_NAME.length + 1)));
    if (parsed?.v !== CONSENT_SCHEMA_VERSION) return null;
    if (parsed?.terms !== TERMS_VERSION) return null;
    if (parsed?.subject !== toSubjectKey(subject)) return null;
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
};

export const writeConsent = (subject: string | undefined, analytics: boolean): void => {
  const secure = globalThis.location.protocol === "https:" ? "; Secure" : "";
  const value = buildConsentCookieValue(subject, analytics);
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};
