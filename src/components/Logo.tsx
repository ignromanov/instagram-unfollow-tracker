'use client';

import type { LogoProps } from '@/types/components';

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <img
      src="/instagram-unfollow-tracker/logo.svg"
      alt="Instagram Unfollow Tracker Logo"
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
