/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Utils.js
 * Utils : Utility class providing base64 encoding/decoding helpers for Blapy
 *
 * -----------------------------------------------------------------------------------------
 * @class Utils
 * @classdesc Provides utility methods for base64 encoding and decoding operations
 *            (with UTF-8 support) used within the Blapy framework.
 * @see {@link https://github.com/intersel/blapy2}
 * @version 1.0.0
 * -----------------------------------------------------------------------------------------
 */
export class Utils {
  /**
   * Decodes a base64 string to a UTF-8 string.
   *
   * This method is a safe wrapper around `atob`, handling UTF-8 characters by
   * applying `decodeURIComponent`.
   *
   * @function atou
   * @param {string} b64 - The base64-encoded string.
   * @returns {string} The decoded UTF-8 string.
   *
   * @example
   * const decoded = utils.atou("SGVsbG8gd29ybGQh");
   * console.log(decoded); // "Hello world!"
   */
  atou(b64) {
    return decodeURIComponent((atob(b64)))
  }

  /**
   * Encodes a UTF-8 string into a base64 string.
   *
   * This method ensures UTF-8 characters are properly encoded using `encodeURIComponent`
   * before applying `btoa`.
   *
   * @function utoa
   * @param {string} data - The UTF-8 string to encode.
   * @returns {string} The base64-encoded string.
   *
   * @example
   * const encoded = utils.utoa("Hello world!");
   * console.log(encoded); // "SGVsbG8gd29ybGQh"
   */
  utoa(data) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(data)))
  }
}
