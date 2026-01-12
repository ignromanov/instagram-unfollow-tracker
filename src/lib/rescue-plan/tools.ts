import { Video, Sparkles, MessageSquare, BarChart3, Palette, Calendar } from 'lucide-react';

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
    priceLabel: '7-day free trial',
    socialProof: '50K+ creators',
    badge: 'popular',
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
    priceLabel: 'Free plan available',
    socialProof: '1M+ posts created',
  },
  manychat: {
    id: 'manychat',
    name: 'ManyChat',
    descKey: 'rescue.tools.manychat',
    icon: MessageSquare,
    url: AFFILIATE_LINKS.manychat,
    color: 'text-green-500',
    category: 'engagement',
    pricing: 'freemium',
    priceLabel: 'Free up to 1K contacts',
    socialProof: '1M+ businesses',
    badge: 'popular',
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
    priceLabel: 'Free plan available',
    socialProof: '200K+ users',
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
    priceLabel: 'Free forever plan',
    socialProof: '10M+ designs created',
  },
  later: {
    id: 'later',
    name: 'Later',
    descKey: 'rescue.tools.later',
    icon: Calendar,
    url: AFFILIATE_LINKS.later,
    color: 'text-pink-500',
    category: 'scheduling',
    pricing: 'trial',
    priceLabel: '14-day free trial',
    socialProof: '7M+ users',
    badge: 'trial',
  },
};

/**
 * Tool selection matrix: maps segment to recommended tools (ordered by priority)
 *
 * Logic:
 * - Critical: Focus on content recovery (viral tools)
 * - Warning: Focus on optimization (analytics + scheduling)
 * - Growth: Focus on scaling (scheduling + design)
 */
const TOOL_MATRIX: Record<SegmentKey, string[]> = {
  // Critical - content recovery focus
  critical_influencer: ['submagic', 'predis', 'manychat'],
  critical_power: ['submagic', 'predis', 'later'],
  critical_regular: ['predis', 'manychat', 'vistacreate'],
  critical_casual: ['vistacreate', 'predis', 'manychat'],

  // Warning - optimization focus
  warning_influencer: ['metricool', 'later', 'submagic'],
  warning_power: ['metricool', 'predis', 'later'],
  warning_regular: ['manychat', 'vistacreate', 'predis'],
  warning_casual: ['vistacreate', 'manychat', 'predis'],

  // Growth - scaling focus
  growth_influencer: ['later', 'metricool', 'submagic'],
  growth_power: ['later', 'predis', 'metricool'],
  growth_regular: ['later', 'vistacreate', 'predis'],
  growth_casual: ['vistacreate', 'later', 'predis'],
};

/** Default tools if segment not found */
const DEFAULT_TOOLS = ['predis', 'vistacreate', 'later'];

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
