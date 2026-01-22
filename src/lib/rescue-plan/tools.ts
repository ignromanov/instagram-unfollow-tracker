import { Video, BarChart3, Palette } from 'lucide-react';
// TODO: Uncomment when affiliate programs approve
// import { Sparkles, MessageSquare, Calendar } from 'lucide-react';

import { AFFILIATE_LINKS } from '@/config/affiliate-links';
import type { RescueTool, UserSegment, SegmentKey } from './types';
import { getSegmentKey } from './segmentation';

/**
 * Tool Definitions and Selection Matrix
 *
 * Configures affiliate tools and maps user segments to recommended tools.
 */

/** All available rescue tools */
export const RESCUE_TOOLS: Record<string, RescueTool> = {
  submagic: {
    id: 'submagic',
    name: 'Submagic',
    descKey: 'rescue.tools.submagic',
    icon: Video,
    url: AFFILIATE_LINKS.submagic,
    color: 'text-purple-500',
    category: 'content',
    pricing: 'trial',
    priceKey: 'rescue.price.freeTrial7',
    socialKey: 'rescue.social.creators50k',
    badge: 'trial', // Matches pricing model
  },
  metricool: {
    id: 'metricool',
    name: 'Metricool',
    descKey: 'rescue.tools.metricool',
    icon: BarChart3,
    url: AFFILIATE_LINKS.metricool,
    color: 'text-orange-500',
    category: 'analytics',
    pricing: 'freemium',
    priceKey: 'rescue.price.freePlan',
    socialKey: 'rescue.social.users200k',
    // No badge - "Free Plan" already shown in trust signals
  },
  vistacreate: {
    id: 'vistacreate',
    name: 'VistaCreate',
    descKey: 'rescue.tools.vistacreate',
    icon: Palette,
    url: AFFILIATE_LINKS.vistacreate,
    color: 'text-cyan-500',
    category: 'design',
    pricing: 'freemium',
    priceKey: 'rescue.price.freeForever',
    socialKey: 'rescue.social.designs10m',
    badge: 'new',
  },
  // TODO: Uncomment when affiliate programs approve
  // predis: {
  //   id: 'predis',
  //   name: 'Predis.ai',
  //   descKey: 'rescue.tools.predis',
  //   icon: Sparkles,
  //   url: AFFILIATE_LINKS.predis,
  //   color: 'text-blue-500',
  //   category: 'content',
  //   pricing: 'freemium',
  //   priceKey: 'rescue.price.freePlan',
  //   socialKey: 'rescue.social.posts1m',
  // },
  // manychat: {
  //   id: 'manychat',
  //   name: 'ManyChat',
  //   descKey: 'rescue.tools.manychat',
  //   icon: MessageSquare,
  //   url: AFFILIATE_LINKS.manychat,
  //   color: 'text-green-500',
  //   category: 'engagement',
  //   pricing: 'freemium',
  //   priceKey: 'rescue.price.freeContacts',
  //   socialKey: 'rescue.social.businesses1m',
  //   badge: 'popular',
  // },
  // vistacreate: {
  //   id: 'vistacreate',
  //   name: 'VistaCreate',
  //   descKey: 'rescue.tools.vistacreate',
  //   icon: Palette,
  //   url: AFFILIATE_LINKS.vistacreate,
  //   color: 'text-cyan-500',
  //   category: 'design',
  //   pricing: 'freemium',
  //   priceKey: 'rescue.price.freeForever',
  //   socialKey: 'rescue.social.designs10m',
  // },
  // later: {
  //   id: 'later',
  //   name: 'Later',
  //   descKey: 'rescue.tools.later',
  //   icon: Calendar,
  //   url: AFFILIATE_LINKS.later,
  //   color: 'text-pink-500',
  //   category: 'scheduling',
  //   pricing: 'trial',
  //   priceKey: 'rescue.price.freeTrial14',
  //   socialKey: 'rescue.social.users7m',
  //   badge: 'trial',
  // },
};

/**
 * Tool selection matrix: maps segment to recommended tools (ordered by priority)
 *
 * Logic:
 * - Critical: Focus on content recovery (submagic for viral content)
 * - Warning: Focus on optimization (metricool for analytics)
 * - Growth: Focus on scaling (balanced approach)
 */
const TOOL_MATRIX: Record<SegmentKey, string[]> = {
  // Critical - content recovery focus (submagic first for viral content)
  critical_influencer: ['submagic', 'vistacreate', 'metricool'],
  critical_power: ['submagic', 'vistacreate', 'metricool'],
  critical_regular: ['vistacreate', 'submagic', 'metricool'],
  critical_casual: ['vistacreate', 'submagic', 'metricool'],

  // Warning - optimization focus (metricool first for analytics)
  warning_influencer: ['metricool', 'vistacreate', 'submagic'],
  warning_power: ['metricool', 'vistacreate', 'submagic'],
  warning_regular: ['vistacreate', 'metricool', 'submagic'],
  warning_casual: ['vistacreate', 'metricool', 'submagic'],

  // Growth - scaling focus (metricool first for growth tracking)
  growth_influencer: ['metricool', 'vistacreate', 'submagic'],
  growth_power: ['metricool', 'vistacreate', 'submagic'],
  growth_regular: ['vistacreate', 'metricool', 'submagic'],
  growth_casual: ['vistacreate', 'submagic', 'metricool'],
};

/** Default tools if segment not found */
const DEFAULT_TOOLS = ['vistacreate', 'metricool', 'submagic'];

/**
 * Get recommended tools for a user segment
 */
export function getToolsForSegment(segment: UserSegment): RescueTool[] {
  const key = getSegmentKey(segment);
  const toolIds = TOOL_MATRIX[key] ?? DEFAULT_TOOLS;
  return toolIds
    .map(id => RESCUE_TOOLS[id])
    .filter((tool): tool is RescueTool => tool !== undefined);
}

/**
 * Get all available tools (for testing/debugging)
 */
export function getAllTools(): RescueTool[] {
  return Object.values(RESCUE_TOOLS);
}
