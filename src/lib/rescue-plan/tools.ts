import { Video, Sparkles, MessageSquare, BarChart3, Palette, Calendar } from 'lucide-react';

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
    url: 'https://submagic.co/?via=safeunfollow',
    color: 'text-purple-500',
    category: 'content',
  },
  predis: {
    id: 'predis',
    name: 'Predis.ai',
    descKey: 'rescue.tools.predis',
    icon: Sparkles,
    url: 'https://predis.ai/?ref=safeunfollow',
    color: 'text-blue-500',
    category: 'content',
  },
  manychat: {
    id: 'manychat',
    name: 'ManyChat',
    descKey: 'rescue.tools.manychat',
    icon: MessageSquare,
    url: 'https://manychat.com/?ref=safeunfollow',
    color: 'text-green-500',
    category: 'engagement',
  },
  metricool: {
    id: 'metricool',
    name: 'Metricool',
    descKey: 'rescue.tools.metricool',
    icon: BarChart3,
    url: 'https://metricool.com/?ref=safeunfollow',
    color: 'text-orange-500',
    category: 'analytics',
  },
  canva: {
    id: 'canva',
    name: 'Canva Pro',
    descKey: 'rescue.tools.canva',
    icon: Palette,
    url: 'https://partner.canva.com/safeunfollow',
    color: 'text-cyan-500',
    category: 'design',
  },
  later: {
    id: 'later',
    name: 'Later',
    descKey: 'rescue.tools.later',
    icon: Calendar,
    url: 'https://later.com/?ref=safeunfollow',
    color: 'text-pink-500',
    category: 'scheduling',
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
  critical_regular: ['predis', 'manychat', 'canva'],
  critical_casual: ['canva', 'predis', 'manychat'],

  // Warning - optimization focus
  warning_influencer: ['metricool', 'later', 'submagic'],
  warning_power: ['metricool', 'predis', 'later'],
  warning_regular: ['manychat', 'canva', 'predis'],
  warning_casual: ['canva', 'manychat', 'predis'],

  // Growth - scaling focus
  growth_influencer: ['later', 'metricool', 'submagic'],
  growth_power: ['later', 'predis', 'metricool'],
  growth_regular: ['later', 'canva', 'predis'],
  growth_casual: ['canva', 'later', 'predis'],
};

/** Default tools if segment not found */
const DEFAULT_TOOLS = ['predis', 'canva', 'later'];

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
