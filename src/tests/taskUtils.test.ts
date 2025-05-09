
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleError, logEvent, trackUserAction } from '../utils/errorHandler';

// Mock console methods and toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('should handle errors correctly', () => {
    const testError = new Error('Test error');
    handleError(testError, 'User friendly message');
    
    // Check if console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('should log events with different levels', () => {
    logEvent('info', 'Info message');
    logEvent('error', 'Error message');
    logEvent('warning', 'Warning message');
    logEvent('debug', 'Debug message');
    
    expect(console.info).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
  });

  it('should track user actions', () => {
    trackUserAction('task_created', { id: '123' });
    expect(console.info).toHaveBeenCalled();
  });
});
