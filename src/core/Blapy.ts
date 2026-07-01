import { Logger } from './Logger'
import { AjaxOptions, AnimationProvider, BlapyOptions, BlapySocketOptions, NavigationOptions, StateData } from '#shared/types'
import { AjaxService } from './AjaxService'
import { Utils } from './Utils'
import { TemplateManager } from './TemplateManager'
import { Router } from './Router'
import { BlapyBlock } from './BlapyBlock'
import { createFSM, FSMManager, type StateDefinition } from '../../lib/kFSM'
import type BlapySocket from '../modules/BlapySocket'
import JSON5 from 'json5'

export class Blapy {

  public container: HTMLElement
  public myUIObject: HTMLElement
  public myUIObjectID: string
  public readonly logger: Logger
  private readonly defaults: BlapyOptions = {}
  private readonly opts: BlapyOptions
  private readonly utils: Utils
  public readonly ajaxService: AjaxService
  private readonly templateManager: TemplateManager
  private readonly router: Router
  public readonly blapyBlocks: BlapyBlock
  myFSM!: FSMManager
  /**
   * Optional animation provider used by data-blapy-update="fadeInOut"/"rightOutIn".
   * Undefined unless an `animation` provider (e.g. Blapymotion) is passed in options.
   */
  public readonly animation: AnimationProvider | null
  /**
   * Optional WebSocket service (receive-only). Non-null only when
   * `websocketOptions` is passed AND a global `BlapySocket` class is loaded
   * (via a separate `<script src="dist/BlapySocket.js">`).
   */
  public readonly websocket: BlapySocket | null
  private readonly optsIfsm: BlapyOptions


  constructor(element: string | HTMLElement, options: BlapyOptions = {}) {

    if (!element) {
      throw new Error('Blapy needs a valid DOM element')
    }

    if (typeof element === 'string') {
      const foundElement = document.querySelector<HTMLElement>(element)
      if (!foundElement) {
        throw new Error(`Element not found: ${element}`)
      }
      element = foundElement
    }

    if (!(element instanceof HTMLElement)) {
      throw new TypeError('Blapy needs a valid DOM element')
    }

    if (!element.id) {
      throw new Error('Blapy needs an element with an ID')
    }

    this.container = element

    this.defaults = {
      debug: false,
      logLevel: 1,
      alertError: false,
      enableRouter: false,
      routerRoot: '/',
      routerHash: false,
      pageLoadedFunction: null,
      pageReadyFunction: null,
      beforePageLoad: null,
      beforeContentChange: null,
      afterContentChange: null,
      afterPageChange: null,
      onErrorOnPageChange: null,
      doCustomChange: null,
      fsmExtension: null,
      LogLevelIfsm: 1,
      debugIfsm: false,
      theBlapy: this,
      animation: null,
    }

    this.opts = { ...this.defaults, ...options }

    // Animation is optional: use the provider passed in options if any, otherwise
    // auto-detect a global `Blapymotion` class (loaded via a separate
    // <script src="dist/BlapyMotion.js">). If neither is present, animations are
    // simply disabled — the core never bundles Blapymotion.
    const GlobalBlapymotion = (globalThis as { Blapymotion?: new () => AnimationProvider }).Blapymotion
    this.animation = this.opts.animation
      ?? (typeof GlobalBlapymotion === 'function' ? new GlobalBlapymotion() : null)

    this.optsIfsm = {
      ...this.opts,
      debug: this.opts.debugIfsm ?? false,
      logLevel: this.opts.LogLevelIfsm ?? 1,
    }

    this.myUIObject = this.container
    this.myUIObjectID = this.container.id

    //For IFSM
    this.opts.theBlapy = this

    this.utils = new Utils()
    this.logger = new Logger(this.opts)

    // WebSocket is optional: instantiate only when websocketOptions is provided
    // (non-empty) AND a global `BlapySocket` class is loaded (via a separate
    // <script src="dist/BlapySocket.js">). Done after the logger exists since
    // BlapySocket logs on construction. The core never bundles it.
    const GlobalBlapySocket = (globalThis as { BlapySocket?: new (o: BlapySocketOptions, b: Blapy) => BlapySocket }).BlapySocket
    this.websocket =
      typeof GlobalBlapySocket === 'function' &&
      this.opts.websocketOptions &&
      Object.keys(this.opts.websocketOptions).length > 0
        ? new GlobalBlapySocket({ ...this.opts.websocketOptions }, this)
        : null

    this.ajaxService = new AjaxService(this.logger)
    this.templateManager = new TemplateManager(this.logger, this.ajaxService, this.utils)
    this.router = new Router(this.logger, this, {
      enableRouter: this.opts.enableRouter,
      root: this.opts.routerRoot,
      hash: this.opts.routerHash,
      strategy: 'ONE',
      noMatchWarning: false,
      linksSelector: '[data-blapy-link]',
    })
    this.blapyBlocks = new BlapyBlock(this.logger)

    this.blapyBlocks.initializeBlocks(this.container)
    this.blapyBlocks.setBlapyInstance(this)

    this.logger.info(`Blapy instance (#${this.myUIObjectID}) created`, 'Blapy2 constructor')
  }

