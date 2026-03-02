import { describe, it, expect } from 'vitest';
import { logger, createLogger } from './logger.js';

describe('logger', () => {
  it('exports a winston logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('createLogger returns a child logger with context', () => {
    const child = createLogger('test-context');
    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });
});
