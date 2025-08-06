/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Blapy.js
 * Blapy : Main class for managing the Blapy V2 module
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview Main Blapy V2 class – primary manager of the module.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 *
 * How to use it:
 * ===============
 *
 * import { Blapy } from './Blapy.js';
 *
 * const myBlapy = new Blapy(document.getElementById('myContainer'), {
 *   debug: true,
 *   enableRouter: false
 * });
 *
 * -----------------------------------------------------------------------------------------
 *
 *  Edit :
 * - 30/07/25 - C.NELHOMME - V1.0 - Creation of the base version
 * - 06/08/25 - C.NELHOMME - V2.1 - Added websockets supports blapy can receive order by the websockets server.
 */

/*@Todo
  Test
  Build module
 */

import { Logger } from './Logger.js'
import { Utils } from './Utils.js'
import { TemplateManager } from './TemplateManager.js'
import { Router } from './Router.js'
import { BlapyBlock } from './BlapyBlock.js'
import { AjaxService } from './AjaxService.js'


/**
 * Main Blapy V2 class.
 *
 * This class is the modernized ES6 version of Blapy, designed to remain compatible
 * with the V1 `theBlapy` constructor while introducing a cleaner architecture,
 * a Finite State Machine (FSM), and modular services (Logger, AjaxService, TemplateManager, Router, etc.).
 *
 * @class Blapy
 * @version 2.0
 * @example
 * // Create a Blapy instance
 * const blapy = new Blapy('#app', {
 *   debug: true,
 *   logLevel: 3,
 *   enableRouter: true
 * });
 */

export class Blapy {

  /**
   * Initializes a Blapy instance.
   *
   * This is compatible with the `theBlapy` constructor from Blapy V1.
   *
   * The main container must be a valid DOM element with an `id`.
   * Blapy sets up internal services (Logger, AjaxService, TemplateManager, Router, etc.)
   * and configures its internal Finite State Machine (FSM).
   *
   * @class Blapy
   * @param {string|HTMLElement} element - The main container element or a selector string (must have an ID).
   * @param {Object} [options={}] - Configuration options.
   *
   * @param {boolean} [options.debug=false] - Enables debug mode for logging.
   * @param {number} [options.logLevel=2] - Logging verbosity (1: error, 2: warning, 3: notice).
   * @param {boolean} [options.alertError=false] - Shows browser alerts for critical errors.
   *
   * @param {boolean} [options.enableRouter=false] - Enables routing support.
   * @param {string} [options.routerRoot='/'] - The root path for the router.
   * @param {boolean} [options.routerHash=true] - Enables hash-based navigation for the router.
   *
   * @param {Function|null} [options.pageLoadedFunction=null] - Callback executed when a page is loaded.
   * @param {Function|null} [options.pageReadyFunction=null] - Callback executed when a page is ready.
   * @param {Function|null} [options.beforePageLoad=null] - Callback executed before loading a page.
   * @param {Function|null} [options.beforeContentChange=null] - Callback executed before content changes.
   * @param {Function|null} [options.afterContentChange=null] - Callback executed after content changes.
   * @param {Function|null} [options.afterPageChange=null] - Callback executed after page navigation.
   * @param {Function|null} [options.onErrorOnPageChange=null] - Callback executed when a page change fails.
   * @param {Function|null} [options.doCustomChange=null] - Callback executed for custom content changes.
   *
   * @param {Object|null} [options.fsmExtension=null] - Extensions or overrides for the internal FSM states.
   *
   * @param {number} [options.LogLevelIfsm=1] - Log level for the FSM (1: error, 2: warning, 3: notice).
   * @param {boolean} [options.debugIfsm=false] - Enables debug mode for FSM state transitions.
   *
   * @throws {Error} Throws an error if the element is not found, is not a valid DOM element, or has no ID.
   */

  constructor(element, options = {}) {

    // --- Element validation ---
    if (!element) {
      throw new Error('Blapy needs a valid DOM element')
    }

    // If it's a string, try to query the DOM element
    if (typeof element === 'string') {
      const foundElement = document.querySelector(element)
      if (!foundElement) {
        throw new Error(`Element not found: ${element}`)
      }
      element = foundElement
    }

    // Check that the element is a valid DOM element
    if (!(element instanceof HTMLElement)) {
      throw new Error('Blapy needs a valid DOM element')
    }

    // Check that the element has a valid ID
    if (!element.id) {
      throw new Error('Blapy needs an element with an ID')
    }

    this.container = element

    //Initialize options and callbacks
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
      websocketOptions: {},
    }


    this.opts = { ...this.defaults, ...options }
    this.optsIfsm = this.opts
    this.optsIfsm.debug = this.opts.debugIfsm

    this.optsIfsm.logLevel = this.opts.LogLevelIfsm


