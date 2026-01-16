import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLanguageRedirect } from '@/hooks/useLanguageRedirect';
import * as languagesModule from '@/config/languages';

// Mock react-router-dom
const mockLocation = { pathname: '/' };
vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
}));

// Mock store
const mockSetLanguage = vi.fn();
let mockStoreState = {
  language: 'en' as languagesModule.SupportedLanguage,
  setLanguage: mockSetLanguage,
  _hasHydrated: true,
};

vi.mock('@/lib/store', () => ({
  useAppStore: () => mockStoreState,
}));

// Mock detectBrowserLanguage
vi.mock('@/config/languages', async () => {
  const actual = await vi.importActual('@/config/languages');
  return {
    ...actual,
    detectBrowserLanguage: vi.fn(() => 'en'),
  };
});

describe('useLanguageRedirect', () => {
  const originalLocation = window.location;
  let mockHref: string;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLocation.pathname = '/';
    mockStoreState = {
      language: 'en',
      setLanguage: mockSetLanguage,
      _hasHydrated: true,
    };
    mockHref = '';

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        get href() {
          return mockHref;
        },
        set href(value: string) {
          mockHref = value;
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe('hydration', () => {
    it('should not redirect when store is not hydrated', () => {
      mockStoreState._hasHydrated = false;
      mockStoreState.language = 'ru';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('');
    });
  });

  describe('explicit language prefix', () => {
    it('should not redirect when URL has language prefix', () => {
      mockLocation.pathname = '/es/wizard';
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('ru');

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('');
    });

    it('should not redirect when URL is exactly a language path', () => {
      mockLocation.pathname = '/ru';
      mockStoreState.language = 'es';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('');
    });
  });

  describe('first visit - browser language detection', () => {
    it('should detect browser language and redirect on first visit', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('ru');
      mockLocation.pathname = '/wizard';

      renderHook(() => useLanguageRedirect());

      expect(languagesModule.detectBrowserLanguage).toHaveBeenCalled();
      expect(mockHref).toBe('/ru/wizard');
    });

    it('should persist detected language to store on first visit', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('es');
      mockLocation.pathname = '/';

      renderHook(() => useLanguageRedirect());

      expect(mockSetLanguage).toHaveBeenCalledWith('es');
    });

    it('should set localStorage visited key on first visit', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('de');

      renderHook(() => useLanguageRedirect());

      expect(localStorage.getItem('unfollow-radar-visited')).toBe('true');
    });

    it('should not redirect if browser language is English', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('en');
      mockLocation.pathname = '/wizard';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('');
    });

    it('should not update store if detected language matches current', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('en');
      mockStoreState.language = 'en';

      renderHook(() => useLanguageRedirect());

      expect(mockSetLanguage).not.toHaveBeenCalled();
    });
  });

  describe('returning user - stored preference', () => {
    beforeEach(() => {
      localStorage.setItem('unfollow-radar-visited', 'true');
    });

    it('should use stored language preference for returning user', () => {
      mockStoreState.language = 'ru';
      mockLocation.pathname = '/upload';

      renderHook(() => useLanguageRedirect());

      expect(languagesModule.detectBrowserLanguage).not.toHaveBeenCalled();
      expect(mockHref).toBe('/ru/upload');
    });

    it('should not redirect if stored language is English', () => {
      mockStoreState.language = 'en';
      mockLocation.pathname = '/wizard';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('');
    });

    it('should redirect to correct path with stored language', () => {
      mockStoreState.language = 'ja';
      mockLocation.pathname = '/results';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('/ja/results');
    });
  });

  describe('edge cases', () => {
    it('should handle root path correctly', () => {
      vi.mocked(languagesModule.detectBrowserLanguage).mockReturnValue('fr');
      mockLocation.pathname = '/';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('/fr/');
    });

    it('should handle nested paths correctly', () => {
      localStorage.setItem('unfollow-radar-visited', 'true');
      mockStoreState.language = 'de';
      mockLocation.pathname = '/wizard/step/3';

      renderHook(() => useLanguageRedirect());

      expect(mockHref).toBe('/de/wizard/step/3');
    });
  });
});
