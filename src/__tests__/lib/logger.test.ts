import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('in development mode', () => {
    beforeEach(() => {
      // In Vitest, import.meta.env.DEV is true by default
      vi.stubEnv('DEV', true);
    });

    it('should log error messages with [App] prefix', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Test error', { code: 500 });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Test error', { code: 500 });
    });

    it('should log warn messages with [App] prefix', async () => {
      const { logger } = await import('@/lib/logger');
      logger.warn('Test warning', { level: 'high' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('[App]', 'Test warning', { level: 'high' });
    });

    it('should log info messages with [App] prefix', async () => {
      const { logger } = await import('@/lib/logger');
      logger.info('Test info', { status: 'ok' });

      expect(consoleLogSpy).toHaveBeenCalledWith('[App]', 'Test info', { status: 'ok' });
    });

    it('should log debug messages with [App] prefix', async () => {
      const { logger } = await import('@/lib/logger');
      logger.debug('Test debug', { trace: true });

      expect(consoleDebugSpy).toHaveBeenCalledWith('[App]', 'Test debug', { trace: true });
    });

    it('should handle multiple arguments', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Error:', 'Multiple', 'Arguments', 123, { foo: 'bar' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[App]',
        'Error:',
        'Multiple',
        'Arguments',
        123,
        { foo: 'bar' }
      );
    });

    it('should handle no arguments', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error();

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]');
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false);
      // Need to clear module cache to reload logger with new env
      vi.resetModules();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    it('should always log error messages in production', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Production error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Production error');
    });

    it('should NOT log warn messages in production', async () => {
      const { logger } = await import('@/lib/logger');
      logger.warn('Production warning');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should NOT log info messages in production', async () => {
      const { logger } = await import('@/lib/logger');
      logger.info('Production info');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should NOT log debug messages in production', async () => {
      const { logger } = await import('@/lib/logger');
      logger.debug('Production debug');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should handle error with multiple arguments in production', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Critical error:', { code: 500, message: 'Server error' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Critical error:', {
        code: 500,
        message: 'Server error',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined arguments', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Error:', null, undefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Error:', null, undefined);
    });

    it('should handle Error objects', async () => {
      const { logger } = await import('@/lib/logger');
      const error = new Error('Test error');
      logger.error('Caught error:', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Caught error:', error);
    });

    it('should handle circular references in objects', async () => {
      const { logger } = await import('@/lib/logger');
      const circular: any = { name: 'test' };
      circular.self = circular;

      logger.error('Circular:', circular);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Circular:', circular);
    });

    it('should handle arrays', async () => {
      const { logger } = await import('@/lib/logger');
      logger.error('Array:', [1, 2, 3]);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Array:', [1, 2, 3]);
    });

    it('should handle nested objects', async () => {
      const { logger } = await import('@/lib/logger');
      const nested = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      logger.error('Nested:', nested);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[App]', 'Nested:', nested);
    });
  });
});