    if (typeof Blapymotion !== 'undefined') {
      console.log("test")
      this.animation = new Blapymotion()
    }

    this.myUIObject = this.container
    this.myUIObjectID = this.container.id

    //We instancied all services
    this.utils = new Utils()
    this.logger = new Logger(this.opts)
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
    this.blapyBlocks = new BlapyBlock(this.logger, this.templateManager, this.ajaxService)

    this.blapyBlocks.initializeBlocks(this.container)
    this.blapyBlocks.setBlapyInstance(this)

    this.myFSM = null

    //For IFSM
    this.opts.theBlapy = this

    //Not finished
    if (typeof BlapySocket !== 'undefined' && Object.keys(this.opts.websocketOptions).length > 0) {
      this.websocket = new BlapySocket({ ...this.opts.websocketOptions }, this)
    }

    this.logger.info(`Blapy instance (#${this.myUIObjectID}) created`, 'Blapy2 constructor')
  }

  /**
   * Initializes the Blapy application.
   *
   * This method sets up the Finite State Machine (FSM) for managing the
   * application states (PageLoaded, PreparePage, PageReady, etc.).
   * It also initializes the router and configures the event triggers
   * required for page updates.
   *
   * @async
   * @function initApplication
   * @returns {Promise<boolean>} A promise that resolves to `true` if the initialization is successful, or `false` otherwise.
   * @throws {Error} Throws an error if the FSM or router fails to initialize.
   */
  async initApplication() {
    this.logger.info('InitApplication', 'core')

    try {

      // Scenario of the FSM
      const managerBlapy = {
        PageLoaded: {
          enterState: {
            init_function: function () {

              // I didn’t have access to the instance, so I used the method below.
              this.opts.theBlapy.myFSM = this

              this.opts.theBlapy.logger.info('Page loaded', 'fsm')

              // Configure update intervals
              this.opts.theBlapy.blapyBlocks.setBlapyUpdateIntervals()

              if (this.opts.pageLoadedFunction) this.opts.pageLoadedFunction()
              this.opts.theBlapy.trigger('Blapy_PageLoaded')

            },
            next_state: 'PreparePage',
          },
        },
        PreparePage: {
          enterState: {
            init_function: function () {
            },
            propagate_event: 'setBlapyUrl',
          },
          setBlapyUrl: {
            init_function: function () {
              this.opts.theBlapy.setBlapyURL()
            },
            next_state: 'PreparePage_setBlapyJsonTemplates',
          },
        },
        PreparePage_setBlapyJsonTemplates: {
          enterState: {
            init_function: function () {
              this.opts.theBlapy.setBlapyJsonTemplates()
            },
            next_state: 'PreparePage_setBlapyUpdateOnDisplay',
          },
        },
        PreparePage_setBlapyUpdateOnDisplay: {
          blapyJsonTemplatesIsSet: {
            init_function: function () {
              this.opts.theBlapy.setBlapyUpdateOnDisplay()
            },
            next_state: 'PageReady',
          },

          reloadBlock: 'loadUrl',
          updateBlock: 'loadUrl',
          postData: 'loadUrl',
          loadUrl: // Someone tries to load an URL but the page is not ready... retry later.
          {
            how_process_event: {
              delay: 50,
              preventcancel: true,
            },
            propagate_event: true,
          },
        }, //setBlapyJsonTemplates state
        PageReady: {
          enterState: {
            init_function: function () {
              if (this.opts.pageReadyFunction) this.opts.pageReadyFunction()
              this.opts.theBlapy.trigger('Blapy_PageReady')
            },
          },
          loadUrl: {
            init_function: function (p, e, data) {
              data.method = 'GET'
              this.trigger('postData', data)
            },
          },

          postData: {
            init_function: function (p, e, data) {
              if (this.opts.beforePageLoad) this.opts.beforePageLoad(data)
              this.opts.theBlapy.trigger('Blapy_beforePageLoad', data)
            },
            out_function: function (p, e, data) {

              let aURL = data.aUrl
              let aObjectId = data.aObjectId ? data.aObjectId : e.currentTarget.id


              if ((aObjectId == undefined) && (typeof (e.currentTarget.attr) != 'undefined')) aObjectId = e.currentTarget[0].id

              if (!data.params) {
                data.params = {}
              }

              let params = JSON.parse(JSON.stringify(data.params))

              if (!params) {
                params = {
                  blapyaction: 'update',
                }

              } else if (!params.blapyaction) {
                params['blapyaction'] = 'update'
              }

              if (('embeddingBlockId' in params) && (!params.embeddingBlockId)) {
                this.opts.theBlapy.logger.error('[postData on ' + this.myUIObjectID + '] embeddingBlockId has been set but is undefined! must be an error...')
              }

              let aembeddingBlockId = params.embeddingBlockId

              if (aembeddingBlockId && params.templateId) {
                const elements = this.opts.theBlapy.myUIObject.querySelectorAll('[data-blapy-container-name=\'' + aembeddingBlockId + '\']')
                elements.forEach(el => {
                  el.setAttribute('data-blapy-template-default-id', params.templateId)
                })
              }

              let method = data.method
              if (!method) method = 'POST'

              params = Object.assign(params, {
                blapycall: '1',
                blapyaction: params.blapyaction,
                blapyobjectid: aObjectId,
              })

              const requestOptions = { method: method }


              if (method.toUpperCase() === 'GET') {
                requestOptions.params = params
              } else {
                requestOptions.body = params
              }

              this.opts.theBlapy.ajaxService.request(aURL, requestOptions)
                .then((response) => {
                  if (response) {

                    if (typeof response === 'object') {
                      response = JSON.stringify(response)
                    }

                    if (aembeddingBlockId) {
                      response = this.opts.theBlapy.embedHTMLPage(response, aembeddingBlockId)
                    }


                    this.trigger('pageLoaded', {
                      htmlPage: response,
                      params: params,
                    })
                  }
                })
                .catch((error) => {
                  this.trigger('errorOnLoadingPage', aURL + ': ' + error.message)
                })
            },
            next_state: 'ProcessPageChange',
          },
          updateBlock: {
            init_function: function (p, e, data) {
              if (this.opts.beforePageLoad) this.opts.beforePageLoad(data)
              this.opts.theBlapy.trigger('Blapy_beforePageLoad', data)
              if (!data?.html) {
                this.opts.theBlapy.logger.info('updateBlock: no html property found')
                this.trigger('errorOnLoadingPage', 'updateBlock: no html property found')
              }
            },
            out_function: function (p, e, data) {
              if (!data) return
              if (!data.params) data.params = {}

              if (('embeddingBlockId' in data.params) && (!data.params.embeddingBlockId)) {
                this.opts.theBlapy.logger.info(`[updateBlock on ${this.myUIObjectID} embeddingBlockId has been set but is undefined! must be an error...]`)
              }

              let aembeddingBlockId = data.params.embeddingBlockId

              if (typeof (data.html) == 'object') //then it's a json object
              {
                data.html = JSON.stringify(data.html)
              }

              //define template to use if given
              if (aembeddingBlockId && data.params.templateId) {
                const container = this.myUIObject.querySelector(
                  `[data-blapy-container-name='${aembeddingBlockId}']`,
                )

                if (container) {
                  container.setAttribute('data-blapy-template-default-id', data.params.templateId)
                }
              }

              if (aembeddingBlockId) data.html = this.opts.theBlapy.embedHTMLPage(data.html, aembeddingBlockId)

              this.trigger('pageLoaded', {
                htmlPage: data.html,
                params: data.params,
              })

            },
            next_state: 'ProcessPageChange',
          },
          reloadBlock: {
            init_function: function (p, e, data) {
              let params = {}
              if (data) params = data.params

              if (('embeddingBlockId' in params) && (!params.embeddingBlockId)) {
                this.opts.theBlapy.logger.info('[reloadBlock on ' + this.myUIObjectID + '] embeddingBlockId has been set but is undefined! must be an error...', 1)
              }

              this.opts.theBlapy.setBlapyJsonTemplates(true, params.embeddingBlockId, params.templateId)
              this.opts.theBlapy.setBlapyUpdateOnDisplay()
            },
          },
        },

        ProcessPageChange: {
          enterState: {},
          pageLoaded: {
            init_function: function (p, e, data) {

              let pageContent = data.htmlPage
              let params = data.params
              let aObjectId = params.blapyobjectid

              let myFSM = this
              let tmpPC = null

              //use JSON5 if present as JSON5.parse is more cool than JSON.parse (cf. https://github.com/json5/json5)
              let jsonFeatures = (typeof JSON5 !== 'undefined') ? JSON5 : JSON

              try {
                tmpPC = jsonFeatures.parse(pageContent)
                pageContent = tmpPC

                // if the received pageContent is pure json then build the equivalent in blapy block
                if (pageContent instanceof Array) {
                  let newContent = $('')
                  let tmpRes = ''
                  for (const element of pageContent) {
                    tmpRes = this.opts.theBlapy.createBlapyBlock(element)
                    newContent = newContent.add(tmpRes)
                  }

                  pageContent = newContent
                } else if (typeof (pageContent) === 'object') //then it's a json object? curious... should have been stringify previously
                {
                  pageContent = this.opts.theBlapy.createBlapyBlock(pageContent)

                } else {
                  // don't know what to do...? not normal to be here...
                  myFSM.opts.theBlapy.logger.info('downloaded content is not html neither json object, that\'s curious... ' + pageContent + ' - ' + containerName, 1)
                }

              } catch (e) {
                //not json input... but html...
              }


              switch (params['blapyaction']) {
                case 'update':
                default:

                  this.myUIObject[0].querySelectorAll('[data-blapy-container]').forEach(async (containerElement) => {

                    let myContainer = containerElement
                    let containerName = myContainer.getAttribute('data-blapy-container-name')

                    if (!params['force-update']) params['force-update'] = 0
                    let aBlapyContainer = null
                    try {

                      // Chercher le container correspondant dans la réponse
                      aBlapyContainer = $(pageContent)
                        .filter('[data-blapy-container-name="' + containerName + '"]')
                        .add($(pageContent)
                          .find('[data-blapy-container-name="' + containerName + '"]'),
                        ).first()

                    } catch (e) {
                      this.opts.theBlapy.logger.error(e)
                      return
                    }

                    if (!aBlapyContainer || aBlapyContainer.length === 0) {
                      return
                    } else if (aBlapyContainer.attr('data-blapy-applyon') != undefined) {
                      //if the container specifies the accepted applications and we're not processing the correct one (aObjectId), then exit
                      let aListOfApplications = aBlapyContainer.attr('data-blapy-applyon').split(',')
                      if ((aListOfApplications.length > 0) &&
                        ($.inArray(aObjectId, aListOfApplications) == -1)
                      ) return

                    }

                    aBlapyContainer = aBlapyContainer.get(0)


                    // Mise à jour de l'ID si nécessaire
                    if (!myContainer.id) {
                      myFSM.opts.theBlapy.logger.warn('A blapy block has no id: ' + myContainer.outerHTML.substring(0, 250))
                    }
                    if (!aBlapyContainer.id) {
                      aBlapyContainer.id = myContainer.id
                    }

                    // Déterminer le type de mise à jour
                    let dataBlapyUpdate = aBlapyContainer.getAttribute('data-blapy-update')


                    let dataBlapyUpdateRuleIsLocal = false

                    if ((myContainer.getAttribute('data-blapy-update-rule') === 'local') ||
                      ((dataBlapyUpdate === 'json') && (myContainer.getAttribute('data-blapy-update') !== 'json'))) {
                      dataBlapyUpdate = myContainer.getAttribute('data-blapy-update')
                      dataBlapyUpdateRuleIsLocal = true

                    }

                    // Gérer les containers embed en xmp
                    let tmpContainer = aBlapyContainer.querySelector('xmp.blapybin')

                    if ((dataBlapyUpdate !== 'json') && tmpContainer) {
                      aBlapyContainer.innerHTML = this.opts.theBlapy.utils.atou(tmpContainer.innerHTML)

                    }

                    if (myFSM.opts.beforeContentChange) {
                      myFSM.opts.beforeContentChange(myContainer)
                    }
                    myContainer.dispatchEvent(new CustomEvent('Blapy_beforeContentChange', {
                      detail: this.myUIObject,
                    }))

                    if (!dataBlapyUpdate || dataBlapyUpdate === 'update') {
                      // Mise à jour standard
                      if (aBlapyContainer.getAttribute('data-blapy-container-content') !== myContainer.getAttribute('data-blapy-container-content') ||
                        (params['force-update'] == 1)) {

                        if (dataBlapyUpdateRuleIsLocal) {
                          myContainer.innerHTML = aBlapyContainer.innerHTML
                        } else {
                          myContainer.outerHTML = aBlapyContainer.outerHTML
                        }
                        myContainer = aBlapyContainer
                      }
                    } else if (dataBlapyUpdate === 'force-update') {
                      // Force update
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                      }
                      myContainer = aBlapyContainer
                    } else if (dataBlapyUpdate === 'append') {
                      // Append
                      aBlapyContainer.insertAdjacentHTML('afterbegin', myContainer.innerHTML)
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                      }
                      myContainer = aBlapyContainer
                    } else if (dataBlapyUpdate === 'prepend') {
                      // Prepend
                      aBlapyContainer.insertAdjacentHTML('beforeend', myContainer.innerHTML)
                      if (dataBlapyUpdateRuleIsLocal) {
                        myContainer.innerHTML = aBlapyContainer.innerHTML
                      } else {
                        myContainer.outerHTML = aBlapyContainer.outerHTML
                      }
                      myContainer = aBlapyContainer
                    } else if (dataBlapyUpdate === 'json-append') {
                      let currentJsonData = myContainer.getAttribute('data-blapy-json-data');
                      let currentData = [];

                      if (currentJsonData) {
                        try {
                          currentData = jsonFeatures.parse(currentJsonData);
                          if (!Array.isArray(currentData)) {
                            currentData = [currentData];
                          }
                        } catch (e) {
                          myFSM.opts.theBlapy.logger.warn('Could not parse existing JSON data, starting fresh', 'json-append');
                          currentData = [];
                        }
                      }

                      let newJsonData = null;

                      if (tmpContainer) {
                        try {
                          const encodedData = tmpContainer.innerHTML;
                          const decodedData = myFSM.opts.theBlapy.utils.atou(encodedData);
                          newJsonData = jsonFeatures.parse(decodedData);
                        } catch (e) {
                          myFSM.opts.theBlapy.logger.error('Failed to decode/parse new JSON data', 'json-append');
                          return;
                        }
                      } else {
                        try {
                          const htmlContent = aBlapyContainer.innerHTML;
                          newJsonData = jsonFeatures.parse(htmlContent);
                        } catch (e) {
                          myFSM.opts.theBlapy.logger.error('Failed to parse new JSON data', 'json-append');
                          return;
                        }
                      }

                      if (newJsonData && newJsonData['blapy-data']) {
                        newJsonData = newJsonData['blapy-data'];
                      }

                      let mergedData = [];

                      const appendStrategy = myContainer.getAttribute('data-blapy-json-append-strategy') || 'end';

                      if (appendStrategy === 'start') {
                        if (Array.isArray(newJsonData)) {
                          mergedData = [...newJsonData, ...currentData];
                        } else {
                          mergedData = [newJsonData, ...currentData];
                        }
                      } else if (appendStrategy === 'unique') {
                        const uniqueKey = myContainer.getAttribute('data-blapy-json-unique-key') || 'id';
                        mergedData = [...currentData];

                        const newItems = Array.isArray(newJsonData) ? newJsonData : [newJsonData];
                        for (const newItem of newItems) {
                          const exists = mergedData.some(item =>
                            item[uniqueKey] && newItem[uniqueKey] && item[uniqueKey] === newItem[uniqueKey]
                          );
                          if (!exists) {
                            mergedData.push(newItem);
                          }
                        }
                      } else {
                        if (Array.isArray(newJsonData)) {
                          mergedData = [...currentData, ...newJsonData];
                        } else {
                          mergedData = [...currentData, newJsonData];
                        }
                      }

                      const maxItems = parseInt(myContainer.getAttribute('data-blapy-json-max-items'));
                      if (maxItems && maxItems > 0 && mergedData.length > maxItems) {
                        if (appendStrategy === 'start') {
                          mergedData = mergedData.slice(0, maxItems);
                        } else {
                          mergedData = mergedData.slice(-maxItems);
                        }
                      }

                      myContainer.setAttribute('data-blapy-json-data', JSON.stringify(mergedData));

                      const tempBlapyContainer = aBlapyContainer.cloneNode(true);
                      tempBlapyContainer.innerHTML = JSON.stringify(mergedData);

                      await myFSM.opts.theBlapy.templateManager.processJsonUpdate(
                        null,
                        myContainer,
                        tempBlapyContainer,
                        jsonFeatures,
                        myFSM.opts.theBlapy
                      );

                      myContainer.dispatchEvent(new CustomEvent('Blapy_jsonAppended', {
                        detail: {
                          newItems: Array.isArray(newJsonData) ? newJsonData.length : 1,
                          totalItems: mergedData.length,
                          data: mergedData
                        }
                      }));


                      myFSM.opts.theBlapy.logger.info(
                        `JSON Append completed: added ${Array.isArray(newJsonData) ? newJsonData.length : 1} items, total: ${mergedData.length}`,
                        'json-append'
                      );

                    } else if (dataBlapyUpdate === 'replace') {
                      // Replace
                      myContainer.innerHTML = aBlapyContainer.innerHTML
                      myContainer = aBlapyContainer
                    } else if (dataBlapyUpdate === 'custom') {
                      // Custom update
                      if (aBlapyContainer.getAttribute('data-blapy-container-content') !== myContainer.getAttribute('data-blapy-container-content') ||
                        (params['force-update'] == 1)) {

                        if (myFSM.opts.doCustomChange) {
                          myFSM.opts.doCustomChange(myContainer, aBlapyContainer)
                        }
                        myContainer.dispatchEvent(new CustomEvent('Blapy_doCustomChange', {
                          detail: aBlapyContainer,
                        }))
                      }
                    } else if (dataBlapyUpdate === 'remove') {
                      // Remove
                      let myContainerParent = myContainer.parentNode
                      myContainer.remove()
                      myContainer = myContainerParent
                    } else if (dataBlapyUpdate === 'json') {
                      await myFSM.opts.theBlapy.templateManager.processJsonUpdate(tmpContainer, myContainer, aBlapyContainer, jsonFeatures, this.opts.theBlapy)

                    } else {
                      // Plugin custom

                      let pluginUpdateFunction = myFSM.opts.theBlapy.animation[dataBlapyUpdate]
                      if (pluginUpdateFunction && typeof pluginUpdateFunction === 'function') {
                        if (aBlapyContainer.getAttribute('data-blapy-container-content') !== myContainer.getAttribute('data-blapy-container-content') ||
                          (params['force-update'] == 1) ||
                          aBlapyContainer.getAttribute('data-blapy-container-force-update') === 'true') {

                          pluginUpdateFunction(myContainer, aBlapyContainer)
                        }
                      } else {
                        myFSM.opts.theBlapy.logger.error(`${dataBlapyUpdate} does not exist`)
                      }
                    }

                    // Reconfigurer les intervalles et la visibilité
                    myFSM.opts.theBlapy.blapyBlocks.setBlapyUpdateIntervals()
                    myFSM.opts.theBlapy.setBlapyUpdateOnDisplay()
                    myFSM.opts.theBlapy.setBlapyURL()

                    // Événements after content change
                    if (myFSM.opts.afterContentChange) {
                      myFSM.opts.afterContentChange(myContainer)
                    }
                    if (myContainer.id) {
                      let updatedElement = document.getElementById(myContainer.id)
                      if (updatedElement) {
                        updatedElement.dispatchEvent(new CustomEvent('Blapy_afterContentChange', {
                          detail: myContainer,
                        }))
                      }
                    }
                  })
                  break
              }
            },
            out_function: function (p, e, data) {
              // Événement final
              if (this.opts.afterPageChange) {
                this.opts.afterPageChange()
              }
              this.opts.theBlapy.trigger('Blapy_afterPageChange', data)
            },
            next_state: 'PageReady',
          },
          errorOnLoadingPage: {
            init_function: function (p, e, data) {
              if (this.opts.onErrorOnPageChange) this.opts.onErrorOnPageChange(data)
              this.opts.theBlapy.trigger('Blapy_ErrorOnPageChange', [data])
            },
            next_state: 'PageReady',
          },
          reloadBlock: 'loadUrl',
          updateBlock: 'loadUrl',
          postData: 'loadUrl',
          loadUrl:
          {
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
        this._deepMerge(managerBlapy, this.opts.fsmExtension)
      }

      $(this.myUIObject).iFSM(managerBlapy, this.optsIfsm)
      this.myFSM = $(this.myUIObject).getFSM(managerBlapy)


      if (!this.router.init()) {
        this.logger.error('Failed to initialize router', 'core')
        return false
      }

      return true

    } catch (error) {
      this.logger.error(`Failed to initialize application: ${error.message}`, 'core')
      return false
    }
  }

  /**
   * Dispatches a custom event on the main UI element.
   *
   * It creates and dispatches a `CustomEvent` with the given name
   * and optional data payload, allowing other components to listen
   * and react to the event.
   *
   * @param {string} eventName - The name of the event to dispatch.
   * @param {Object} [data=null] - Additional data passed with the event (accessible via `event.detail`).
   */
  trigger(eventName, data = null) {
    this.logger.info(`[Sending event] ${eventName} - Diffused`)
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
    })
    this.myUIObject.dispatchEvent(event)
  }

  /**
   * Updates all elements marked as "blapy links" by appending the "#blapylink" fragment to their URL.
   *
   * - If Navigo (the router) is enabled, the method exits early and lets Navigo handle the navigation.
   * - Otherwise, it updates the `href`, `action`, or `data-blapy-href` attributes of links and forms
   *   to ensure they trigger Blapy's FSM when clicked.
   * - It also attaches click listeners on non-`<a>` elements to trigger FSM events.
   *
   * @function setBlapyURL
   */
  setBlapyURL() {
    this.logger.info('Set blapyURL', 'router')

    const blapyLinks = this.container.querySelectorAll('[data-blapy-link]')

    blapyLinks.forEach((bL) => {
      if (this._shouldSkipLink(bL)) return

      let aHref = this._getHref(bL)
      if (!aHref) return

      aHref = this._normalizeHref(aHref, bL)

      this._updateHref(bL, aHref)
    })
  }

  _shouldSkipLink(bL) {
    const activeIdAttr = bL.getAttribute('data-blapy-active-blapyId')
    return activeIdAttr && activeIdAttr !== this.myUIObjectID
  }

  _getHref(bL) {
    switch (bL.tagName) {
      case 'A':
        return bL.getAttribute('href')
      case 'FORM':
        return bL.getAttribute('action')
      default:
        return bL.getAttribute('data-blapy-href')
    }
  }

  _normalizeHref(href, bL) {
    if (!href.includes('#blapylink')) {
      href += '#blapylink'

      const blockId = bL.getAttribute('data-blapy-embedding-blockid')
      if (blockId) {
        href += `#${blockId}`
      }
    }

    const isCustom = bL.tagName !== 'A' && bL.tagName !== 'FORM'
    if (isCustom && !href.startsWith('/') && !/^https?:\/\//i.test(href)) {
      const baseHref = document.querySelector('base')?.getAttribute('href')
      href = baseHref
        ? baseHref + href
        : window.location.pathname.replace(/[^/]*$/, '') + href
    }

    return href
  }

  _updateHref(bL, href) {
    switch (bL.tagName) {
      case 'A':
        bL.setAttribute('href', href)
        break
      case 'FORM':
        bL.setAttribute('action', href)
        break
      default:
        bL.setAttribute('data-blapy-href', href)
        bL.addEventListener('click', () => {
          this.myFSM.trigger('loadUrl', {
            aUrl: href,
            params: {},
            aObjectId: this.myUIObjectID,
          })
        })
    }
  }

  /**
   * - If the router (Navigo) is enabled and initialized, it will handle the navigation.
   * - Otherwise, it falls back to the Blapy FSM system and triggers a `loadUrl` event.
   *
   * @param {string} url - The destination URL.
   * @param {Object} [options={}] - Additional navigation options.
   * @param {Object} [options.params] - Query parameters or payload for the navigation.
   * @param {boolean} [options.noBlapyData] - If `true`, prevents Blapy data processing.
   */
  navigate(url, options = {}) {
    if (this.opts.enableRouter && this.router.isInitialized) {
      // Use the router (Navigo) for navigation
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

  /**
   * Embeds an HTML source into a specific Blapy block.
   *
   * This method takes an HTML string or DOM element and inserts it into a Blapy block
   * identified by its `data-blapy-container-name` attribute.
   *
   * If the target block uses JSON templates, the content will be encoded as a base64 string
   * inside an `<xmp class="blapybin">` tag before being injected.
   *
   * @param {string|Element} aHtmlSource - The HTML content or DOM element to embed.
   * @param {string} aBlapyBlockIdName - The name of the target Blapy block (data-blapy-container-name).
   * @returns {string} The resulting embedded HTML source as a string.
   *
   * @throws {Error} Logs an error if the specified Blapy block does not exist.
   */
  embedHTMLPage(aHtmlSource, aBlapyBlockIdName) {
    this.logger.info('embedHTML', 'core')

    const htmlBlapyBlock = this.myUIObject.querySelector('[data-blapy-container-name=\'' + aBlapyBlockIdName + '\']')

    if (!htmlBlapyBlock) {
      this.logger.error(`embedHtmlPage: Error on blapy-container-name... ${aBlapyBlockIdName} does not exist!`)
      return ''
    }

    if (htmlBlapyBlock.getAttribute('data-blapy-update') === 'json' &&
      htmlBlapyBlock.getAttribute('data-blapy-template-init-purejson') === '0') {
      try {
        if (aHtmlSource instanceof Element) {
          aHtmlSource = aHtmlSource.innerHTML
        }
      } catch (e) {
        this.logger.warn(`embedHtmlPage: aHtmlSource is perhaps a pure json after all...?\n${aHtmlSource.toString()} ${e}`)
      }
    }

    const encodedSource = '<xmp class="blapybin">' + this.utils.utoa(aHtmlSource) + '</xmp>'

    const tempElement = document.createElement('div')
    tempElement.innerHTML = htmlBlapyBlock.outerHTML
    const newBlock = tempElement.firstElementChild

    newBlock.innerHTML = encodedSource

    const currentContent = newBlock.getAttribute('data-blapy-container-content') || ''
    newBlock.setAttribute('data-blapy-container-content', currentContent + '-' + Date.now())

    newBlock.removeAttribute('id')

    return newBlock.outerHTML
  }

  /**
   * setBlapyJsonTemplates - prepare the json templates of the blapy blocks controlled with json (cf [data-blapy-update="json"])
   * json templates are stored in a hidden xmp with a "data-blapy-container-tpl" attribute set
   *
   * @param  boolean forceReload reload initial json content
   * @param  string (option/default:undefined) aEmbeddingBlock a specific block container name
   * @param  string (option/default:undefined) aTemplateId     default template to set on the block
   * @return void
   */
  async setBlapyJsonTemplates(forceReload, aEmbeddingBlock, aTemplateId) {

    this.logger.info('setBlapyJsonTemplates', 'core')

    if (forceReload == undefined) forceReload = false

    if (aEmbeddingBlock) {
      aEmbeddingBlock = `[data-blapy-container-name='${aEmbeddingBlock}']`
    } else {
      aEmbeddingBlock = ''
    }

    if (aTemplateId) {
      const selector = '[data-blapy-update="json"]' + aEmbeddingBlock
      const targets = this.container.querySelectorAll(selector) // ← SOLUTION


      targets.forEach(target => {
        target.setAttribute('data-blapy-template-default-id', aTemplateId)
      })
    }

    let jsonBlocks = this.container.querySelectorAll('[data-blapy-update="json"]' + aEmbeddingBlock)
    if (jsonBlocks.length > 0) {

      for (const c of jsonBlocks) {
        await this.templateManager.setBlapyContainerJsonTemplate(c, this, forceReload)
      }

      this.myFSM.trigger('blapyJsonTemplatesIsSet')
    } else {
      this.myFSM.trigger('blapyJsonTemplatesIsSet')
    }

  }

  /**
   * Sets up automatic updates for Blapy blocks when they appear in the viewport.
   *
   * This method uses the `IntersectionObserver` API to detect when elements marked with
   * `data-blapy-updateblock-ondisplay` become visible to the user.
   *
   * When an element becomes visible:
   * - If it has a `data-blapy-href`, a `loadUrl` event is triggered to fetch new content.
   * - If it has a `data-blapy-template-init`, a `reloadBlock` event is triggered to reload its content.
   *
   * @async
   * @function setBlapyUpdateOnDisplay
   * @returns {Promise<void>} Resolves when all observers have been set up.
   *
   * @throws {Error} Alerts if `IntersectionObserver` is not supported by the browser.
   */
  async setBlapyUpdateOnDisplay() {
    this.logger.info('setBlapyUpdateOnDisplay', 'core')

    const elements = this.myUIObject.querySelectorAll('[data-blapy-updateblock-ondisplay]')
    if (elements.length === 0) return

    if (!('IntersectionObserver' in window)) {
      alert('Blapy: IntersectionObserver is not supported. Need it to process data-blapy-updateblock-ondisplay option')
      return
    }

    const myBlapy = this

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          if (!el.hasAttribute('data-blapy-appear')) {
            el.setAttribute('data-blapy-appear', 'done')

            this.logger.info(`Element became visible: ${el.getAttribute('data-blapy-container-name')}`, 'setBlapyUpdateOnDisplay')

            if (el.hasAttribute('data-blapy-href')) {
              myBlapy.myFSM.trigger('loadUrl', {
                aUrl: el.getAttribute('data-blapy-href'),
                params: {},
                aObjectId: myBlapy.myUIObjectID,
                noBlapyData: el.getAttribute('data-blapy-noblapydata'),
              })
            } else if (el.hasAttribute('data-blapy-template-init')) {
              const myContainerName = el.getAttribute('data-blapy-container-name')
              myBlapy.myFSM.trigger('reloadBlock', {
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
      this.logger.info(`Observing element: ${el.getAttribute('data-blapy-container-name')}`, 'setBlapyUpdateOnDisplay')
      observer.observe(el)
    })
  }

  /**
   * Creates a Blapy block from a JSON object.
   *
   * This method converts a JSON structure into a `<div>` element with Blapy-specific
   * data attributes (`data-blapy-container`, `data-blapy-container-name`, etc.).
   *
   * The content of the `blapy-data` field is stringified and inserted as the block's inner HTML.
   * This allows Blapy to dynamically render or update blocks based on JSON data.
   *
   * @param {Object} aJsonObject - The JSON object used to create the Blapy block.
   * @param {string} aJsonObject.blapy-container-name - The unique name of the Blapy container.
   * @param {string} aJsonObject.blapy-container-content - The content identifier of the Blapy container.
   * @param {Object} aJsonObject.blapy-data - The data payload for the Blapy block.
   *
   * @returns {jQuery} A jQuery-wrapped `<div>` element representing the Blapy block.
   *
   * @throws {Error} Logs an error if `blapy-container-name` is missing in the JSON object.
   *
   */
  createBlapyBlock(aJsonObject) {

    if (!aJsonObject['blapy-container-name']) {
      this._log('createBlapyBlock: Error on received json where blapy-container-name is not defined!\nPerhaps it\'s pure json not defined as such in Blapy block configuration (cf. data-blapy-template-init-purejson)...\n' + JSON.stringify(aJsonObject), 1)
    }

    let htmlBlapyBlock = $('<div/>', {
      'data-blapy-container': true,
      'data-blapy-container-name': aJsonObject['blapy-container-name'],
      'data-blapy-container-content': aJsonObject['blapy-container-content'],
      'data-blapy-update': 'json',
    }).html(JSON.stringify(aJsonObject['blapy-data']))

    return htmlBlapyBlock
  }

  _deepMerge(target, source) {
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
        this._deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    return target
  }
}


/**
 * @param {string|HTMLElement} selector - A DOM selector or element
 * @param {Object} [options] - Configuration options
 * @returns {Blapy} A Blapy instance
 */
export function createBlapy(selector, options = {}) {
  const element = document.querySelector(selector)
  return element.Blapy(options)
}


export default Blapy