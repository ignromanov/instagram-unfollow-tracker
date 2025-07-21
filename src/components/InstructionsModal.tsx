import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Stepper,
  Alert,
  Text,
  Group,
  Stack,
  Badge,
  Divider,
  Title,
  Paper,
  Anchor
} from '@mantine/core';
import { INSTRUCTIONS_DATA } from '@/data/instructionsData';
import type { InstructionTab } from '@/types/instructions';

// Helper function to render text with clickable links
const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <Anchor
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          {part}
        </Anchor>
      );
    }
    return part;
  });
};

interface InstructionsModalProps {
  opened: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ opened, onClose }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={600}>📥 How to Download Your Instagram Data</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Tabs defaultValue="web" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="web">
            Step-by-Step Guide
          </Tabs.Tab>
          <Tabs.Tab value="notes">
            Important Notes
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="web" pt="md">
          <Stack gap="md">
            <Alert color="blue" variant="light">
              <Text size="sm">
                Follow these steps to download your Instagram data using Meta Accounts Center.
              </Text>
            </Alert>

            <Stepper
              orientation="vertical"
              size="sm"
              active={0}
              allowNextStepsSelect={true}
            >
              {INSTRUCTIONS_DATA.web.map((step, index) => (
                <Stepper.Step
                  key={step.number}
                  label={
                    <Group gap="xs">
                      <Text fw={500}>
                        {step.number === 1 ? (
                          <>
                            {step.title} - {renderTextWithLinks('https://accountscenter.instagram.com/')}
                          </>
                        ) : (
                          step.title
                        )}
                      </Text>
                      <Badge size="xs" variant="light" color="blue">
                        {step.icon}
                      </Badge>
                    </Group>
                  }
                  description={`${step.description}. ${step.details}`}
                />
              ))}
            </Stepper>
          </Stack>
        </Tabs.Panel>


        <Tabs.Panel value="notes" pt="md">
          <Stack gap="md">
            <Alert color="yellow" variant="light">
              <Text size="sm">
                Important information about downloading and using your Instagram data.
              </Text>
            </Alert>

            {INSTRUCTIONS_DATA.notes.map((note, index) => (
              <Alert
                key={index}
                color={note.type === 'warning' ? 'yellow' : note.type === 'success' ? 'green' : 'blue'}
                variant="light"
                icon={note.icon}
              >
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    {note.title}
                  </Text>
                  <Text size="sm">
                    {note.content}
                  </Text>
                </Stack>
              </Alert>
            ))}

            <Divider />

            <Paper p="md" bg="blue.0" radius="md">
              <Stack gap="xs">
                <Title order={5} c="blue">
                  Pro Tip
                </Title>
                <Text size="sm">
                  After downloading your data, extract the ZIP file and look for the folder
                  <Text component="span" fw={500} c="blue"> connections/followers_and_following/</Text>.
                  This folder contains the JSON files with your followers and following lists.
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};
