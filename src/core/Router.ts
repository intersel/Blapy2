import { Logger } from './Logger'
import { Blapy } from './Blapy'
import { BlapyRouterOptions, NavigationOptions, Primitive } from '#shared/types'
import Navigo from 'navigo'
import JSON5 from 'json5'

export class Router {

  private readonly router: Navigo | null = null
  public isInitialized: boolean = false
  private readonly opts: BlapyRouterOptions
  /** Removes every event listener attached by the router in one call (see destroy). */
  private readonly abortController = new AbortController()

  constructor(private readonly logger: Logger, private readonly blapy: Blapy, opts: Partial<BlapyRouterOptions> = {}) {
    this.opts = {
      enableRouter: false,
      root: '/',
      hash: false,
      strategy: 'ONE',
      noMatchWarning: false,
      linksSelector: '[data-blapy-link]',
      ...opts,
    }
  }

  public init(): boolean {
    this.logger.info('Router initialization starting...', 'router')

    if (!this.opts.enableRouter) {
      this.logger.info('Router disabled, using standard event handlers', 'router')
      this.initStandardHandlers()
      return true
    }

    if (typeof Navigo !== 'function') {
      this.logger.error('Navigo is not loaded... can not continue', 'router')
      alert('Navigo is not loaded... can not continue')
      return false
    }

    this.initNavigoRouter()
    return true

  }

  public navigate(url: string, options: NavigationOptions = {}) {
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


  private initStandardHandlers() {
    this.logger.info(
      'Initializing standard event handlers (no routing)',
      'router',
    )

    const container = this.blapy.container
    container.addEventListener('click', (ev) => {
      const link = (ev.target as Element).closest<HTMLAnchorElement>('a[data-blapy-link]')
      if (!link) return

      const activeId = link.dataset.blapyActiveBlapyid
      if (activeId && activeId !== this.blapy.myUIObjectID) {
        return
      }

      ev.preventDefault()

      const params = this.extractLinkParams(link)
      const embeddingBlockId = link.dataset.blapyEmbeddingBlockid

      if (embeddingBlockId) {
        params.embeddingBlockId = embeddingBlockId
      }

      this.logger.info(`Standard link clicked: ${link.href}`, 'router')

      this.blapy.myFSM.trigger('postData', {
        aUrl: this.extractUrl(link.href),
        params: params,
        method: link.getAttribute('method') || 'GET',
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: link.dataset.blapyNoblapydata,
      })

    }, { signal: this.abortController.signal })

    container.addEventListener('submit', (ev) => {

      const form = (ev.target as HTMLFormElement)

      if (!form.matches('form[data-blapy-link]')) return

      const activeId = form.dataset.blapyActiveBlapyid
      if (activeId && activeId !== this.blapy.myUIObjectID) {
        return
      }

      ev.preventDefault()

      this.logger.info(`Form submitted: ${form.action}`, 'router')

      const formData = this.extractFormData(form, ev)
      const embeddingBlockId = form.dataset.blapyEmbeddingBlockid
      if (embeddingBlockId) {
        formData.embeddingBlockId = embeddingBlockId
      }

      this.blapy.myFSM.trigger('postData', {
        aUrl: this.extractUrl(form.action),
        params: formData,
        method: form.getAttribute('method') || 'POST',
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: form.dataset.blapyNoblapydata,
      })


    }, { signal: this.abortController.signal })
  }

  private initNavigoRouter() {
    this.logger.info(
      'Initializing simple router (manual history management)',
      'router',
    )

    this.interceptBlapyLinks()

    globalThis.addEventListener('popstate', () => {
      this.logger.info('Popstate event detected', 'router')

      this.blapy.myFSM.trigger('loadUrl', {
        aUrl: globalThis.location.pathname + globalThis.location.search,
        params: {},
        aObjectId: this.blapy.myUIObjectID,
      })

    }, { signal: this.abortController.signal })

    this.isInitialized = true
    this.logger.info('Simple router initialized', 'router')

  }

  private extractLinkParams(link: HTMLAnchorElement) {
    const paramsAttr = link.dataset.blapyParams
    if (!paramsAttr) return {}

    try {
      return JSON5.parse(paramsAttr)
    } catch {
      this.logger.warn(`Failed to parse link params: ${paramsAttr}`, 'router')
      return {}
    }
  }

  private extractFormData(form: HTMLFormElement, event: SubmitEvent) {
    const formData = new FormData(form)
    const data: Record<string, FormDataEntryValue> = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    if (event.submitter) {
      const submitter = event.submitter as HTMLInputElement | HTMLButtonElement
      if (submitter.name) {
        data[submitter.name] = submitter.value || ''
      }
    }

    return data
  }

  private interceptBlapyLinks() {
    const container = this.blapy.container

    console.log(container)

    container.addEventListener('click', (ev) => {
      const link = (ev.target as Element).closest<HTMLAnchorElement>('a[data-blapy-link]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href?.includes('#blapylink')) return

      console.log(link)

      const activeId = link.dataset.blapyActiveBlapyid
      if (activeId && activeId !== this.blapy.myUIObjectID) return

      ev.preventDefault()

      const params = this.extractLinkParams(link)
      const embeddingBlockId = this.extractEmbeddingBlockId(href)

      if (embeddingBlockId) {
        params.embeddingBlockId = embeddingBlockId
      }

      const cleanUrl = this.cleanBlapyUrl(href)

      globalThis.history.pushState({ blapy: true }, '', cleanUrl)

      this.logger.info(`Navigating to: ${cleanUrl}`, 'router');

      this.blapy.myFSM.trigger('loadUrl', {
        aUrl: cleanUrl,
        params: this.filterAttributes(params),
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: link.dataset.blapyNoblapydata,
      })

    }, { signal: this.abortController.signal })
  }

  private extractEmbeddingBlockId(url: string): string {
    const regex = /#blapylink#(.*)/i
    const match = regex.exec(url)
    return match?.[1] ? match[1] : ''
  }

  private cleanBlapyUrl(url: string): string {
    return url.replace(/#blapylink.*$/, '')
  }

  private filterAttributes(params: Record<string, unknown>): Record<string, Primitive> {
    const filtered: Record<string, Primitive> = {}

    for (const [key, value] of Object.entries(params)) {
      if (typeof value !== 'function' && typeof value !== 'object') {
        filtered[key] = value as Primitive
      }
    }

    return filtered
  }

  private extractUrl(fullUrl: string) {
    if (!fullUrl) return globalThis.location.href

    const hashIndex = fullUrl.indexOf('#')
    return hashIndex === -1 ? fullUrl : fullUrl.substring(0, hashIndex)
  }

  /**
   * Tears down the router: removes every event listener it attached (via the
   * AbortController) and destroys the underlying navigo instance if any.
   * Mirrors the old Router.destroy().
   */
  public destroy() {
    this.abortController.abort()
    this.router?.destroy()
    this.isInitialized = false
    this.logger.info('Router destroyed', 'router')
  }

}