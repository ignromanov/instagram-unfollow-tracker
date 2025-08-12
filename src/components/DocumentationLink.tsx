import React from 'react';
import { Button } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

interface DocumentationLinkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'filled' | 'outline';
  color?: string;
}

export const DocumentationLink: React.FC<DocumentationLinkProps> = ({
  size = 'xs',
  variant = 'subtle',
  color = 'blue'
}) => {
  const handleClick = () => {
    // Open documentation in new tab
    window.open('https://ignromanov.github.io/instagram-unfollow-tracker/docs/', '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      component="a"
      variant={variant}
      color={color}
      size={size}
      onClick={handleClick}
      title="Open documentation in new tab"
      aria-label="Open documentation in new tab"
      style={{
        fontWeight: 400,
        fontSize: size === 'xs' ? '12px' : undefined,
        padding: size === 'xs' ? '4px 8px' : undefined
      }}
    >
      📚 {size === 'xs' ? 'Docs' : 'Documentation'}
    </Button>
  );
};
