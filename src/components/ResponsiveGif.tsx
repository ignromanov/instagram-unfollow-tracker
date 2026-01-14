/**
 * ResponsiveGif component
 * Serves optimized GIF sizes based on device viewport
 * - 400w for mobile (≤640px) - 69% smaller
 * - 600w for desktop (>640px) - 40% smaller
 */

interface ResponsiveGifProps {
  /** Base path without size suffix (e.g., '/wizard/step-1') */
  basePath: string;
  /** Alt text for accessibility */
  alt: string;
  /** CSS class name */
  className?: string;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
}

export function ResponsiveGif({
  basePath,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: ResponsiveGifProps) {
  return (
    <picture>
      {/* Mobile: 400×300 for screens ≤640px */}
      <source media="(max-width: 640px)" srcSet={`${basePath}-400w.gif`} />

      {/* Desktop/Tablet: 600×450 for screens >640px */}
      <source media="(min-width: 641px)" srcSet={`${basePath}-600w.gif`} />

      {/* Fallback: 600w for browsers without <picture> support */}
      <img
        src={`${basePath}-600w.gif`}
        alt={alt}
        width={600}
        height={450}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}
