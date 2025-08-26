'use client';

import type React from 'react';
import type { LogoProps } from '@/types/components';

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <img
      src="favicon.svg"
      alt="Instagram Unfollow Tracker Logo"
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
