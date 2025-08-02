import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
