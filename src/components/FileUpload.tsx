import React, { useState, useRef } from 'react';
import { Button, Group, Badge, Paper, Text } from '@mantine/core';

interface FileUploadProps {
  onZipUpload: (file: File) => void;
  uploadState: {
    status: 'idle' | 'success' | 'error';
    error: string | null;
    fileName: string | null;
  };
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onZipUpload,
  uploadState,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      onZipUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.endsWith('.zip'));

    if (zipFile) {
      onZipUpload(zipFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Paper
        p="md"
        radius="md"
        style={{
          border: isDragOver ? '2px dashed #228be6' : '2px dashed #e9ecef',
          backgroundColor: isDragOver ? '#f8f9fa' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Group justify="center" align="center">
          <div style={{ textAlign: 'center' }}>
            <Text size="sm" fw={500} mb="xs">
              📁 {isDragOver ? 'Drop ZIP file here' : 'Upload Instagram Data'}
            </Text>
            <Text size="xs" c="dimmed">
              Click to browse or drag & drop your ZIP file
            </Text>
          </div>
        </Group>
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};
