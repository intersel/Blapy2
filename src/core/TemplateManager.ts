import { Logger } from './Logger'
import { AjaxService } from './AjaxService'
import { Utils } from './Utils'
import { Blapy } from './Blapy'
import { BlapyTemplate } from '#shared/types'
import JSON5 from 'json5'
import Mustache from 'mustache'
import 'node-json2html/json2html.js'
const json2html = (globalThis as any).json2html

export class TemplateManager {

  private templates = new Map()

  constructor(private readonly logger: Logger, private readonly ajaxService: AjaxService, private readonly utils: Utils) {
  }

  public async setBlapyContainerJsonTemplate(container: HTMLElement, blapy: Blapy, forceReload: boolean = false) {
    this.logger.info('setBlapyContainerJsonTemplate', 'template manager')
    container.dataset.blapyUpdateRule = 'local'

    let htmlTpl = (Array.from(container.children) as HTMLElement[]).filter((child : HTMLElement) =>
      Object.hasOwn(child.dataset, 'blapyContainerTpl'),
    );

    let htmlTplContent : string = container.innerHTML

    if (htmlTpl.length === 0) {
      try {
        const tempElement = document.createElement('div')
        tempElement.innerHTML = htmlTplContent.trim();
        const firstChild = tempElement.firstElementChild

        if (firstChild?.tagName === 'XMP') {
          htmlTplContent = firstChild.innerHTML
        }
      } catch {
        this.logger.error(
          'htmlTplContent from ' +
          container.id +
          ' is not html template...?\n' +
          htmlTplContent,
        )
      }

      if (
        htmlTplContent
          .replaceAll(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, '')
          .replaceAll(/\s{2,}/g, ' ')
          .replaceAll('\t', ' ')
          .replaceAll(/(\r\n|\n|\r)/g, '')
          .replaceAll(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, '')
          .trim() == ''
      ) {
        let tplFile = container.dataset.blapyTemplateFile

        let blapyData =
          container.dataset.blapyNoblapydata == '1'
            ? ''
            : 'blapycall=1&blapyaction=loadTpl&blapyobjectid=' +
            container.getAttribute('id')

        if (tplFile && !this.templates.has(tplFile)) {
          htmlTplContent = await this.ajaxService.get(tplFile, {
            params: blapyData,
          })
          htmlTplContent = htmlTplContent
            .replaceAll(/<!--(.*?)-->/gm, '')
            .replaceAll('\n\n', '\n')
            .replaceAll('\t\t', '\t')

          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = htmlTplContent.trim()

          if (tempDiv.firstElementChild?.tagName.toLowerCase() === 'xmp') {
            container.innerHTML = htmlTplContent
          } else {
            htmlTplContent =
              '<xmp style="display:none" data-blapy-container-tpl="true">' +
              htmlTplContent +
              '</xmp>'
            container.innerHTML = htmlTplContent
          }

          this.templates.set(tplFile, htmlTplContent)

          this.initializeJsonBlock(container, blapy, false)
        } else if (tplFile && this.templates.has(tplFile)) {
          this.logger.info('The templates use cache memory')
          container.innerHTML = this.templates.get(tplFile)
          this.initializeJsonBlock(container, blapy, false)
        } else {
          this.initializeJsonBlock(container, blapy, false)
        }
      } else {
        let tmpHtmlContent = htmlTplContent
          .replaceAll(/{{(.*?)}}/gm, '')
          .split('script')
          .join('scriptblapy')
          .split('img')
          .join('imgblapy')

        if (tmpHtmlContent.trim().toLowerCase().startsWith('<xmp')) {
          container.innerHTML = htmlTplContent
        } else {
          htmlTplContent =
            '<xmp style="display:none" data-blapy-container-tpl="true">' +
            htmlTplContent +
            '</xmp>'
          container.innerHTML = htmlTplContent
        }
        this.initializeJsonBlock(container, blapy, false)
      }
    } else if (forceReload) {
      this.initializeJsonBlock(container, blapy, true)
    }

  }
  