  public trigger(eventName: string, data: unknown = null) {
    this.logger.info(`[Sending event] ${eventName} - Diffused`)
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
    })
    this.myUIObject.dispatchEvent(event)
  }

  /**
   * Tears down this Blapy instance: destroys the router (removing its event
   * listeners), clears the block update intervals, and detaches the instance
   * reference from the element so it can be re-initialised cleanly.
   */
  public destroy() {
    this.logger.info(`Destroying Blapy instance (#${this.myUIObjectID})`, 'core')
    this.router.destroy()
    this.blapyBlocks.destroy()
    delete this.myUIObject._blapyInstance
  }

  public createBlapyBlock(aJsonObject: Record<string, any>) {

    if (!aJsonObject['blapy-container-name']) {
      this.logger.info('createBlapyBlock: Error on received json where blapy-container-name is not defined!\nPerhaps it\'s pure json not defined as such in Blapy block configuration (cf. data-blapy-template-init-purejson)...\n' + JSON.stringify(aJsonObject))
    }

    const htmlBlapyBlock = document.createElement('div')
    htmlBlapyBlock.dataset.blapyContainer = 'true'
    htmlBlapyBlock.dataset.blapyContainerName = aJsonObject['blapy-container-name']
    htmlBlapyBlock.dataset.blapyContainerContent = aJsonObject['blapy-container-content']
    htmlBlapyBlock.dataset.blapyUpdate = 'json'
    htmlBlapyBlock.innerHTML = JSON.stringify(aJsonObject['blapy-data'])

    return htmlBlapyBlock
  }

  public initApplication() {
    this.logger.info('InitApplication', 'core')

    try {
      const states: StateDefinition<StateData> = {
        PageLoaded: {
          enterState: {
            init_function: function(this) {
              const blapy = this.opts.theBlapy as Blapy
              blapy.myFSM = this
              blapy.logger.info('Page loaded', 'fsm')
              blapy.blapyBlocks.setBlapyUpdateIntervals()
              if (blapy.opts.pageLoadedFunction) blapy.opts.pageLoadedFunction()
              blapy.trigger('Blapy_PageLoaded')
            },
            next_state: 'PreparePage',
          },
        },

        PreparePage: {
          enterState: {
            init_function: function() {},
            propagate_event: 'setBlapyUrl',
          },
          setBlapyUrl: {
            init_function: function(this) {
              const blapy = this.opts.theBlapy as Blapy
              blapy.setBlapyURL()
            },
            next_state: 'PreparePage_setBlapyJsonTemplates',
          },
        },

        PreparePage_setBlapyJsonTemplates: {
          enterState: {
            init_function: function(this) {
              const blapy = this.opts.theBlapy as Blapy
              blapy.setBlapyJsonTemplates()
            },
            next_state: 'PreparePage_setBlapyUpdateOnDisplay',
          },
        },

        PreparePage_setBlapyUpdateOnDisplay: {
          blapyJsonTemplatesIsSet: {
            init_function: function(this) {
              const blapy = this.opts.theBlapy as Blapy
              blapy.setBlapyUpdateOnDisplay()
            },
            next_state: 'PageReady',
          },
          reloadBlock: 'loadUrl',
          updateBlock: 'loadUrl',
          postData: 'loadUrl',
          loadUrl: {
            how_process_event: {
              delay: 50,
              preventcancel: true,
            },
            propagate_event: true,
          },
        },

        PageReady: {
          enterState: {
            init_function: function(this) {
              const blapy = this.opts.theBlapy as Blapy
              if (blapy.opts.pageReadyFunction) blapy.opts.pageReadyFunction()
              blapy.trigger('Blapy_PageReady')
            },
          },
          loadUrl: {
            init_function: function(this, p, e, data : StateData) {
              data.method = 'GET'
              this.trigger('postData', data)
            },
          },
          postData: {
            init_function: function(this, p, e, data: StateData) {
              const blapy = this.opts.theBlapy as Blapy
              if (blapy.opts.beforePageLoad) blapy.opts.beforePageLoad(data)
              blapy.trigger('Blapy_beforePageLoad', data)
            },
            out_function: function(this, p, e, data: StateData) {
              const blapy = this.opts.theBlapy as Blapy

              let aURL = data.aUrl

              // @ts-ignore
              let aObjectId = data.aObjectId ? data.aObjectId : e?.currentTarget?.id!

              if (!data.params) data.params = {}
              let params = JSON5.parse(JSON5.stringify(data.params))

              if (!params) {
                params = { blapyaction: 'update' }
              } else if (!params.blapyaction) {
                params['blapyaction'] = 'update'
              }

              if (('embeddingBlockId' in params) && (!params.embeddingBlockId)) {
                blapy.logger.error('[postData on ' + blapy.myUIObjectID + '] embeddingBlockId has been set but is undefined!')
              }

              let aembeddingBlockId = params.embeddingBlockId

              if (aembeddingBlockId && params.templateId) {
                blapy.myUIObject.querySelectorAll<HTMLElement>('[data-blapy-container-name="' + aembeddingBlockId + '"]')
                  .forEach(el => { el.dataset.blapyTemplateDefaultId = params.templateId })
              }

              let method = data.method ?? 'POST'

              params = Object.assign(params, {
                blapycall: '1',
                blapyaction: params.blapyaction,
                blapyobjectid: aObjectId,
              })

              const requestOptions: Partial<AjaxOptions> = { method }
              if (method.toUpperCase() === 'GET') {
                requestOptions.params = params
              } else {
                requestOptions.body = params
              }

              blapy.ajaxService.request<string | Element>(aURL ?? '', requestOptions)
                .then((response: string | Element) => {
                  if (response) {
                    if (typeof response === 'object') response = JSON.stringify(response)
                    if (aembeddingBlockId) response = blapy.embedHTMLPage(response, aembeddingBlockId) ?? response
                    this.trigger('pageLoaded', { htmlPage: response, params })
                  }
                })
                .catch((error) => {
                  this.trigger('errorOnLoadingPage', aURL + ': ' + error.toString())
                })
            },
            next_state: 'ProcessPageChange',
          },
          updateBlock: {
            init_function: function(this, p, e, data: Partial<StateData>) {
              const blapy = this.opts.theBlapy as Blapy
              if (blapy.opts.beforePageLoad) blapy.opts.beforePageLoad(data)
              blapy.trigger('Blapy_beforePageLoad', data)
              if (!data?.html) {
                blapy.logger.info('updateBlock: no html property found')
                this.trigger('errorOnLoadingPage', 'updateBlock: no html property found')
              }
            },
            out_function: function(this, p, e, data: Partial<StateData>) {
              const blapy = this.opts.theBlapy as Blapy
              if (!data) return
              if (!data.params) data.params = {}

              if (('embeddingBlockId' in data.params) && (!data.params.embeddingBlockId)) {
                blapy.logger.info(`[updateBlock on ${blapy.myUIObjectID}] embeddingBlockId is undefined!`)
              }

              let aembeddingBlockId = data.params.embeddingBlockId
              if (typeof data.html === 'object') data.html = JSON.stringify(data.html)

              if (aembeddingBlockId && data.params.templateId) {
                const container = blapy.myUIObject.querySelector<HTMLElement>(
                  `[data-blapy-container-name="${aembeddingBlockId}"]`
                )
                if (container) container.dataset.blapyTemplateDefaultId = data.params.templateId
              }

              if (aembeddingBlockId) data.html = blapy.embedHTMLPage(data.html ?? '', aembeddingBlockId)

              this.trigger('pageLoaded', { htmlPage: data.html, params: data.params })
            },
            next_state: 'ProcessPageChange',
          },
          reloadBlock: {
            init_function: function(this, p, e, data: Partial<StateData>) {
              const blapy = this.opts.theBlapy as Blapy
              const params: Record<string, any> = data.params ?? {}

              if (('embeddingBlockId' in params) && (!params.embeddingBlockId)) {
                blapy.logger.info('[reloadBlock on ' + blapy.myUIObjectID + '] embeddingBlockId is undefined!')
              }

              blapy.setBlapyJsonTemplates(true, params.embeddingBlockId, params.templateId)
              blapy.setBlapyUpdateOnDisplay()
            },
          },
        },

        ProcessPageChange: {
          enterState: {},
          pageLoaded: {
            init_function: async function(this, p, e, data: Partial<StateData>) {
              const blapy = this.opts.theBlapy as Blapy

              let pageContent: any = data.htmlPage
              const params: Record<string, any> = data.params ?? {}
              const aObjectId = params.blapyobjectid
              const jsonFeatures = JSON5

              // Tenter de parser en JSON
              try {
                pageContent = jsonFeatures.parse(pageContent)

                if (Array.isArray(pageContent)) {
                  const fragment = document.createDocumentFragment()
                  for (const element of pageContent) {
                    fragment.appendChild(blapy.createBlapyBlock(element))
                  }
                  pageContent = fragment
                } else if (typeof pageContent === 'object') {
                  pageContent = blapy.createBlapyBlock(pageContent)
                } else {
                  blapy.logger.info('downloaded content is neither html nor json: ' + pageContent)
                }
              } catch {
                // C'est du HTML, on le parse en DOM
                const template = document.createElement('template')
                template.innerHTML = pageContent
                pageContent = template.content
              }

              switch (params['blapyaction']) {
                case 'update':
                default:
                  for (const containerElement of blapy.myUIObject.querySelectorAll<HTMLElement>('[data-blapy-container]')) {
                    let myContainer = containerElement
                    const containerName = myContainer.dataset.blapyContainerName

                    if (!params['force-update']) params['force-update'] = 0

                    let aBlapyContainer: HTMLElement | null = null
                    try {
                      // Chercher le container correspondant dans la réponse
                      const root = pageContent instanceof DocumentFragment
                        ? pageContent
                        : (pageContent as HTMLElement)

                      if ((root as HTMLElement).matches?.(`[data-blapy-container-name="${containerName}"]`)) {
                        aBlapyContainer = root as HTMLElement
                      } else {
                        aBlapyContainer = (root).querySelector?.(`[data-blapy-container-name="${containerName}"]`) ?? null

                        // Pour DocumentFragment, querySelector est disponible nativement
                        if (!aBlapyContainer && root instanceof DocumentFragment) {
                          aBlapyContainer = root.querySelector(`[data-blapy-container-name="${containerName}"]`)
                        }
                      }
                    } catch (err) {
                      blapy.logger.error(String(err))
                      continue
                    }

                    if (!aBlapyContainer) continue

                    // Vérifier data-blapy-applyon
                    const applyOn = aBlapyContainer.dataset.blapyApplyon
                    if (applyOn) {
                      const aListOfApplications = applyOn.split(',')
                      if (aListOfApplications.length > 0 && !aListOfApplications.includes(aObjectId)) continue
                    }

                    if (!myContainer.id) {
                      blapy.logger.warn('A blapy block has no id: ' + myContainer.outerHTML.substring(0, 250))
                    }
                    if (!aBlapyContainer.id) {
                      aBlapyContainer.id = myContainer.id
                    }

                    let dataBlapyUpdate = aBlapyContainer.dataset.blapyUpdate
                    let dataBlapyUpdateRuleIsLocal = false

                    if (
                      myContainer.dataset.blapyUpdateRule === 'local' ||
                      (dataBlapyUpdate === 'json' && myContainer.dataset.blapyUpdate !== 'json')
                    ) {
                      dataBlapyUpdate = myContainer.dataset.blapyUpdate
                      dataBlapyUpdateRuleIsLocal = true
                    }

                    const tmpContainer = aBlapyContainer.querySelector<HTMLElement>('xmp.blapybin')

                    if (dataBlapyUpdate !== 'json' && tmpContainer) {
                      aBlapyContainer.innerHTML = blapy.utils.atou(tmpContainer.innerHTML)
                    }

                    if (blapy.opts.beforeContentChange) blapy.opts.beforeContentChange(myContainer)
                    myContainer.dispatchEvent(new CustomEvent('Blapy_beforeContentChange', {
                      detail: blapy.myUIObject,
                    }))

                    // --- Tous les cas de mise à jour ---
                    if (!dataBlapyUpdate || dataBlapyUpdate === 'update') {
                      if (
                        aBlapyContainer.dataset.blapyContainerContent !== myContainer.dataset.blapyContainerContent ||
                        params['force-update'] == 1
                      ) {
                        if (dataBlapyUpdateRuleIsLocal) {
                          myContainer.innerHTML = aBlapyContainer.innerHTML
                        } else {
                          myContainer.outerHTML = aBlapyContainer.outerHTML
                          myContainer = aBlapyContainer
                        }
                      }
                    } else if (dataBlapyUpdate === 'force-update') {
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                        myContainer = aBlapyContainer
                      }
                    } else if (dataBlapyUpdate === 'append') {
                      aBlapyContainer.insertAdjacentHTML('afterbegin', myContainer.innerHTML)
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                        myContainer = aBlapyContainer
                      }
                    } else if (dataBlapyUpdate === 'prepend') {
                      aBlapyContainer.insertAdjacentHTML('beforeend', myContainer.innerHTML)
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                        myContainer = aBlapyContainer
                      }
                    } else if (dataBlapyUpdate === 'json-append') {
                      const currentJsonData = myContainer.dataset.blapyJsonData
                      let currentData: any[] = []

                      if (currentJsonData) {
                        try {
                          currentData = jsonFeatures.parse(currentJsonData)
                          if (!Array.isArray(currentData)) currentData = [currentData]
                        } catch {
                          currentData = []
                        }
                      }

                      let newJsonData: any = null

                      if (tmpContainer) {
                        try {
                          newJsonData = jsonFeatures.parse(blapy.utils.atou(tmpContainer.innerHTML))
                        } catch {
                          blapy.logger.error('Failed to decode/parse new JSON data', 'json-append')
                          continue
                        }
                      } else {
                        try {
                          newJsonData = jsonFeatures.parse(aBlapyContainer.innerHTML)
                        } catch {
                          blapy.logger.error('Failed to parse new JSON data', 'json-append')
                          continue
                        }
                      }

                      if (newJsonData?.['blapy-data']) newJsonData = newJsonData['blapy-data']

                      const appendStrategy = myContainer.dataset.blapyJsonAppendStrategy ?? 'end'
                      let mergedData: any[] = []

                      if (appendStrategy === 'start') {
                        mergedData = Array.isArray(newJsonData)
                          ? [...newJsonData, ...currentData]
                          : [newJsonData, ...currentData]
                      } else if (appendStrategy === 'unique') {
                        const uniqueKey = myContainer.dataset.blapyJsonUniqueKey ?? 'id'
                        mergedData = [...currentData]
                        const newItems = Array.isArray(newJsonData) ? newJsonData : [newJsonData]
                        for (const newItem of newItems) {
                          const exists = mergedData.some(
                            item => item[uniqueKey] && newItem[uniqueKey] && item[uniqueKey] === newItem[uniqueKey]
                          )
                          if (!exists) mergedData.push(newItem)
                        }
                      } else {
                        mergedData = Array.isArray(newJsonData)
                          ? [...currentData, ...newJsonData]
                          : [...currentData, newJsonData]
                      }

                      const maxItems = Number.parseInt(myContainer.dataset.blapyJsonMaxItems ?? '')
                      if (maxItems > 0 && mergedData.length > maxItems) {
                        mergedData = appendStrategy === 'start'
                          ? mergedData.slice(0, maxItems)
                          : mergedData.slice(-maxItems)
                      }

                      myContainer.dataset.blapyJsonData = JSON.stringify(mergedData)

                      const tempBlapyContainer = aBlapyContainer.cloneNode(true) as HTMLElement
                      tempBlapyContainer.innerHTML = JSON.stringify(mergedData)

                      await blapy.templateManager.processJsonUpdate(null, myContainer, tempBlapyContainer, blapy)

                      myContainer.dispatchEvent(new CustomEvent('Blapy_jsonAppended', {
                        detail: {
                          newItems: Array.isArray(newJsonData) ? newJsonData.length : 1,
                          totalItems: mergedData.length,
                          data: mergedData,
                        },
                      }))

                      blapy.logger.info(
                        `JSON Append: added ${Array.isArray(newJsonData) ? newJsonData.length : 1} items, total: ${mergedData.length}`,
                        'json-append'
                      )

                    } else if (dataBlapyUpdate === 'replace') {
                      myContainer.innerHTML = aBlapyContainer.innerHTML
                      myContainer = aBlapyContainer

                    } else if (dataBlapyUpdate === 'custom') {
                      if (
                        aBlapyContainer.dataset.blapyContainerContent !== myContainer.dataset.blapyContainerContent ||
                        params['force-update'] == 1
                      ) {
                        if (blapy.opts.doCustomChange) blapy.opts.doCustomChange(myContainer, aBlapyContainer)
                        myContainer.dispatchEvent(new CustomEvent('Blapy_doCustomChange', {
                          detail: aBlapyContainer,
                        }))
                      }
                    } else if (dataBlapyUpdate === 'remove') {
                      const parent = myContainer.parentNode
                      myContainer.remove()
                      myContainer = parent as HTMLElement

                    } else if (dataBlapyUpdate === 'json') {
                      await blapy.templateManager.processJsonUpdate(tmpContainer, myContainer, aBlapyContainer, blapy)

                    } else {
                      // Animation update (e.g. fadeInOut/rightOutIn). The animation
                      // provider (Blapymotion) is optional: if it isn't loaded, fall
                      // back to a plain update so the content still changes.
                      const pluginUpdateFunction = blapy.animation?.[dataBlapyUpdate]
                      if (typeof pluginUpdateFunction === 'function') {
                        if (
                          aBlapyContainer.dataset.blapyContainerContent !== myContainer.dataset.blapyContainerContent ||
                          params['force-update'] == 1 ||
                          aBlapyContainer.dataset.blapyContainerForceUpdate === 'true'
                        ) {
                          pluginUpdateFunction(myContainer, aBlapyContainer)
                        }
                      } else {
                        if (!blapy.animation) {
                          blapy.logger.warn(`data-blapy-update="${dataBlapyUpdate}" needs the optional Blapymotion module (load <script src="dist/BlapyMotion.js"> or pass an \`animation\` provider); updating without animation`)
                        } else {
                          blapy.logger.error(`animation "${dataBlapyUpdate}" does not exist on the animation provider; updating without animation`)
                        }
                        // Plain fallback update
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                        myContainer = aBlapyContainer
                      }
                    }

                    // Post-update
                    blapy.blapyBlocks.setBlapyUpdateIntervals()
                    await blapy.setBlapyUpdateOnDisplay()
                    blapy.setBlapyURL()

                    if (blapy.opts.afterContentChange) blapy.opts.afterContentChange(myContainer)
                    if (myContainer.id) {
                      const updatedElement = document.getElementById(myContainer.id)
                      if (updatedElement) {
                        updatedElement.dispatchEvent(new CustomEvent('Blapy_afterContentChange', {
                          detail: myContainer,
                        }))
                      }
                    }
                  }
                  break
              }
            },
            out_function: function(this, p, e, data) {
              const blapy = this.opts.theBlapy as Blapy
              if (blapy.opts.afterPageChange) blapy.opts.afterPageChange()
              blapy.trigger('Blapy_afterPageChange', data)
            },
            next_state: 'PageReady',
          },
          errorOnLoadingPage: {
            init_function: function(this, p, e, data) {
              const blapy = this.opts.theBlapy as Blapy
              if (blapy.opts.onErrorOnPageChange) blapy.opts.onErrorOnPageChange(data)
              blapy.trigger('Blapy_ErrorOnPageChange', data)
            },
            next_state: 'PageReady',
          },
          reloadBlock: 'loadUrl',
          updateBlock: 'loadUrl',
          postData: 'loadUrl',
          loadUrl: {
            how_process_event: {
              delay: 50,
              preventcancel: true,
            },
            propagate_event: true,
          },
        },

        DefaultState: {
          start: {
            next_state: 'PageLoaded',
          },
        },
      }

      if (this.opts.fsmExtension) {
        this.deepMerge(states, this.opts.fsmExtension)
      }

      this.myFSM = createFSM<StateData>(this.myUIObject, states, {
        ...this.optsIfsm,
        theBlapy: this,
      })

      if (!this.router.init()) {
        this.logger.error('Failed to initialize router', 'core')
        return false
      }

      return true

    } catch (error) {
      this.logger.error(`Failed to initialize application: ${String(error)}`, 'core')
      return false
    }
  }
  public setBlapyURL() {
    this.logger.info('Set blapyURL', 'router')

    const blapyLinks = this.container.querySelectorAll<HTMLElement>('[data-blapy-link]')

    blapyLinks.forEach((bL) => {
      if (this.shouldSkipLink(bL)) return

      let aHref = this.getHref(bL)
      if (!aHref) return

      aHref = this.normalizeHref(aHref, bL)

      this.updateHref(bL, aHref)
    })
  }

  private shouldSkipLink(bL: HTMLElement) {
    const activeIdAttr = bL.dataset.blapyActiveBlapyid
    return activeIdAttr && activeIdAttr !== this.myUIObjectID
  }

  private getHref(bL: HTMLElement) {
    switch (bL.tagName) {
      case 'A':
        return bL.getAttribute('href')
      case 'FORM':
        return bL.getAttribute('action')
      default:
        return bL.dataset.blapyHref
    }
  }

  private normalizeHref(href: string, bL: HTMLElement) {
    if (!href.includes('#blapylink')) {
      href += '#blapylink'

      const blockId = bL.dataset.blapyEmbeddingBlockid
      if (blockId) {
        href += `#${blockId}`
      }
    }

    const isCustom = bL.tagName !== 'A' && bL.tagName !== 'FORM'
    if (isCustom && !href.startsWith('/') && !/^https?:\/\//i.test(href)) {
      const baseHref = document.querySelector('base')?.getAttribute('href')
      href = baseHref
        ? baseHref + href
        : globalThis.location.pathname.replace(/[^/]*$/, '') + href
    }

    return href
  }

  private updateHref(bL: HTMLElement, href: string) {
    switch (bL.tagName) {
      case 'A':
        bL.setAttribute('href', href)
        break
      case 'FORM':
        bL.setAttribute('action', href)
        break
      default:
        bL.dataset.blapyHref = href
        bL.addEventListener('click', () => {
          this.myFSM.trigger('loadUrl', {
            aUrl: href,
            params: {},
            aObjectId: this.myUIObjectID,
          })
        })
    }
  }

  public navigate(url: string, options : NavigationOptions = {}) {
    if (this.opts.enableRouter && this.router.isInitialized) {
      this.router.navigate(url, options)
    } else {
      // Standard navigation without router - using the FSM
      this.myFSM.trigger('loadUrl', {
        aUrl: url,
        params: options.params || {},
        aObjectId: this.myUIObjectID,
        noBlapyData: options.noBlapyData,
      })
    }
  }

  async setBlapyJsonTemplates(forceReload?: boolean, aEmbeddingBlock?: string, aTemplateId?: string) {

    this.logger.info('setBlapyJsonTemplates', 'core')

    forceReload ??= false

    if (aEmbeddingBlock) {
      aEmbeddingBlock = `[data-blapy-container-name='${aEmbeddingBlock}']`
    } else {
      aEmbeddingBlock = ''
    }

    if (aTemplateId) {
      const selector = '[data-blapy-update="json"]' + aEmbeddingBlock
      const targets = this.container.querySelectorAll<HTMLElement>(selector) // ← SOLUTION


      targets.forEach(target => {
        target.dataset.blapyTemplateDefaultId = aTemplateId
      })
    }

    let jsonBlocks = this.container.querySelectorAll<HTMLElement>('[data-blapy-update="json"]' + aEmbeddingBlock)
    if (jsonBlocks.length > 0) {

      for (const c of jsonBlocks) {
        await this.templateManager.setBlapyContainerJsonTemplate(c, this, forceReload)
      }

      this.myFSM.trigger('blapyJsonTemplatesIsSet')
    } else {
      this.myFSM.trigger('blapyJsonTemplatesIsSet')
    }

  }

  public async setBlapyUpdateOnDisplay() {
    this.logger.info('setBlapyUpdateOnDisplay', 'core')

    const elements = this.myUIObject.querySelectorAll<HTMLElement>('[data-blapy-updateblock-ondisplay]')
    if (elements.length === 0) return

    if (!('IntersectionObserver' in globalThis)) {
      alert('Blapy: IntersectionObserver is not supported. Need it to process data-blapy-updateblock-ondisplay option')
      return
    }

    const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          if (!Object.hasOwn(el.dataset, 'blapyAppear')) {
            el.dataset.blapyAppear = 'done'

            this.logger.info(`Element became visible: ${el.dataset.blapyContainerName}`, 'setBlapyUpdateOnDisplay')

            if (Object.hasOwn(el.dataset, 'blapyHref')) {
              this.myFSM.trigger('loadUrl', {
                aUrl: el.dataset.blapyHref,
                params: {},
                aObjectId: this.myUIObjectID,
                noBlapyData: el.dataset.blapyNoblapydata,
              })
            } else if (Object.hasOwn(el.dataset, 'blapyTemplateInit')) {
              const myContainerName = el.dataset.blapyContainerName
              this.myFSM.trigger('reloadBlock', {
                params: { embeddingBlockId: myContainerName },
              })
            }
          }
          observer.unobserve(el)
        }
      })
    }

    // Création de l'observer
    const observer = new IntersectionObserver(observerCallback, {
      root: null,          // viewport
      rootMargin: '0px',
      threshold: 0.1,       // déclenche quand 10% de l'élément est visible
    })

    // Observer chaque élément
    elements.forEach(el => {
      this.logger.info(`Observing element: ${el.dataset.blapyContainerName}`, 'setBlapyUpdateOnDisplay')
      observer.observe(el)
    })
  }

  embedHTMLPage(aHtmlSource: Element | string, aBlapyBlockIdName: string) {
    this.logger.info('embedHTML', 'core')

    const htmlBlapyBlock = this.myUIObject.querySelector<HTMLElement>('[data-blapy-container-name=\'' + aBlapyBlockIdName + '\']')

    if (!htmlBlapyBlock) {
      this.logger.error(`embedHtmlPage: Error on blapy-container-name... ${aBlapyBlockIdName} does not exist!`)
      return ''
    }

    if (htmlBlapyBlock.dataset.blapyUpdate === 'json' &&
      htmlBlapyBlock.dataset.blapyTemplateInitPurejson === '0') {
      try {
        if (aHtmlSource instanceof Element) {
          aHtmlSource = aHtmlSource.innerHTML
        }
      } catch (e) {

        this.logger.warn(`embedHtmlPage: aHtmlSource is perhaps a pure json after all...?\n${aHtmlSource.toString()} ${String(e)}`)
      }
    }

    const htmlString = typeof aHtmlSource === 'string' ? aHtmlSource : aHtmlSource.outerHTML
    const encodedSource = '<xmp class="blapybin">' + this.utils.utoa(htmlString) + '</xmp>'

    const tempElement = document.createElement('div')
    tempElement.innerHTML = htmlBlapyBlock.outerHTML;

    const newBlock = tempElement.firstElementChild as HTMLElement | null
    if (!newBlock) return

    newBlock.innerHTML = encodedSource

    const currentContent = newBlock.dataset.blapyContainerContent || ''
    newBlock.dataset.blapyContainerContent = currentContent + '-' + Date.now()

    newBlock.removeAttribute('id')

    return newBlock.outerHTML
  }

  private deepMerge(target: Record<string, any>, source: Record<string, any>) {
    for (const key in source) {
      if (
        source.hasOwnProperty(key) &&
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {}
        }
        this.deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    return target
  }


}

export function createBlapy(selector: string, options: BlapyOptions = {}) {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) {
    throw new Error(`Blapy: no element found for selector "${selector}"`)
  }
  return element.Blapy(options)
}