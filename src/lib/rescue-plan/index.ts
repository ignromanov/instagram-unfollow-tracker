/**
 * Rescue Plan Module
 *
 * Monetization system for segmented affiliate banners.
 * Shows relevant tools based on user's account health and size.
 */

// Types
export type {
  LossSeverity,
  AccountSize,
  ToolCategory,
  UserSegment,
  RescueTool,
  SegmentKey,
  SeverityStyle,
} from './types';

// Segmentation
export {
  computeSeverity,
  computeSize,
  computeSegment,
  getSegmentKey,
  SEVERITY_STYLES,
} from './segmentation';

// Tools
export { RESCUE_TOOLS, getToolsForSegment, getAllTools } from './tools';
