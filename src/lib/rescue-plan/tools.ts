import { Video, BarChart3, Palette, Sparkles } from 'lucide-react';

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
    // No badge - "Free forever" in trust signals is sufficient
  },
  predis: {
    id: 'predis',
    name: 'Predis.ai',
    descKey: 'rescue.tools.predis',
    icon: Sparkles,
    url: AFFILIATE_LINKS.predis,
    color: 'text-blue-500',
    category: 'content',
    pricing: 'freemium',
    priceKey: 'rescue.price.freePlan',
    socialKey: 'rescue.social.posts1m',
    badge: 'popular', // AI content generation is trending
  },
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
 * - Critical: Focus on content recovery (predis/submagic for fast content)
 * - Warning: Focus on optimization (metricool for analytics)
 * - Growth: Focus on scaling (balanced approach)
 *
 * Predis.ai positioning:
 * - Best for users who need to create content quickly (AI-powered)
 * - Complements Submagic (video) with posts/carousels
 * - Strong for critical/warning where content velocity matters
 */
const TOOL_MATRIX: Record<SegmentKey, string[]> = {
  // Critical - content recovery focus (AI content first for fast recovery)
  critical_influencer: ['predis', 'submagic', 'metricool'],
  critical_power: ['predis', 'submagic', 'metricool'],
  critical_regular: ['predis', 'vistacreate', 'metricool'],
  critical_casual: ['vistacreate', 'predis', 'metricool'],

  // Warning - optimization focus (analytics + content balance)
  warning_influencer: ['metricool', 'predis', 'submagic'],
  warning_power: ['metricool', 'predis', 'submagic'],
  warning_regular: ['predis', 'metricool', 'vistacreate'],
  warning_casual: ['vistacreate', 'predis', 'metricool'],

  // Growth - scaling focus (AI content for consistent posting)
  growth_influencer: ['metricool', 'predis', 'submagic'],
  growth_power: ['predis', 'metricool', 'submagic'],
  growth_regular: ['predis', 'vistacreate', 'metricool'],
  growth_casual: ['vistacreate', 'predis', 'metricool'],
};

/** Default tools if segment not found */
const DEFAULT_TOOLS = ['predis', 'metricool', 'vistacreate'];

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
