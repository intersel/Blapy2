/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : core/TemplateManager.js
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview Gestionnaire de templates pour Blapy2
 * @see {@link https://github.com/intersel/blapy2}
 * @author : Corentin NELHOMME — corentin.nelhomme@intersel.fr
 * @version : 1.0.0
 * @license : DonationWare — see https://github.com/intersel//blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 **/

export class TemplateManager {
  /**
   * Creates a new instance of the class.
   *
   * Initializes the logger, AJAX service, utility functions,
   * template storage
   *
   * @constructor
   *
   * @param {Logger} logger - The logging service instance.
   * @param {AjaxService} ajaxService - The AJAX service for data requests.
   * @param {Utils} utils - Utility functions used across the class.
   */
  constructor(logger, ajaxService, utils) {
    this.logger = logger
    this.ajaxService = ajaxService
    this.utils = utils
    this.templates = new Map()
  }


  /**
   * Loads and initializes a JSON template into a Blapy container.
   *
   * @async
   * @function setBlapyContainerJsonTemplate
   *
   * @param {HTMLElement} container - The container element where the template will be applied.
   * @param {Blapy} blapy - The Blapy instance managing the container.
   * @param {boolean} [forceReload=false] - Whether to force the template reload.
   *
   * @returns {Promise<void>} Resolves when the template is successfully initialized.
   */
  async setBlapyContainerJsonTemplate(container, blapy, forceReload = false) {
    this.logger.info('setBlapyContainerJsonTemplate', 'template manager')
    container.setAttribute('data-blapy-update-rule', 'local')

    let htmlTpl = Array.from(container.children).filter((child) =>
      child.hasAttribute('data-blapy-container-tpl'),
    )

    let htmlTplContent = container.innerHTML

    if (htmlTpl.length === 0) {
      try {
        const tempElement = document.createElement('div')
        tempElement.innerHTML = htmlTplContent.trim()
        const firstChild = tempElement.firstElementChild

        if (firstChild && firstChild.tagName === 'XMP') {
          htmlTplContent = firstChild.innerHTML
        }
      } catch (e) {
        this.logger.error(
          'htmlTplContent from ' +
          container.id +
          ' is not html template...?\n' +
          htmlTplContent,
        )
      }

      if (
        htmlTplContent
          .replace(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, '')
          .replace(/\s{2,}/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/(\r\n|\n|\r)/g, '')
          .replace(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, '')
          .trim() == ''
      ) {
        let tplFile = container.getAttribute('data-blapy-template-file')

        let blapyData =
          container.getAttribute('data-blapy-noblapydata') == '1'
            ? ''
            : 'blapycall=1&blapyaction=loadTpl&blapyobjectid=' +
            container.getAttribute('id')

        if (tplFile && !this.templates.has(tplFile)) {
          htmlTplContent = await this.ajaxService.get(tplFile, {
            params: blapyData,
          })
          htmlTplContent = htmlTplContent
            .replace(/<!--(.*?)-->/gm, '')
            .replaceAll('\n\n', '\n')
            .replaceAll('\t\t', '\t')

          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = htmlTplContent.trim()

          if (!tempDiv.firstElementChild || tempDiv.firstElementChild.tagName.toLowerCase() !== 'xmp') {
            htmlTplContent =
              '<xmp style="display:none" data-blapy-container-tpl="true">' +
              htmlTplContent +
              '</xmp>'
            container.innerHTML = htmlTplContent
          } else {
            container.innerHTML = htmlTplContent
          }

          this.templates.set(tplFile, htmlTplContent)

          this._initializeJsonBlock(container, false, blapy)
        } else if (tplFile && this.templates.has(tplFile)) {
          this.logger.info('The templates use cache memory')
          container.innerHTML = this.templates.get(tplFile)
          this._initializeJsonBlock(container, false, blapy)
        } else {
          this._initializeJsonBlock(container, false, blapy)
        }
      } else {
        let tmpHtmlContent = htmlTplContent
          .replace(/{{(.*?)}}/gm, '')
          .split('script')
          .join('scriptblapy')
          .split('img')
          .join('imgblapy')

        if (tmpHtmlContent.tagName !== 'xmp') {
          htmlTplContent =
            '<xmp style="display:none" data-blapy-container-tpl="true">' +
            htmlTplContent +
            '</xmp>'
          container.innerHTML = htmlTplContent
        } else {
          container.innerHTML = htmlTplContent
        }
        this._initializeJsonBlock(container, false, blapy)
      }
    } else if (forceReload) {
      this._initializeJsonBlock(container, true, blapy)
    }
  }

  getObjects(obj, key, val) {
    let objects = []
    for (let i in obj) {
      if (!obj.hasOwnProperty(i)) continue
      if (typeof obj[i] == 'object') {
        objects = objects.concat(this.getObjects(obj[i], key, val))
      } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      if (i == key && obj[i] == val || i == key && val == '') { //
        objects.push(obj)
      } else if (obj[i] == val && key == '') {
        //only add if the object is not already in the array
        if (objects.lastIndexOf(obj) == -1) {
          objects.push(obj)
        }
      }
    }
    return objects
  }

  /**
   * Initializes a JSON-based template block by fetching its initial data (if specified)
   * and triggers the `Blapy_templateReady` event once the template is prepared.
   *
   * @function _initializeJsonBlock
   *
   * @param {HTMLElement} container - The container element associated with the JSON template.
   * @param {boolean} [forceReload=false] - Whether to force data reload even if already displayed.
   * @param {*} [blapy=blapy] - The Blapy instance managing the templates and events.
   *
   * @returns {void} This function does not return a value.
   */
  _initializeJsonBlock(container, forceReload = false, blapy = blapy) {
    this.logger.info('_initializeJsonBlock', 'template manager')

    const containerName = container.getAttribute('data-blapy-container-name')
    const initURL = container.getAttribute('data-blapy-template-init')

    let jsonFeatures = null
    if (typeof JSON5 == 'undefined') jsonFeatures = JSON
    else jsonFeatures = JSON5

    //do we have to get the data only when block is displayed?
    if (
      !forceReload &&
      container.getAttribute('data-blapy-updateblock-ondisplay') &&
      container.getAttribute('data-blapy-appear') !== 'done'
    ) {
      return
    }

    let aInitURL = container.getAttribute('data-blapy-template-init')
    if (aInitURL) {

      let aInitURL_Param = container.getAttribute(
        'data-blapy-template-init-params',
      )
      if (aInitURL_Param != undefined)
        aInitURL_Param = jsonFeatures.parse(aInitURL_Param)
      else aInitURL_Param = {}

      let aInitURL_EmbeddingBlockId = container.getAttribute(
        'data-blapy-template-init-purejson',
      )

      if (aInitURL_EmbeddingBlockId !== '0') {
        aInitURL_Param = {
          ...aInitURL_Param,
          embeddingBlockId: container.getAttribute('data-blapy-container-name'),
        }
      }

      let noBlapyData = container.getAttribute('data-blapy-noblapydata')
      if (noBlapyData == undefined) noBlapyData = '0'

      let aInitURL_Method = container.getAttribute(
        'data-blapy-template-init-method',
      )
      if (aInitURL_Method == undefined) aInitURL_Method = 'GET'

      blapy.myFSM.trigger('postData', {
        aUrl: aInitURL,
        params: aInitURL_Param,
        method: aInitURL_Method,
        noBlapyData: noBlapyData,
      })
    } else {
    }

    if (container.id) {
      blapy.trigger('Blapy_templateReady', { detail: container })
    }
  }

  /**
   * Processes and updates a container's HTML content using JSON data and templates.
   *
   * @async
   * @function processJsonUpdate
   *
   * @param {*} tmpContainer - A temporary container holding encoded JSON data.
   * @param {HTMLElement} myContainer - The target container where the final HTML will be injected.
   * @param {*} aBlapyContainer - The Blapy container holding JSON or HTML content.
   * @param {*} jsonFeatures - A JSON parser object (e.g., JSON or JSON5).
   *
   * @returns {Promise<void>} Resolves once the JSON data has been processed and the HTML content is updated.
   */
  async processJsonUpdate(
    tmpContainer,
    myContainer,
    aBlapyContainer,
    jsonFeatures,
    Blapy,
  ) {


    try {
      const jsonDataObj = await this._extractAndParseJsonData(
        tmpContainer,
        aBlapyContainer,
        jsonFeatures,
      )

      const containerName = myContainer.getAttribute('data-blapy-container-name')

      if (!jsonDataObj) return

      const processedData = this._applyDataTransformations(
        jsonDataObj,
        myContainer,
        jsonFeatures,
      )


      const template = this._getTemplate(myContainer)


      if (!template) return

      const generatedHtml = this._generateHtml(
        processedData,
        template,
        myContainer,
      )



      this._injectFinalHtml(generatedHtml, myContainer, Blapy, template)

    } catch (error) {
      this.logger.error(
        `Erreur dans processJsonUpdate: ${error.message}`,
        'templateManager',
      )
    }
  }

  /**
   * Extracts and parses JSON data from the given containers.
   *
   * @async
   * @private
   * @function _extractAndParseJsonData
   *
   * @param {*} tmpContainer - A temporary container that may contain encoded JSON data.
   * @param {HTMLElement} aBlapyContainer - The Blapy container with JSON or HTML data.
   * @param {*} jsonFeatures - A JSON parser (e.g., JSON or JSON5).
   *
   * @returns {Promise<*>} The parsed JSON object, or `null` if parsing fails.
   */
  async _extractAndParseJsonData(tmpContainer, aBlapyContainer, jsonFeatures) {
    this.logger.info('_extractAndParseJsonData', 'templateManager')

    let jsonData = tmpContainer
      ? this.utils.atou($(tmpContainer).html())
      : $(aBlapyContainer).html()

    jsonData = jsonData.trim().replace(/(\r\n|\n|\r)/g, '')

    try {
      const jsonDataObj = jsonFeatures.parse(jsonData)
      return this._extractBlapyData(jsonDataObj, aBlapyContainer)
    } catch (e) {
      this.logger.warn('Premier parsing échoué, tentative d\'extraction HTML', 'templateManager')

      try {
        jsonData = $(jsonData).html()

        const cleanedData = jsonData.replace(/(\r\n|\n|\r)/g, '')
        const jsonDataObj = jsonFeatures.parse(cleanedData)

        return this._extractBlapyData(jsonDataObj, aBlapyContainer)
      } catch (e2) {

        this.logger.error('Parsing impossible même après extraction HTML' + jsonData, 'templateManager')
        throw new Error('Parsing JSON impossible')
      }
    }
  }

  /**
   * Parses JSON data with a retry mechanism in case of parsing failure.
   *
   * @private
   * @function _parseJsonWithRetry
   *
   * @param {string} jsonData - The raw JSON string to parse.
   * @param {*} jsonFeatures - A JSON parser (e.g., JSON or JSON5).
   *
   * @returns {*} The parsed JSON object, or throws an error if parsing fails.
   *
   * @throws {Error} Throws an error if the JSON cannot be parsed after retry.


   _parseJsonWithRetry(jsonData, jsonFeatures) {
   this.logger.info("_parseJsonWithRetry", "templateManager")
   try {
   const jsonDataObj = jsonFeatures.parse(jsonData);
   return this._extractBlapyData(jsonDataObj);
   } catch (e) {
   this.logger.warn(
   "downloaded content can not be evaluated, so is not json data:" +
   jsonData,
   "templateManager",
   );


   try {
   const cleanedData = jsonData.replace(/(\r\n|\n|\r)/g, "");
   const jsonDataObj = jsonFeatures.parse(cleanedData);
   this.logger.info(
   "use of sub text to get json data: " + cleanedData,
   "templateManager",
   );
   return this._extractBlapyData(jsonDataObj);
   } catch (e2) {
   this.logger.error(
   "try the subtext but content can not be evaluated either, so is not json data: " +
   jsonData,
   "templateManager",
   );
   throw new Error("Parsing JSON impossible");
   }
   }
   }
   */

  /**
   * Extracts Blapy-specific data from a JSON object if present.
   *
   * @private
   * @function _extractBlapyData
   *
   * @param {Object} jsonDataObj - The parsed JSON object.
   *
   * @returns {Object|null} The `blapy-data` object if found, otherwise the original JSON object or `null` if the container name does not match.
   */
  _extractBlapyData(jsonDataObj, container = null) {
    this.logger.info('_extractBlapyData', 'templateManager')

    if (jsonDataObj['blapy-data'] && jsonDataObj['blapy-container-name']) {
      const containerName = container?.getAttribute?.('data-blapy-container-name')

      if (containerName && jsonDataObj['blapy-container-name'] != containerName) {
        this.logger.warn(
          'blapy-data set: ' +
          JSON.stringify(jsonDataObj) +
          '\n but not match with containerName ' +
          containerName,
        )
        return null
      }
      return jsonDataObj['blapy-data']
    }
    return jsonDataObj
  }

  /**
   * Applies transformations (filters, properties, and custom functions) to the JSON data.
   *
   * @private
   * @function _applyDataTransformations
   *
   * @param {Object|Array} jsonDataObj - The parsed JSON data to transform.
   * @param {HTMLElement} myContainer - The container element with transformation attributes.
   * @param {*} jsonFeatures - A JSON parser (e.g., JSON or JSON5).
   *
   * @returns {Object|Array} The transformed JSON data with applied filters and indices.
   */
  _applyDataTransformations(jsonDataObj, myContainer, jsonFeatures) {
    this.logger.info('_applyDataTransformations', 'templateManager')
    let processedData = jsonDataObj

    processedData = this._applyInitFromProperty(processedData, myContainer)
    processedData = this._applyInitSearch(processedData, myContainer)

    processedData = this._applyProcessDataFunctions(
      processedData,
      myContainer,
      jsonFeatures,
    )

    return this._addBlapyIndices(processedData)
  }

  /**
   * Applies the `data-blapy-template-init-fromproperty` filter to extract a nested property from the JSON data.
   *
   * @private
   * @function _applyInitFromProperty
   *
   * @param {Object} jsonDataObj - The JSON data object to filter.
   * @param {HTMLElement} myContainer - The container element with the `data-blapy-template-init-fromproperty` attribute.
   *
   * @returns {Object|Array} The extracted property value or the original JSON data if no matching property is found.
   */
  _applyInitFromProperty(jsonDataObj, myContainer) {
    this.logger.info('_applyInitFromProperty', 'templateManager')
    if (
      !myContainer.hasAttribute('data-blapy-template-init-fromproperty') ||
      myContainer.getAttribute('data-blapy-template-init-fromproperty') === ''
    ) {
      return jsonDataObj
    }

    try {
      this.logger.info(
        'Apply data-blapy-template-init-fromproperty: ' +
        myContainer.getAttribute('data-blapy-template-init-fromproperty'),
      )

      const initFromProp = myContainer.getAttribute(
        'data-blapy-template-init-fromproperty',
      )

      if (initFromProp) {
        const keys = initFromProp.split('.')
        return keys.reduce((acc, key) => {
          return acc[key] !== undefined ? acc[key] : acc
        }, jsonDataObj)
      }

      return jsonDataObj
    } catch (e) {
      this.logger.error(
        'init-search or init-property does not work well on json data of container: ' +
        myContainer.id,
        'templateManager',
      )
      return jsonDataObj
    }
  }

  /**
   * Applies the `data-blapy-template-init-search` filter to search and filter elements in the JSON data.
   *
   * @private
   * @function _applyInitSearch
   *
   * @param {Object|Array} jsonDataObj - The JSON data to filter.
   * @param {HTMLElement} myContainer - The container element with the `data-blapy-template-init-search` attribute.
   *
   * @returns {Object|Array} A filtered list of JSON objects or the original data if no matches are found.
   */
  _applyInitSearch(jsonDataObj, myContainer) {
    this.logger.info('_applyInitSearch', 'templateMnager')
    const initSearch = myContainer.getAttribute(
      'data-blapy-template-init-search',
    )

    if (!initSearch || initSearch === '') {
      return jsonDataObj
    }

    try {
      this.logger.info(
        'Apply data-blapy-template-init-search: ' +
        myContainer.getAttribute('data-blapy-template-init-search'),
      )

      let jsonData = JSON.stringify(jsonDataObj)

      jsonDataObj = initSearch
        .split(',')
        .map((item) => item.split('=='))
        .reduce((acc, item) => {
          const founds = this.getObjects(jsonDataObj, item[0], item[1])
          if (founds.length)
            return acc.concat(founds)
          else
            return acc
        }, [])

      jsonDataObj = jsonDataObj.filter((thing, index) => {
        return index === jsonDataObj.findIndex(obj => {
          return JSON.stringify(obj) === JSON.stringify(thing)
        })
      })

      return jsonDataObj
    } catch (e) {
      this.logger.error(
        'init-search or init-property does not work well on json data of container: ' +
        myContainer.id,
        'templateManager',
      )
      return jsonDataObj
    }
  }

  /**
   * Applies custom data processing functions defined in the
   * `data-blapy-template-init-processdata` attribute to the JSON data.
   *
   * @private
   * @function _applyProcessDataFunctions
   *
   * @param {Object|Array} jsonDataObj - The JSON data to process.
   * @param {HTMLElement} myContainer - The container element with the `data-blapy-template-init-processdata` attribute.
   * @param {*} jsonFeatures - A JSON parser (e.g., JSON or JSON5).
   *
   * @returns {Object|Array} The processed JSON data, or the original data if no valid processing function is applied.
   */
  _applyProcessDataFunctions(jsonDataObj, myContainer, jsonFeatures) {
    this.logger.info('_applyProcessDataFunctions', 'templateManager')
    if (
      !myContainer.hasAttribute('data-blapy-template-init-processdata') ||
      myContainer.getAttribute('data-blapy-template-init-processdata') === ''
    ) {
      return jsonDataObj
    }

    let aJsonDataFunction = myContainer.getAttribute(
      'data-blapy-template-init-processdata',
    )
    if (aJsonDataFunction) {
      this.logger.info(
        'Apply data-blapy-template-init-processdata: ' + aJsonDataFunction,
      )

      aJsonDataFunction.split(',').forEach((aFunctionName) => {
        let previousJsonDataObj = jsonFeatures
        eval(
          'if (typeof ' +
          aFunctionName +
          ' === "function") ' +
          '   jsonDataObj=' +
          aFunctionName +
          '(jsonDataObj);' +
          'else ' +
          '    this.logger.error("' +
          aFunctionName +
          ' does not exist :(! ' +
          'Have a look on the : data-blapy-template-init-processdata of container ' +
          myContainer.id +
          '", "templateManager");',
        )

        if (typeof jsonDataObj !== 'object') {
          this.logger.error(
            'returned Json Data was not a json structure :(! Perhaps it is due to the processing of this function on them: ' +
            aJsonDataFunction,
            'templateManager',
          )
          jsonDataObj = previousJsonDataObj
        }
      })
    }

    return jsonDataObj
  }

  /**
   * Adds Blapy-specific index properties (`blapyIndex`, `blapyFirst`, `blapyLast`)
   * to each element of the JSON data for template rendering.
   *
   * @private
   * @function _addBlapyIndices
   *
   * @param {Object|Array} jsonDataObj - The JSON data to which indices will be added.
   *
   * @returns {Object|Array} The JSON data with added Blapy index properties.
   */
  _addBlapyIndices(jsonDataObj) {
    if (jsonDataObj.length) {
      for (let i = 0; i < jsonDataObj.length; i++) {
        if (jsonDataObj[i].blapyIndex == undefined) {
          jsonDataObj[i].blapyIndex = i + 1
        }
        if (i == 0) jsonDataObj[i].blapyFirst = true
        if (i == jsonDataObj.length - 1) jsonDataObj[i].blapyLast = true
      }
    } else {
      jsonDataObj.blapyIndex = 0
    }

    return jsonDataObj
  }

  /**
   * Retrieves the HTML template from the specified container.
   *
   * @private
   * @function _getTemplate
   *
   * @param {HTMLElement} myContainer - The container element containing the template(s).
   *
   * @returns {{content: string, allTemplates: NodeList}|null} An object with the template content and all found templates, or `null` if none are found.
   */
  _getTemplate(myContainer) {


    let htmlTpl = ''
    let htmlAllTpl = myContainer.querySelectorAll('[data-blapy-container-tpl]')

    let htmlTplContent = ''

    let tplId = myContainer.getAttribute('data-blapy-template-default-id')

    if (tplId != undefined && tplId != '') {

      let selector = `:scope > [data-blapy-container-tpl][data-blapy-container-tpl-id='${tplId}']`
      htmlTpl = myContainer.querySelectorAll(selector)

      if (htmlTpl.length == 0) {
        this.logger.error(
          'The json template of id ' +
          tplId +
          ' was not found for the block ' +
          myContainer.getAttribute('data-blapy-container-name') +
          '!',
          'templateManager',
        )
      }
    }

    if (htmlTpl.length == 0) htmlTpl = htmlAllTpl

    if (htmlTpl.length == 0) {
      htmlTplContent = ''
      this.logger.error(
        'can not find any json template for the block: ' +
        myContainer.getAttribute('data-blapy-container-name'),
        'templateManager',
      )
      return null
    } else {
      htmlTplContent = htmlTpl[0].innerHTML
    }

    if (htmlTplContent.length < 3) {
      this.logger.error(
        'Template is void... ? ' +
        myContainer.getAttribute('data-blapy-container-name'),
        'templateManager',
      )
      return null
    }

    return {
      content: htmlTplContent,
      allTemplates: htmlAllTpl,
    }
  }

  /**
   * Generates the final HTML from the given JSON data and template.
   *
   * @private
   * @function _generateHtml
   *
   * @param {Object|Array} jsonDataObj - The JSON data used to populate the template.
   * @param {{content: string, allTemplates: NodeList}} template - The template object containing HTML content.
   * @param {HTMLElement} myContainer - The container element holding template configuration.
   *
   * @returns {string} The generated HTML string.
   */
  _generateHtml(jsonDataObj, template, myContainer) {
    let htmlTplContent = this._prepareTemplateContent(template.content)
    let newHtml = ''
    let parsed = false

    const jsonData = JSON.stringify(jsonDataObj)

    if (typeof Mustache != 'undefined') {
      let mustacheStartDelimiter = '{{'
      let mustacheEndDelimiter = '}}'
      let newDelimiters = ''

      if (
        myContainer.hasAttribute(
          'data-blapy-template-mustache-delimiterStart',
        ) &&
        myContainer.getAttribute(
          'data-blapy-template-mustache-delimiterStart',
        ) !== ''
      ) {
        mustacheStartDelimiter = myContainer.getAttribute(
          'data-blapy-template-mustache-delimiterStart',
        )
        mustacheEndDelimiter = myContainer.getAttribute(
          'data-blapy-template-mustache-delimiterEnd',
        )
        newDelimiters =
          '{{=' + mustacheStartDelimiter + ' ' + mustacheEndDelimiter + '=}}'
      }

      if (newDelimiters != '' || htmlTplContent.includes('{{')) {
        newHtml = Mustache.render(
          newDelimiters + mustacheStartDelimiter + '#.' + mustacheEndDelimiter +
          htmlTplContent +
          mustacheStartDelimiter + '/.' + mustacheEndDelimiter,
          jsonDataObj,
        )
        parsed = true
        console.log(newHtml)
      }

    }

    if (!parsed && typeof json2html != 'undefined') {

      newHtml = json2html.transform(jsonData, {
        'tag': 'void',
        'html': htmlTplContent,
      })
      newHtml = newHtml.replace(/<.?void>/g, '')
      parsed = true
    }

    if (!parsed) {
      this.logger.error(
        'no json parser loaded... need to include json2html or Mustache library! ',
        'templateManager',
      )
      alert(
        'no json parser loaded... need to include "json2html" or "Mustache" library!',
      )
      return ''
    }

    return newHtml
  }

  /**
   * Prepares and cleans the template content by replacing specific placeholder tags.
   *
   * @private
   * @function _prepareTemplateContent
   *
   * @param {string} content - The raw template content to prepare.
   *
   * @returns {string} The cleaned and ready-to-use template content.
   */
  _prepareTemplateContent(content) {
    return content
      .replace(/\|xmp/gi, 'xmp')
      .replace(/\|\/xmp/gi, '/xmp')
      .replace(/blapyScriptJS/gi, 'script')
  }

  /**
   * Injects the generated HTML into the container, applying optional header, footer, and wrapper templates.
   *
   * @private
   * @function _injectFinalHtml
   *
   * @param {string} generatedHtml - The final HTML string to inject.
   * @param {HTMLElement} myContainer - The container element where the HTML will be inserted.
   *
   * @returns {void} This function does not return a value.
   */
  _injectFinalHtml(generatedHtml, myContainer, blapy, template) {
    let newHtml = generatedHtml

    if (myContainer.hasAttribute('data-blapy-template-header')) {
      this.logger.info('Apply data-blapy-template-header')
      newHtml =
        myContainer.getAttribute('data-blapy-template-header') + newHtml
    }

    if (myContainer.hasAttribute('data-blapy-template-footer')) {
      this.logger.info('Apply data-blapy-template-footer')
      newHtml =
        newHtml + myContainer.getAttribute('data-blapy-template-footer')
    }

    if (myContainer.hasAttribute('data-blapy-template-wrap')) {
      this.logger.info('Apply data-blapy-template-wrap')

      const wrapTemplate = myContainer.getAttribute('data-blapy-template-wrap')
      const wrapperTemplate = document.createElement('div')

      wrapperTemplate.innerHTML = wrapTemplate
      wrapperTemplate.firstElementChild.innerHTML = newHtml
      newHtml = wrapperTemplate.firstElementChild.outerHTML
    }

    let tplList = ''
    if (template && template.allTemplates) {
      template.allTemplates.forEach((el) => {
        tplList += el.outerHTML
      })
    }

    myContainer.innerHTML = tplList + newHtml

    const scripts = myContainer.querySelectorAll('script')
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script')
      if (oldScript.src) {
        newScript.src = oldScript.src
      } else {
        newScript.textContent = oldScript.textContent
      }
      oldScript.parentNode.replaceChild(newScript, oldScript)
    })

    setTimeout(() => {

      const subJsonBlocks = myContainer.querySelectorAll('[data-blapy-update="json"]')

      if (subJsonBlocks.length > 0) {

        blapy.myFSM.trigger('blapyJsonTemplatesToSet')

        let templateManager = this;

        (async function() {
          for (const subContainer of subJsonBlocks) {
            templateManager.logger.error(`Initializing sub-block: ${subContainer.getAttribute('data-blapy-container-name')}`, 'templateManager')
            await templateManager.setBlapyContainerJsonTemplate(subContainer, blapy)
          }
          blapy.myFSM.trigger('blapyJsonTemplatesIsSet')
        })()
      } else {
        blapy.myFSM.trigger('blapyJsonTemplatesIsSet')
      }
    }, 0)
  }
}