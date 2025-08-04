/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : core/AjaxService.js
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview : AJAX service for Blapy using XMLHttpRequest for compatibility with older browsers.
 * @see {@link https://github.com/intersel/blapy2}
 * @author : Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version : 1.0.0
 * @license : DonationWare - see https://github.com/intersel/blapy2/blob/main/LICENSE
 * -----------------------------------------------------------------------------------------
 **/

export class AjaxService {

  constructor(logger) {
    this.logger = logger
  }

  /**
   * Performs an AJAX request using XMLHttpRequest (to mimic the "grey requests" behavior of Blapy v1).
   *
   * @async
   * @function request
   * @param {string} url - The request URL (required).
   * @param {Object} [options={}] - Configuration options for the request.
   * @param {string} [options.method='GET'] - HTTP method.
   * @param {Object|FormData|string} [options.body] - Request body.
   * @param {Object} [options.headers] - Custom headers.
   * @param {Object} [options.params] - URL parameters (for GET requests).
   * @returns {Promise<Object|string>} The response data as a string or parsed object.
   *
   * @example
   * // Simple GET request
   * const data = await ajaxService.request('https://api.example.com/users');
   *
   * // POST request with data
   * const result = await ajaxService.request('/api/save', {
   *     method: 'POST',
   *     body: { name: 'John', age: 30 }
   * });
   */
  async request(url, options = {}) {
    if (!url) {
      throw new Error('URL is required')
    }

    const {
      method = 'GET',
      body = null,
      headers = {},
      params = null,
      timeout = 30000,
    } = options

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      let finalUrl = url
      if (method.toUpperCase() === 'GET' && params) {
        const urlParams = new URLSearchParams(params)
        finalUrl += (url.includes('?') ? '&' : '?') + urlParams.toString()
      }

      xhr.open(method.toUpperCase(), finalUrl, true)

      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.timeout = timeout

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            if (xhr.getResponseHeader('content-type')?.includes('application/json')) {
              const jsonData = JSON.parse(xhr.responseText)
              this.logger?.info(`AJAX Success (JSON): ${method} ${finalUrl}`, {
                status: xhr.status,
                dataKeys: Object.keys(jsonData),
              })
              resolve(jsonData)
            } else {
              this.logger?.info(`AJAX Success (Text): ${method} ${finalUrl}`, {
                status: xhr.status,
                responseLength: xhr.responseText.length,
              })
              resolve(xhr.responseText)
            }
          } catch (parseError) {
            this.logger?.info(`AJAX Success (Raw): ${method} ${finalUrl}`, {
              status: xhr.status,
              parseError: parseError.message,
            })
            resolve(xhr.responseText)
          }
        } else {
          const error = new Error(`HTTP ${xhr.status}: ${xhr.statusText}`)
          this.logger?.error(`AJAX Error: ${method} ${finalUrl}`, {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          })
          reject(error)
        }
      }

      xhr.onerror = () => {
        const error = new Error('Network error occurred')
        this.logger?.error(`AJAX Network Error: ${method} ${finalUrl}`)
        reject(error)
      }

      xhr.ontimeout = () => {
        const error = new Error(`Request timeout after ${timeout}ms`)
        this.logger?.error(`AJAX Timeout: ${method} ${finalUrl}`)
        reject(error)
      }

      // Prepare and send the request body
      if (method.toUpperCase() === 'GET' || !body) {
        xhr.send()
      } else {
        this._sendWithBody(xhr, body)
      }
    })
  }

  /**
   * Sends the request with a body, depending on the data type.
   *
   * - If the body is a FormData instance, it sends it directly.
   * - If the body is a string, it sets the content type to `application/x-www-form-urlencoded` and sends it.
   * - If the body is an object, it converts it to a URL-encoded string and sends it.
   * - If the body is empty, it simply sends the request without content.
   *
   * @private
   * @param {XMLHttpRequest} xhr - The XMLHttpRequest instance.
   * @param {FormData|string|Object|null} body - The request body.
   */
  _sendWithBody(xhr, body) {
    if (body instanceof FormData) {
      xhr.send(body)
    } else if (typeof body === 'string') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(body)
    } else if (body && typeof body === 'object') {
      const formData = new URLSearchParams()
      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(formData.toString())
    } else {
      xhr.send()
    }
  }

  /**
   * GET request.
   *
   * @param {string} url - The request URL.
   * @param {Object} [options={}] - Additional options.
   * @returns {Promise<Object|string>} The response data as a string or parsed object.
   */
  async get(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request.
   *
   * @param {string} url - The request URL.
   * @param {Object|FormData|string} data - Data to send in the request body.
   * @param {Object} [options={}] - Additional options.
   * @returns {Promise<Object|string>} The response data as a string or parsed object.
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data,
    })
  }
}