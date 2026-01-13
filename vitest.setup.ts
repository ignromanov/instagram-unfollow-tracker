import '@testing-library/jest-dom';
import '@vitest/web-worker';

// Import modular mocks
import { setupI18nMocks } from './vitest/i18n-mock';
import { setupBrowserMocks } from './vitest/browser-mocks';
import { setupFileMock } from './vitest/file-mock';
import { setupStorageMocks } from './vitest/storage-mock';

// Setup all mocks
setupI18nMocks();
setupBrowserMocks();
setupFileMock();
setupStorageMocks();

// Note: Worker is now provided by @vitest/web-worker for realistic testing