  private initializeJsonBlock(container : HTMLElement, blapy: Blapy, forceReload = false, ) {
    this.logger.info('initializeJsonBlock', 'template manager')

    const containerName = container.dataset.blapyContainerName
    const initURL = container.dataset.blapyTemplateInit

    //do we have to get the data only when block is displayed?
    if (
      !forceReload &&
      container.dataset.blapyUpdateblockOndisplay &&
      container.dataset.blapyAppear !== 'done'
    ) {
      return;
    }

    let aInitURL = container.dataset.blapyTemplateInit
    if (aInitURL) {

      let aInitURL_Param: any = container.dataset.blapyTemplateInitParams
      if (aInitURL_Param == undefined) {
        aInitURL_Param = {}
      } else if (typeof aInitURL_Param === 'string') {
        aInitURL_Param = JSON5.parse(aInitURL_Param)
      }

      let aInitURL_EmbeddingBlockId = container.dataset.blapyTemplateInitPurejson

      if (aInitURL_EmbeddingBlockId !== '0') {
        aInitURL_Param = {
          ...aInitURL_Param,
          embeddingBlockId: container.dataset.blapyContainerName,
        }
      }

      let noBlapyData = container.dataset.blapyNoblapydata
      noBlapyData ??= '0'

      let aInitURL_Method = container.dataset.blapyTemplateInitMethod
      aInitURL_Method ??= 'GET'

      blapy.myFSM.trigger('postData', {
        aUrl: aInitURL,
        params: aInitURL_Param,
        method: aInitURL_Method,
        noBlapyData: noBlapyData,
      })

    }

    if (container.id) {
      blapy.trigger('Blapy_templateReady', { detail: container })
    }
  }


