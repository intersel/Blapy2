import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { Logger } from '../../src/core/Logger.js'

/**
 * Test suite for the Logger class
 * Tests all logging functionality including different log levels and debug modes
 */
describe('Logger', () => {
  let logger
  let consoleSpy

  // Setup before each test - mock console methods to capture output
  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }
  })

  // Cleanup after each test - restore original console methods
  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Test constructor initialization with various parameter combinations
   */
  describe('Constructor', () => {
    it('should initialize with default values', () => {
      // Test that Logger initializes with expected default values
      logger = new Logger()
      expect(logger.debug).toBe(false)
      expect(logger.logLevel).toBe(3)
      expect(logger.alertError).toBe(false)
    })

    it('should initialize with custom values', () => {
      // Test constructor with custom parameters
      // Note: Current implementation ignores debug and logLevel parameters
      logger = new Logger({
        debug: true,
        logLevel: 1,
        alertError: true
      })
      expect(logger.debug).toBe(false) // Note: constructor hardcodes this to false
      expect(logger.logLevel).toBe(3)  // Note: constructor hardcodes this to 3
      expect(logger.alertError).toBe(true) // This parameter is correctly applied
    })
  })

  /**
   * Test logging behavior when debug mode is disabled (default state)
   * In this mode, only error messages should be displayed due to the condition:
   * if (errorLevel >= 2 && !this.debug) return;
   */
  describe('Logging methods with debug=false (default)', () => {
    beforeEach(() => {
      logger = new Logger()
    })

    it('should log error messages', () => {
      // Error level 1 should always be logged regardless of debug mode
      logger.error('error test', 'LoggerTest')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2] error test from LoggerTest')
    })

    it('should NOT log warning messages when debug=false', () => {
      // Warning level 2 should be blocked when debug=false
      logger.warn('warn test', 'LoggerTest')
      expect(consoleSpy.warn).not.toHaveBeenCalled()
    })

    it('should NOT log info messages when debug=false', () => {
      // Info level 3 should be blocked when debug=false
      logger.info('info test', 'LoggerTest')
      expect(consoleSpy.log).not.toHaveBeenCalled()
    })
  })

  /**
   * Test logging behavior when debug mode is enabled
   * In this mode, all message types should be displayed
   */
  describe('Logging methods with debug=true', () => {
    beforeEach(() => {
      logger = new Logger({ debug: true })
      // Force debug mode since constructor ignores the parameter
      logger.debug = true
    })

    it('should log error messages', () => {
      // Error messages should always work
      logger.error('error test', 'LoggerTest')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2] error test from LoggerTest')
    })

    it('should log warning messages when debug=true', () => {
      // Warning messages should now be displayed with debug enabled
      logger.warn('warn test', 'LoggerTest')
      expect(consoleSpy.warn).toHaveBeenCalledWith('[Blapy2] warn test from LoggerTest')
    })

    it('should log info messages when debug=true', () => {
      // Info messages should now be displayed with debug enabled
      logger.info('info test', 'LoggerTest')
      expect(consoleSpy.log).toHaveBeenCalledWith('[Blapy2] info test from LoggerTest')
    })
  })

  /**
   * Test that default service parameter "blapy" is used when no service is specified
   */
  describe('Default service parameter', () => {
    beforeEach(() => {
      logger = new Logger({ debug: true })
      logger.debug = true // Enable debug to see all message types
    })

    it('should use default service "blapy" for error', () => {
      // When no service parameter is provided, should default to "blapy"
      logger.error('error without service')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2] error without service from blapy')
    })

    it('should use default service "blapy" for warn', () => {
      // When no service parameter is provided, should default to "blapy"
      logger.warn('warn without service')
      expect(consoleSpy.warn).toHaveBeenCalledWith('[Blapy2] warn without service from blapy')
    })

    it('should use default service "blapy" for info', () => {
      // When no service parameter is provided, should default to "blapy"
      logger.info('info without service')
      expect(consoleSpy.log).toHaveBeenCalledWith('[Blapy2] info without service from blapy')
    })
  })

  /**
   * Test the direct log() method with explicit error levels
   * This tests the core logging functionality that all other methods use
   */
  describe('Direct log method', () => {
    beforeEach(() => {
      logger = new Logger({ debug: true })
      logger.debug = true // Enable debug to test all levels
    })

    it('should log error with level 1', () => {
      // Level 1 should use console.error
      logger.log('direct error', 1, 'DirectTest')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2] direct error from DirectTest')
    })

    it('should log warning with level 2', () => {
      // Level 2 should use console.warn
      logger.log('direct warning', 2, 'DirectTest')
      expect(consoleSpy.warn).toHaveBeenCalledWith('[Blapy2] direct warning from DirectTest')
    })

    it('should log info with level 3', () => {
      // Level 3 (and any other level) should use console.log
      logger.log('direct info', 3, 'DirectTest')
      expect(consoleSpy.log).toHaveBeenCalledWith('[Blapy2] direct info from DirectTest')
    })

    it('should use default parameters', () => {
      // Test that default errorLevel=3 and service="blapy" are applied
      logger.log('default params')
      expect(consoleSpy.log).toHaveBeenCalledWith('[Blapy2] default params from blapy')
    })
  })

  /**
   * Test edge cases and unusual input scenarios
   * Ensures the logger handles unexpected inputs gracefully
   */
  describe('Edge cases', () => {
    beforeEach(() => {
      logger = new Logger()
    })

    it('should handle empty message', () => {
      // Test that empty strings are handled without errors
      logger.error('', 'TestService')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2]  from TestService')
    })

    it('should handle undefined service', () => {
      // Test that missing service parameter defaults to "blapy"
      logger.error('test message')
      expect(consoleSpy.error).toHaveBeenCalledWith('[Blapy2] test message from blapy')
    })
  })
})