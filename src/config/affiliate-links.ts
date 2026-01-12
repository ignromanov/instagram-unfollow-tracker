/**
 * Affiliate Links Configuration
 *
 * Centralized storage for all affiliate URLs.
 * Update this file when registering with new affiliate programs.
 */

export const AFFILIATE_LINKS = {
  /** Submagic - AI video editing for Reels */
  submagic: 'https://submagic.co/?via=safeunfollow',

  /** Predis.ai - AI content generation */
  predis: 'https://predis.ai/?ref=safeunfollow',

  /** ManyChat - Instagram DM automation */
  manychat: 'https://manychat.com/?ref=safeunfollow',

  /** Metricool - Analytics and scheduling */
  metricool: 'https://f.mtr.cool/CHZTJD',

  /** VistaCreate - Design tool (ex-Crello) */
  vistacreate: 'https://create.vista.com/?ref=safeunfollow',

  /** Later - Social media scheduling */
  later: 'https://later.com/?ref=safeunfollow',
} as const;

export type AffiliateToolId = keyof typeof AFFILIATE_LINKS;
