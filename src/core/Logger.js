/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Logger.js
 * Logger : Complete logging system with multiple levels for all Blapy services
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview Logger service for Blapy - handles info, error, and warning messages
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */


export class Logger {
  /**
   * Initializes the logging service.
   *
   * @param {Object} options - Logger configuration.
   * @param {boolean} options.debug - Enables or disables debug mode.
   * @param {number} options.logLevel - Log level (1: error, 2: warning, 3: notice).
   * @param {boolean} options.alertError - Displays an alert for errors.
   */
  constructor(options = {}) {
    const {
      debug = false,
      logLevel = 1,
      alertError = false,
    } = options

    this.debug = debug
    this.logLevel = logLevel
    this.alertError = alertError
  }

  /**
   * Logs an error message (level 1).
   *
   * @param {string} message - The message to log.
   * @param {string} [service] - The service originating the log.
   */
  error(message, service = 'blapy') {
    this.log(message, 1, service)
  }

  /**
   * Logs a warning message (level 2).
   *
   * @param {string} message - The message to log.
   * @param {string} [service] - The service originating the log.
   */
  warn(message, service = 'blapy') {
    this.log(message, 2, service)
  }

  /**
   * Logs an informational message (level 3).
   *
   * @param {string} message - The message to log.
   * @param {string} [service] - The service originating the log.
   */
  info(message, service = 'blapy') {
    this.log(message, 3, service)
  }

  /**
   * Generic log method with a custom level.
   * Compatible with the `_log` function from Blapy V1.
   *
   * @param {string} message - The message to log.
   * @param {number} [errorLevel=3] - Error level (1: error, 2: warning, 3: notice).
   * @param {string} [service] - The service originating the log.
   */
  log(message, errorLevel = 3, service = 'blapy') {
    if (errorLevel > this.logLevel) return

    if (errorLevel >= 2 && !this.debug) return

    if (
      (typeof window !== 'undefined' && window.console?.log) ||
      typeof console !== 'undefined'
    ) {
      switch (errorLevel) {
        case 1:
          console.error(`[Blapy2] ${message} from ${service}`)
          if (this.alertError) {
            alert(`[Blapy2 Error] ${message} from ${service}`)
          }
          break
        case 2:
          console.warn(`[Blapy2] ${message} from ${service}`)
          break
        case 3:
          console.log(`[Blapy2] ${message} from ${service}`)
          break
        default:
          console.log(`[Blapy2] ${message} from ${service}`)
          break
      }
    }
  }
}