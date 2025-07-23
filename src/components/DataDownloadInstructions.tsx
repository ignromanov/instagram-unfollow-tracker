import React from 'react';
import { Button, Group, Alert, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { InstructionsModal } from './InstructionsModal';

interface DataDownloadInstructionsProps {
  variant?: 'button' | 'alert';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showInEmptyState?: boolean;
}

export const DataDownloadInstructions: React.FC<DataDownloadInstructionsProps> = ({
  variant = 'button',
  size = 'sm',
  showInEmptyState = false
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  if (variant === 'alert' && showInEmptyState) {
    return (
      <>
        <Alert
          color="blue"
          variant="light"
          icon="📥"
          title="Get Started with Instagram Data"
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              To analyze your Instagram connections, you need to download your data from Instagram first.
            </Text>
            <Group gap="md" align="center">
              <Button
                variant="filled"
                color="blue"
                size="sm"
                onClick={open}
                style={{ fontWeight: 500 }}
              >
                📖 View Step-by-Step Guide
              </Button>
              <Text size="xs" c="dimmed">
                Takes 2-3 minutes
              </Text>
            </Group>
          </Stack>
        </Alert>
        <InstructionsModal opened={opened} onClose={close} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="subtle"
        color="blue"
        size={size}
        onClick={open}
        title="How to download Instagram data"
        style={{
          fontWeight: 400,
          fontSize: size === 'xs' ? '12px' : undefined,
          padding: size === 'xs' ? '4px 8px' : undefined
        }}
      >
        ❓ {size === 'xs' ? 'Help' : 'How to get data?'}
      </Button>
      <InstructionsModal opened={opened} onClose={close} />
    </>
  );
};
