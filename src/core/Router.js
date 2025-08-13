/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File: Router.js
 * Router: Routing manager for Blapy V2 with Navigo support
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview: Router service for Blapy V2 – compatible with Sammy from V1 but uses Navigo
 * @see {@link https://github.com/intersel/blapy2}
 * @author: Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version: 2.0.0
 * @license: DonationWare – see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

export class Router {
  /**
   * Creates a new Router instance for Blapy V2.
   *
   * @param {Object} logger - Logger instance used for logging messages (must support `info`, `warn`, `error` methods).
   * @param {Object} blapy - Reference to the Blapy instance this router will manage.
   * @param {Object} [opts={}] - Optional configuration options.
   * @param {boolean} [opts.enableRouter=false] - Whether the router should be enabled.
   * @param {string} [opts.root='/'] - Root path for the router.
   * @param {boolean} [opts.hash=false] - Whether to use hash-based routing.
   * @param {string} [opts.strategy='ONE'] - Routing strategy (e.g., 'ONE', 'ALL', etc.).
   * @param {boolean} [opts.noMatchWarning=false] - Whether to log a warning when no route matches.
   * @param {string} [opts.linksSelector='[data-blapy-link]'] - Selector for links that should be handled by the router.
   */
  constructor(logger, blapy, opts = {}) {
    this.logger = logger
    this.blapy = blapy
    this.opts = {
      enableRouter: false,
      root: '/',
      hash: false,
      strategy: 'ONE',
      noMatchWarning: false,
      linksSelector: '[data-blapy-link]',
      ...opts,
    }

    this.router = null
    this.isInitialized = false
  }

  /**
   * Initializes the Navigo router.
   * Compatible with the Sammy initialization process from Blapy V1.
   *
   * If the router is disabled via `opts.enableRouter`, it will fall back to
   * standard event handlers instead of using Navigo.
   *
   * @returns {boolean} `true` if initialization succeeded or standard handlers were initialized,
   *                    `false` if Navigo is not loaded and routing cannot continue.
   */
  init() {
    this.logger.info('Router initialization starting...', 'router')

    if (!this.opts.enableRouter) {
      this.logger.info(
        'Router disabled, using standard event handlers',
        'router'
      )
      this._initStandardHandlers()
      return true
    }

    if (typeof Navigo !== 'function') {
      this.logger.error('Navigo is not loaded... can not continue', 'router')
      alert('Navigo is not loaded... can not continue')
      return false
    }

    this._initNavigoRouter()
    return true
  }

  /**
   * Initializes standard event handlers without using a router.
   * Equivalent to Blapy V1's "no routing" mode.
   *
   * Sets up click handlers for `[data-blapy-link]` links and submit handlers
   * for `[data-blapy-link]` forms inside the Blapy container.
   * These handlers trigger the `postData` event in the Blapy state machine
   * with the extracted URL, parameters, and method.
   *
   * Filtering rules:
   * - If a `data-blapy-active-blapyid` attribute is set, the event only triggers
   *   if it matches the current `blapy.myUIObjectID`.
   * - Additional parameters such as `data-blapy-embedding-blockid` and
   *   `data-blapy-noblapydata` are included if present.
   *
   * @private
   * @returns {void}
   */
  _initStandardHandlers() {
    this.logger.info(
      'Initializing standard event handlers (no routing)',
      'router'
    )

    const container = this.blapy.container

    container.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-blapy-link]')
      if (!link) return

      const activeId = link.getAttribute('data-blapy-active-blapyid')
      if (activeId && activeId !== this.blapy.myUIObjectID) {
        return
      }

      event.preventDefault()

      const params = this._extractLinkParams(link)
      const embeddingBlockId = link.getAttribute('data-blapy-embedding-blockid')

      if (embeddingBlockId) {
        params.embeddingBlockId = embeddingBlockId
      }

      this.logger.info(`Standard link clicked: ${link.href}`, 'router')

      this.blapy.myFSM.trigger('postData', {
        aUrl: this._extractUrl(link.href),
        params: params,
        method: link.getAttribute('method') || 'GET',
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: link.getAttribute('data-blapy-noblapydata'),
      })
    })

    container.addEventListener('submit', (event) => {
      const form = event.target

      if (!form.matches('form[data-blapy-link]')) return

      const activeId = form.getAttribute('data-blapy-active-blapyid')
      if (activeId && activeId !== this.blapy.myUIObjectID) {
        return
      }

      event.preventDefault()

      this.logger.info(`Form submitted: ${form.action}`, 'router')

      const formData = this._extractFormData(form, event)

      const embeddingBlockId = form.getAttribute('data-blapy-embedding-blockid')
      if (embeddingBlockId) {
        formData.embeddingBlockId = embeddingBlockId
      }

      this.blapy.myFSM.trigger('postData', {
        aUrl: this._extractUrl(form.action),
        params: formData,
        method: form.getAttribute('method') || 'POST',
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: form.getAttribute('data-blapy-noblapydata'),
      })
    })
  }

  /**
   * Initializes the Navigo-based router for Blapy V2.
   * Compatible with Blapy V1's Sammy-based initialization, but uses
   * a simplified approach with manual history management instead
   * of complex route definitions.
   *
   * Behavior:
   * - Intercepts Blapy links for client-side navigation.
   * - Listens to the browser's `popstate` event to handle back/forward
   *   navigation by triggering a `loadUrl` event in the Blapy state machine.
   * - Sets `isInitialized` to `true` once ready.
   *
   * @private
   * @returns {void}
   */
  _initNavigoRouter() {
    this.logger.info(
      'Initializing simple router (manual history management)',
      'router'
    )

    this._interceptBlapyLinks()

    window.addEventListener('popstate', (event) => {
      this.logger.info('Popstate event detected', 'router')

      this.blapy.myFSM.trigger('loadUrl', {
        aUrl: window.location.pathname + window.location.search,
        params: {},
        aObjectId: this.blapy.myUIObjectID,
      })
    })

    this.isInitialized = true
    this.logger.info('Simple router initialized', 'router')
  }

  /**
   * Handles Blapy links using Navigo.
   * Equivalent to the `sammy.get/post/put` route handlers in Blapy V1.
   *
   * Behavior:
   * - Logs the matched route and HTTP method.
   * - Filters the route by active Blapy instance (`data-blapy-active-blapyid`)
   *   to ensure the event only triggers for the current instance.
   * - Extracts `embeddingBlockId` from the URL if present (after `#blapylink#`).
   * - Merges `match.params` and `match.data` into the request parameters.
   * - Cleans the URL by removing the `#blapylink#xxx` fragment.
   * - Triggers either a `loadUrl` (for GET requests) or `postData` (for other methods)
   *   event in the Blapy state machine with filtered parameters.
   *
   * @private
   * @param {Object} match - The route match object provided by Navigo.
   * @param {string} [match.url] - The matched URL.
   * @param {Object} [match.route] - Route metadata from Navigo.
   * @param {Object} [match.params] - Route parameters extracted by Navigo.
   * @param {Object} [match.data] - Additional data attached to the route.
   * @param {string} [method='GET'] - HTTP method to use (`GET`, `POST`, `PUT`, etc.).
   * @returns {void}
   */
  _handleBlapyLink(match, method = 'GET') {
    const url = match.url || match.route.path

    this.logger.info(`Navigo route matched: ${method} ${url}`, 'router')

    const target = document.querySelector(`[href="${url}"], [action="${url}"]`)
    if (target) {
      const activeId = target.getAttribute('data-blapy-active-blapyid')
      if (activeId && activeId !== this.blapy.myUIObjectID) {
        this.logger.info(
          `Route filtered - not for this Blapy instance: ${activeId}`,
          'router'
        )
        return
      }
    }

    const embeddingBlockId = this._extractEmbeddingBlockId(url)

    const params = {
      ...match.params,
      ...(match.data || {}),
    }

    if (embeddingBlockId) {
      params.embeddingBlockId = embeddingBlockId
    }

    const cleanUrl = this._cleanBlapyUrl(url)

    if (method === 'GET') {
      this.blapy.myFSM.trigger('loadUrl', {
        aUrl: cleanUrl,
        params: this._filterAttributes(params),
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: target?.getAttribute('data-blapy-noblapydata'),
      })
    } else {
      this.blapy.myFSM.trigger('postData', {
        aUrl: cleanUrl,
        params: this._filterAttributes(params),
        aObjectId: this.blapy.myUIObjectID,
        method: method.toLowerCase(),
        noBlapyData: target?.getAttribute('data-blapy-noblapydata'),
      })
    }
  }

  /**
   * Extracts the `embeddingBlockId` from a given URL.
   * Equivalent to `extractembeddingBlockIdName` from Blapy V1.
   *
   * The `embeddingBlockId` is expected to appear after `#blapylink#`
   * in the URL (case-insensitive).
   *
   * @private
   * @param {string} url - The URL from which to extract the `embeddingBlockId`.
   * @returns {string} The extracted `embeddingBlockId`, or an empty string if not found.
   */
  _extractEmbeddingBlockId(url) {
    const regex = /#blapylink#(.*)/i
    const match = regex.exec(url)
    return match && match[1] ? match[1] : ''
  }

  /**
   * Cleans a Blapy URL by removing any `#blapylink` fragment and everything after it.
   *
   * This is typically used to strip out internal Blapy routing markers
   * (e.g., `#blapylink#myBlock`) so that the resulting URL can be used
   * for standard requests.
   *
   * @private
   * @param {string} url - The URL to clean.
   * @returns {string} The cleaned URL without any `#blapylink` fragment.
   */
  _cleanBlapyUrl(url) {
    return url.replace(/#blapylink.*$/, '')
  }

  /**
   * Filters the given parameters to keep only useful values.
   * Equivalent to `filterAttributes` from Blapy V1.
   *
   * Removes any keys whose values are functions or objects,
   * keeping only primitive values (string, number, boolean, etc.).
   *
   * @private
   * @param {Object} params - The parameters to filter.
   * @returns {Object} A new object containing only primitive key-value pairs.
   */
  _filterAttributes(params) {
    const filtered = {}

    for (const [key, value] of Object.entries(params)) {
      if (typeof value !== 'function' && typeof value !== 'object') {
        filtered[key] = value
      }
    }

    return filtered
  }

  /**
   * Extracts parameters from a Blapy link element.
   *
   * Reads the `data-blapy-params` attribute and parses it as JSON5 if available,
   * otherwise falls back to standard JSON parsing.
   *
   * If parsing fails, logs a warning and returns an empty object.
   *
   * @private
   * @param {HTMLAnchorElement} link - The link element to extract parameters from.
   * @returns {Object} The parsed parameters object, or an empty object if none or if parsing failed.
   */
  _extractLinkParams(link) {
    const paramsAttr = link.getAttribute('data-blapy-params')
    if (!paramsAttr) return {}

    try {
      const jsonParser = typeof JSON5 !== 'undefined' ? JSON5 : JSON
      return jsonParser.parse(paramsAttr)
    } catch (e) {
      this.logger.warn(`Failed to parse link params: ${paramsAttr}`, 'router')
      return {}
    }
  }

  /**
   * Extracts form data into a plain object.
   *
   * Converts the given form's `FormData` into a standard key-value object.
   * Also captures the submit button's name/value pair if available
   * (to mimic Blapy V1's form submission behavior).
   *
   * @private
   * @param {HTMLFormElement} form - The form element from which to extract data.
   * @param {SubmitEvent|Event} event - The form submission event (must contain `submitter` or `originalEvent.submitter`).
   * @returns {Object} An object containing all form field names and their values, including the submit button if applicable.
   */
  _extractFormData(form, event) {
    const formData = new FormData(form)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    if (event.submitter) {
      const submitter = event.submitter
      if (submitter.name) {
        data[submitter.name] = submitter.value || ''
      }
    } else if (event.originalEvent && event.originalEvent.submitter) {
      const submitter = event.originalEvent.submitter
      if (submitter.name) {
        data[submitter.name] = submitter.value || ''
      }
    }

    return data
  }

  /**
   * Extracts the clean URL without any hash fragment.
   *
   * If no URL is provided, defaults to the current `window.location.href`.
   *
   * @private
   * @param {string} [fullUrl] - The full URL to clean.
   * @returns {string} The URL without the hash part.
   */
  _extractUrl(fullUrl) {
    if (!fullUrl) return window.location.href

    const hashIndex = fullUrl.indexOf('#')
    return hashIndex !== -1 ? fullUrl.substring(0, hashIndex) : fullUrl
  }

  /**
   * Performs programmatic navigation using the configured router.
   * Equivalent to the navigation methods from Blapy V1.
   *
   * If the router has not been initialized, logs a warning and aborts.
   *
   * @param {string} url - The target URL to navigate to.
   * @param {Object} [options={}] - Optional navigation options.
   * @param {string} [options.title] - The page title for the navigation state.
   * @param {Object} [options.stateObj] - A custom state object to store in history.
   * @param {string} [options.historyAPIMethod='pushState'] - History API method to use (`pushState` or `replaceState`).
   * @param {boolean} [options.updateBrowserURL=true] - Whether to update the browser's address bar.
   * @param {boolean} [options.callHandler=true] - Whether to call the matched route handler.
   * @param {boolean} [options.callHooks=true] - Whether to execute route hooks.
   * @param {boolean} [options.updateState=true] - Whether to update the internal state.
   * @param {boolean} [options.force=false] - Whether to force the navigation even if already on the same route.
   * @returns {void}
   */
  navigate(url, options = {}) {
    if (!this.isInitialized || !this.router) {
      this.logger.warn('Router not initialized, cannot navigate', 'router')
      return
    }

    this.logger.info(`Navigating to: ${url}`, 'router')

    const navigateOptions = {
      title: options.title,
      stateObj: options.stateObj,
      historyAPIMethod: options.historyAPIMethod || 'pushState',
      updateBrowserURL: options.updateBrowserURL !== false,
      callHandler: options.callHandler !== false,
      callHooks: options.callHooks !== false,
      updateState: options.updateState !== false,
      force: options.force || false,
    }

    this.router.navigate(url, navigateOptions)
  }

  /**
   * Resolves a route without performing actual navigation.
   *
   * Useful for manually triggering the router's matching logic
   * without changing the browser's URL.
   *
   * If the router is not initialized, logs a warning and returns `false`.
   *
   * @param {string} path - The path to resolve.
   * @returns {boolean} `true` if a matching route was found and handled, otherwise `false`.
   */
  resolve(path) {
    if (!this.isInitialized || !this.router) {
      this.logger.warn('Router not initialized, cannot resolve', 'router')
      return false
    }

    return this.router.resolve(path)
  }

  /**
   * Destroys the router instance and cleans up resources.
   *
   * If a router exists, calls its `destroy()` method, sets it to `null`,
   * marks the router as uninitialized, and logs the destruction event.
   *
   * @returns {void}
   */
  destroy() {
    if (this.router) {
      this.router.destroy()
      this.router = null
      this.isInitialized = false
      this.logger.info('Router destroyed', 'router')
    }
  }

  /**
   * Intercepts clicks on Blapy links (`[data-blapy-link]`) containing `#blapylink`
   * and handles them manually without triggering full page reloads.
   *
   * Behavior:
   * - Checks if the clicked link belongs to the active Blapy instance via
   *   `data-blapy-active-blapyid`.
   * - Extracts link parameters (`data-blapy-params`) and `embeddingBlockId`
   *   from the link's `href`.
   * - Cleans the URL by removing the `#blapylink` fragment.
   * - Updates the browser's history via `pushState` without reloading the page.
   * - Triggers a `loadUrl` event in the Blapy state machine with the cleaned URL
   *   and filtered parameters.
   *
   * @private
   * @returns {void}
   */
  _interceptBlapyLinks() {
    const container = this.blapy.container

    container.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-blapy-link]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || !href.includes('#blapylink')) return

      const activeId = link.getAttribute('data-blapy-active-blapyid')
      if (activeId && activeId !== this.blapy.myUIObjectID) return

      event.preventDefault()

      const params = this._extractLinkParams(link)
      const embeddingBlockId = this._extractEmbeddingBlockId(href)

      if (embeddingBlockId) {
        params.embeddingBlockId = embeddingBlockId
      }

      const cleanUrl = this._cleanBlapyUrl(href)

      window.history.pushState({ blapy: true }, '', cleanUrl)

      this.logger.info(`Navigating to: ${cleanUrl}`, 'router')

      this.blapy.myFSM.trigger('loadUrl', {
        aUrl: cleanUrl,
        params: this._filterAttributes(params),
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: link.getAttribute('data-blapy-noblapydata'),
      })
    })
  }
}
