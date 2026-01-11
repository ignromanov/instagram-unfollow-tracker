import './locales'; // Initialize i18n before React renders
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import './styles.css';

/**
 * SSG Entry Point
 *
 * ViteReactSSG handles:
 * - Static site generation at build time
 * - Client-side hydration
 * - React Router integration
 *
 * Routes are prerendered based on routes.tsx configuration
 * ThemeProvider is applied in Layout component
 */
export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
  },
  ({ isClient }) => {
    // Client-side only initialization
    if (isClient) {
      // Any client-specific setup can go here
    }
  }
);