  public getObjects(obj: any, key: string, val: any): any[] {
    let objects: any[] = []
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
        if (!objects.includes(obj)) {
          objects.push(obj)
        }
      }
    }
    return objects
  }

  async processJsonUpdate(
    tmpContainer : HTMLElement | null,
    myContainer : HTMLElement,
    aBlapyContainer : HTMLElement,
    Blapy: Blapy,
  ) {

    try {
      const jsonDataObj = await this.extractAndParseJsonData(
        tmpContainer,
        aBlapyContainer,
      )

      const containerName = myContainer.dataset.blapyContainerName

      if (!jsonDataObj) return

      const processedData = this.applyDataTransformations(
        jsonDataObj,
        myContainer,
      )


      const template = this.getTemplate(myContainer)


      if (!template) return

      const generatedHtml = this.generateHtml(
        processedData,
        template,
        myContainer,
      )



      this.injectFinalHtml(generatedHtml, myContainer, Blapy, template)

    } catch (error) {
      this.logger.error(
        `Erreur dans processJsonUpdate: ${error instanceof Error ? error.message : String(error)}`,
        'templateManager',
      )
    }
  }

  private async extractAndParseJsonData(tmpContainer : HTMLElement | null, aBlapyContainer: HTMLElement) {
    this.logger.info('_extractAndParseJsonData', 'templateManager')

    let jsonData = tmpContainer
      ? this.utils.atou(tmpContainer.innerHTML)
      : aBlapyContainer.innerHTML

    jsonData = jsonData.trim().replaceAll(/(\r\n|\n|\r)/g, '')

    try {
      const jsonDataObj = JSON5.parse(jsonData)
      return this.extractBlapyData(jsonDataObj, aBlapyContainer)
    } catch {
      this.logger.warn('Premier parsing échoué, tentative d\'extraction HTML', 'templateManager')

      try {
        // The JSON may be wrapped inside an HTML element (e.g. <xmp>…</xmp>);
        // extract the inner content, mirroring the old jQuery `$(jsonData).html()`.
        const wrapper = document.createElement('div')
        wrapper.innerHTML = jsonData
        jsonData = wrapper.firstElementChild?.innerHTML ?? jsonData

        const cleanedData = jsonData.replaceAll(/(\r\n|\n|\r)/g, '')
        const jsonDataObj = JSON5.parse(cleanedData)

        return this.extractBlapyData(jsonDataObj, aBlapyContainer)
      } catch {

        this.logger.error('Parsing impossible même après extraction HTML' + jsonData, 'templateManager')
        throw new Error('Parsing JSON impossible')
      }
    }
  }

  private extractBlapyData(jsonDataObj: any, container: Element | null = null) {
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

  private applyDataTransformations(jsonDataObj: any, myContainer: HTMLElement) {
    this.logger.info('_applyDataTransformations', 'templateManager')
    let processedData = jsonDataObj

    processedData = this.applyInitFromProperty(processedData, myContainer)
    processedData = this.applyInitSearch(processedData, myContainer)

    processedData = this.applyProcessDataFunctions(
      processedData,
      myContainer
    )

    return this.addBlapyIndices(processedData)
  }

  private getTemplate(myContainer : HTMLElement) {


    // Only the container's OWN templates (direct children). Templates nested
    // inside child blapy sub-blocks belong to those sub-blocks; including them
    // here leaks them into the parent (and, via injectFinalHtml re-injecting
    // template.allTemplates, accumulates them and breaks template resolution
    // when data-blapy-template-default-id matches a leaked sub-block template).
    let htmlAllTpl = myContainer.querySelectorAll(':scope > [data-blapy-container-tpl]')
    let htmlTpl: NodeListOf<Element> = htmlAllTpl

    let htmlTplContent = ''

    let tplId = myContainer.dataset.blapyTemplateDefaultId

    if (tplId != undefined && tplId != '') {

      let selector = `:scope > [data-blapy-container-tpl][data-blapy-container-tpl-id='${tplId}']`
      htmlTpl = myContainer.querySelectorAll(selector)

      if (htmlTpl.length == 0) {
        this.logger.error(
          'The json template of id ' +
          tplId +
          ' was not found for the block ' +
          myContainer.dataset.blapyContainerName +
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
        myContainer.dataset.blapyContainerName,
        'templateManager',
      )
      return null
    } else {
      htmlTplContent = htmlTpl[0].innerHTML
    }

    if (htmlTplContent.length < 3) {
      this.logger.error(
        'Template is void... ? ' +
        myContainer.dataset.blapyContainerName,
        'templateManager',
      )
      return null
    }

    return {
      content: htmlTplContent,
      allTemplates: htmlAllTpl,
    }
  }

  private generateHtml(jsonDataObj : any, template : BlapyTemplate, myContainer : HTMLElement) {
    let htmlTplContent = this.prepareTemplateContent(template.content);
    let newHtml = '';
    let parsed = false;

    if (!jsonDataObj) {
      this.logger.warn(
        'jsonDataObj is null... cannot generate html from template and so returning void html',
        'templateManager.generateHtml',
      )
      return '';
    }

    const hasCustomDelimiter =
      Object.hasOwn(myContainer.dataset, 'blapyTemplateMustacheDelimiterstart') &&
      myContainer.dataset.blapyTemplateMustacheDelimiterstart !== '';

    // Mustache and json2html are both bundled, so the engine can't be picked from
    // library presence anymore: choose it from the template's own syntax.
    // json2html uses ${var}, Mustache uses {{var}}. A template with ${...} and no
    // {{...}} (and no custom Mustache delimiter) is a json2html template.
    const useJson2html =
      !hasCustomDelimiter &&
      htmlTplContent.includes('${') &&
      !htmlTplContent.includes('{{');

    if (Mustache !== undefined && !useJson2html) {
      let mustacheStartDelimiter = '{{';
      let mustacheEndDelimiter = '}}';
      let newDelimiters = '';

      if (hasCustomDelimiter) {
        mustacheStartDelimiter = myContainer.dataset.blapyTemplateMustacheDelimiterstart ?? '';
        mustacheEndDelimiter = myContainer.dataset.blapyTemplateMustacheDelimiterend ?? '';
        newDelimiters =
          '{{=' + mustacheStartDelimiter + ' ' + mustacheEndDelimiter + '=}}';
      }

      newHtml = Mustache.render(
        newDelimiters + mustacheStartDelimiter + '#.' + mustacheEndDelimiter +
        htmlTplContent +
        mustacheStartDelimiter + '/.' + mustacheEndDelimiter,
        jsonDataObj,
      );
      parsed = true;

    }

    if (!parsed && json2html !== undefined) {
      // node-json2html v3: render each item wrapped in a <void> tag, then strip
      // the wrapper (the ${var} substitution happens inside `html`).
      newHtml = json2html.render(jsonDataObj, {
        '<>': 'void',
        'html': htmlTplContent,
      });
      newHtml = newHtml.replaceAll(/<\/?void>/g, '');
      parsed = true;
    }

    if (!parsed) {
      this.logger.error(
        'no json parser loaded... need to include json2html or Mustache library! ',
        'templateManager.generateHtml',
      );
      alert(
        'no json parser loaded... need to include "json2html" or "Mustache" library!',
      );
      return ''
    }

    return newHtml;
  }

  private injectFinalHtml(generatedHtml : string, myContainer : HTMLElement, blapy : Blapy, template : BlapyTemplate) {
    let newHtml = generatedHtml

    if (Object.hasOwn(myContainer.dataset, 'blapyTemplateHeader')) {
      this.logger.info('Apply data-blapy-template-header')
      newHtml =
        myContainer.dataset.blapyTemplateHeader + newHtml
    }

    if (Object.hasOwn(myContainer.dataset, 'blapyTemplateFooter')) {
      this.logger.info('Apply data-blapy-template-footer')
      newHtml =
        newHtml + myContainer.dataset.blapyTemplateFooter
    }

    if (Object.hasOwn(myContainer.dataset, 'blapyTemplateWrap')) {
      this.logger.info('Apply data-blapy-template-wrap')

      const wrapTemplate = myContainer.dataset.blapyTemplateWrap
      const wrapperTemplate = document.createElement('div')

      wrapperTemplate.innerHTML = wrapTemplate ?? ''
      const wrapped = wrapperTemplate.firstElementChild
      if (wrapped) {
        wrapped.innerHTML = newHtml
        newHtml = wrapped.outerHTML
      }
    }

    let tplList = ''
    if (template?.allTemplates) {
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
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })

    setTimeout(() => {

      const subJsonBlocks = myContainer.querySelectorAll('[data-blapy-update="json"]')

      if (subJsonBlocks.length > 0) {

        blapy.myFSM.trigger('blapyJsonTemplatesToSet')

        let templateManager = this;

        (async function() {
          for (const subContainer of subJsonBlocks) {
            await templateManager.setBlapyContainerJsonTemplate(subContainer as HTMLElement, blapy)
          }
         blapy.myFSM.trigger('blapyJsonTemplatesIsSet')
        })()
      } else {
        blapy.myFSM.trigger('blapyJsonTemplatesIsSet')
      }
    }, 0)
  }

  private applyInitFromProperty(jsonDataObj : any, myContainer : HTMLElement) {
    this.logger.info('_applyInitFromProperty', 'templateManager')
    if (
      !Object.hasOwn(myContainer.dataset, 'blapyTemplateInitFromproperty') ||
      myContainer.dataset.blapyTemplateInitFromproperty === ''
    ) {
      return jsonDataObj
    }

    try {
      this.logger.info(
        'Apply data-blapy-template-init-fromproperty: ' +
        myContainer.dataset.blapyTemplateInitFromproperty,
      )

      const initFromProp = myContainer.dataset.blapyTemplateInitFromproperty

      if (initFromProp) {
        const keys = initFromProp.split('.')
        return keys.reduce((acc, key) => {
          return acc[key] === undefined ? acc : acc[key]
        }, jsonDataObj)
      }

      return jsonDataObj
    } catch {
      this.logger.error(
        'init-search or init-property does not work well on json data of container: ' +
        myContainer.id,
        'templateManager',
      )
      return jsonDataObj
    }
  }

  private  applyInitSearch(jsonDataObj : any, myContainer : HTMLElement) {
    this.logger.info('_applyInitSearch', 'templateMnager')
    const initSearch = myContainer.dataset.blapyTemplateInitSearch

    if (!initSearch || initSearch === '') {
      return jsonDataObj
    }

    try {
      this.logger.info(
        'Apply data-blapy-template-init-search: ' +
        myContainer.dataset.blapyTemplateInitSearch,
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

      jsonDataObj = jsonDataObj.filter((thing: any, index: number) => {
        return index === jsonDataObj.findIndex((obj: any) => {
          return JSON.stringify(obj) === JSON.stringify(thing)
        })
      })

      return jsonDataObj
    } catch {
      this.logger.error(
        'init-search or init-property does not work well on json data of container: ' +
        myContainer.id,
        'templateManager',
      )
      return jsonDataObj
    }
  }

  private applyProcessDataFunctions(jsonDataObj : any, myContainer: HTMLElement) {
    this.logger.info('_applyProcessDataFunctions', 'templateManager')
    if (
      !Object.hasOwn(myContainer.dataset, 'blapyTemplateInitProcessdata') ||
      myContainer.dataset.blapyTemplateInitProcessdata === ''
    ) {
      return jsonDataObj
    }

    let aJsonDataFunction = myContainer.dataset.blapyTemplateInitProcessdata
    if (aJsonDataFunction) {
      this.logger.info(
        'Apply data-blapy-template-init-processdata: ' + aJsonDataFunction,
      )

      aJsonDataFunction.split(',').forEach((aFunctionName) => {
        let previousJsonDataObj = JSON5;
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

  private addBlapyIndices(jsonDataObj : any) {
    if (!jsonDataObj) return jsonDataObj
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

  private  prepareTemplateContent(content: string): string {
    return content
      .replaceAll(/\|xmp/gi, 'xmp')
      .replaceAll(/\|\/xmp/gi, '/xmp')
      .replaceAll(/blapyScriptJS/gi, 'script')
  }



}