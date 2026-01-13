import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

/**
 * Custom render function that wraps components with MemoryRouter
 * Use this for components that use react-router hooks (useLocation, useNavigate, etc.)
 *
 * Note: Using MemoryRouter instead of createMemoryRouter to avoid AbortSignal issues in jsdom.
 * Future flags are passed to MemoryRouter to prepare for React Router v7.
 */
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
