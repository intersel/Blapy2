/**
 * Tests for TemplateManager class
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TemplateManager } from '../../src/core/TemplateManager.js'

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}

const mockAjaxService = {
  get: vi.fn(),
  post: vi.fn(),
  request: vi.fn()
}

const mockUtils = {
  atou: vi.fn((str) => atob(str)),
  utoa: vi.fn((str) => btoa(str))
}

const mockBlapy = {
  myFSM: {
    trigger: vi.fn()
  },
  trigger: vi.fn(),
  myUIObjectID: 'test-blapy-id'
}

global.JSON5 = {
  parse: vi.fn((str) => JSON.parse(str)),
  stringify: vi.fn((obj) => JSON.stringify(obj))
}

global.Mustache = {
  render: vi.fn((template, data) => `<div>Rendered: ${JSON.stringify(data)}</div>`)
}

global.json2html = {
  transform: vi.fn((data, template) => `<div>json2html: ${data}</div>`)
}

global.$ = vi.fn((selector) => ({
  html: vi.fn(() => '<div>mock html</div>'),
  filter: vi.fn(() => ({ add: vi.fn(() => ({ first: vi.fn(() => ({ get: vi.fn(() => [{ id: 'test' }]) })) })) })),
  find: vi.fn(() => ({ first: vi.fn(() => ({ get: vi.fn(() => [{ id: 'test' }]) })) }))
}))

describe('TemplateManager', () => {
  let templateManager

  beforeEach(() => {
    templateManager = new TemplateManager(mockLogger, mockAjaxService, mockUtils)
    vi.clearAllMocks()
    
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with provided dependencies', () => {
      expect(templateManager.logger).toBe(mockLogger)
      expect(templateManager.ajaxService).toBe(mockAjaxService)
      expect(templateManager.utils).toBe(mockUtils)
      expect(templateManager.templates).toBeInstanceOf(Map)
    })

    it('should log initialization', () => {
      expect(templateManager).toBeDefined()
      expect(templateManager.templates).toBeInstanceOf(Map)
    })
  })

  describe('setBlapyContainerJsonTemplate', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'test-container'
      container.setAttribute('data-blapy-container-name', 'testContainer')
      document.body.appendChild(container)
    })

    it('should set update rule to local', async () => {
      await templateManager.setBlapyContainerJsonTemplate(container, mockBlapy)
      
      expect(container.getAttribute('data-blapy-update-rule')).toBe('local')
      expect(mockLogger.info).toHaveBeenCalledWith('setBlapyContainerJsonTemplate', 'template manager')
    })

    it('should handle empty template content and load from file', async () => {
      container.setAttribute('data-blapy-template-file', 'test-template.html')
      container.innerHTML = ''
      
      mockAjaxService.get.mockResolvedValue('<div>{{title}}</div>')
      
      await templateManager.setBlapyContainerJsonTemplate(container, mockBlapy)
      
      expect(mockAjaxService.get).toHaveBeenCalledWith('test-template.html', {
        params: 'blapycall=1&blapyaction=loadTpl&blapyobjectid=test-container'
      })
      expect(templateManager.templates.has('test-template.html')).toBe(true)
    })

    it('should use cached template when available', async () => {
      const templateFile = 'cached-template.html'
      const templateContent = '<xmp data-blapy-container-tpl="true">{{name}}</xmp>'
      
      container.setAttribute('data-blapy-template-file', templateFile)
      container.innerHTML = ''
      
      templateManager.templates.set(templateFile, templateContent)
      
      await templateManager.setBlapyContainerJsonTemplate(container, mockBlapy)
      
      expect(mockAjaxService.get).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('The templates use cache memory')
    })
  })

  describe('getObjects', () => {
    const testObj = {
      users: [
        { id: 1, name: 'John', role: 'admin' },
        { id: 2, name: 'Jane', role: 'user' },
        { id: 3, name: 'Bob', role: 'admin' }
      ],
      settings: {
        theme: 'dark',
        role: 'admin'
      }
    }

    it('should find objects by key and value', () => {
      const result = templateManager.getObjects(testObj, 'role', 'admin')
      
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ id: 1, name: 'John', role: 'admin' })
      expect(result[2]).toEqual({ theme: 'dark', role: 'admin' })
    })

    it('should find objects by key only', () => {
      const result = templateManager.getObjects(testObj, 'name', '')
      
      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('John')
    })

    it('should find objects by value only', () => {
      const result = templateManager.getObjects(testObj, '', 'dark')
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ theme: 'dark', role: 'admin' })
    })

    it('should handle nested objects', () => {
      const nestedObj = {
        level1: {
          level2: {
            level3: { target: 'found' }
          }
        }
      }
      
      const result = templateManager.getObjects(nestedObj, 'target', 'found')
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ target: 'found' })
    })
  })

  describe('_initializeJsonBlock', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'test-container'
      container.setAttribute('data-blapy-container-name', 'testContainer')
      document.body.appendChild(container)
    })

    it('should trigger FSM events for template initialization', () => {
      container.setAttribute('data-blapy-template-init', '/api/data')
      
      templateManager._initializeJsonBlock(container, false, mockBlapy)
      
      expect(mockBlapy.myFSM.trigger).toHaveBeenCalledWith('postData', {
        aUrl: '/api/data',
        params: { embeddingBlockId: 'testContainer' },
        method: 'GET',
        noBlapyData: '0'
      })
    })

    it('should handle initialization with custom parameters', () => {
      container.setAttribute('data-blapy-template-init', '/api/data')
      container.setAttribute('data-blapy-template-init-params', '{"filter":"active"}')
      container.setAttribute('data-blapy-template-init-method', 'POST')
      
      templateManager._initializeJsonBlock(container, false, mockBlapy)
      
      expect(mockBlapy.myFSM.trigger).toHaveBeenCalledWith('postData', {
        aUrl: '/api/data',
        params: { filter: 'active', embeddingBlockId: 'testContainer' },
        method: 'POST',
        noBlapyData: '0'
      })
    })

    it('should skip initialization when updateblock-ondisplay is set but not appeared', () => {
      container.setAttribute('data-blapy-template-init', '/api/data')
      container.setAttribute('data-blapy-updateblock-ondisplay', 'true')
      
      templateManager._initializeJsonBlock(container, false, mockBlapy)
      
      expect(mockBlapy.myFSM.trigger).not.toHaveBeenCalled()
    })

    it('should trigger Blapy_templateReady event', () => {
      templateManager._initializeJsonBlock(container, false, mockBlapy)
      
      expect(mockBlapy.trigger).toHaveBeenCalledWith('Blapy_templateReady', { detail: container })
    })
  })

  describe('processJsonUpdate', () => {
    let myContainer, aBlapyContainer

    beforeEach(() => {
      myContainer = document.createElement('div')
      myContainer.id = 'test-container'
      myContainer.setAttribute('data-blapy-container-name', 'testContainer')
      myContainer.innerHTML = '<xmp data-blapy-container-tpl="true">{{name}}</xmp>'
      
      aBlapyContainer = document.createElement('div')
      aBlapyContainer.innerHTML = '{"name": "John", "age": 30}'
      
      document.body.appendChild(myContainer)
    })

    it('should process JSON update successfully', async () => {
      const extractSpy = vi.spyOn(templateManager, '_extractAndParseJsonData')
        .mockResolvedValue({ name: 'John', age: 30 })
      const transformSpy = vi.spyOn(templateManager, '_applyDataTransformations')
        .mockReturnValue({ name: 'John', age: 30, blapyIndex: 0 })
      const templateSpy = vi.spyOn(templateManager, '_getTemplate')
        .mockReturnValue({ content: '{{name}}', allTemplates: [] })
      const generateSpy = vi.spyOn(templateManager, '_generateHtml')
        .mockReturnValue('<div>John</div>')
      const injectSpy = vi.spyOn(templateManager, '_injectFinalHtml')
      
      await templateManager.processJsonUpdate(null, myContainer, aBlapyContainer, JSON, mockBlapy)
      
      expect(extractSpy).toHaveBeenCalled()
      expect(transformSpy).toHaveBeenCalled()
      expect(templateSpy).toHaveBeenCalled()
      expect(generateSpy).toHaveBeenCalled()
      expect(injectSpy).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(templateManager, '_extractAndParseJsonData')
        .mockRejectedValue(new Error('Parse error'))
      
      await templateManager.processJsonUpdate(null, myContainer, aBlapyContainer, JSON, mockBlapy)
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erreur dans processJsonUpdate: Parse error',
        'templateManager'
      )
    })
  })

  describe('_extractAndParseJsonData', () => {
    let aBlapyContainer

    beforeEach(() => {
      aBlapyContainer = document.createElement('div')
    })

    it('should parse JSON data successfully', async () => {
      aBlapyContainer.innerHTML = '{"name": "John", "age": 30}'
      global.$ = vi.fn(() => ({
        html: vi.fn(() => '{"name": "John", "age": 30}')
      }))
      
      const result = await templateManager._extractAndParseJsonData(null, aBlapyContainer, JSON)
      
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should handle encoded data from tmpContainer', async () => {
      const tmpContainer = document.createElement('xmp')
      tmpContainer.innerHTML = btoa('{"name": "Jane"}')
      
      mockUtils.atou.mockReturnValue('{"name": "Jane"}')
      global.$ = vi.fn(() => ({
        html: vi.fn(() => btoa('{"name": "Jane"}'))
      }))
      
      const result = await templateManager._extractAndParseJsonData(tmpContainer, aBlapyContainer, JSON)
      
      expect(mockUtils.atou).toHaveBeenCalled()
      expect(result).toEqual({ name: 'Jane' })
    })

    it('should handle parsing errors with retry mechanism', async () => {
      aBlapyContainer.innerHTML = 'invalid json'
      global.$ = vi.fn()
        .mockReturnValueOnce({
          html: vi.fn(() => 'invalid json')
        })
        .mockReturnValueOnce({
          html: vi.fn(() => '{"name": "recovered"}')
        })
      
      JSON.parse = vi.fn()
        .mockImplementationOnce(() => { throw new Error('Parse error') })
        .mockImplementationOnce(() => ({ name: 'recovered' }))
      
      const result = await templateManager._extractAndParseJsonData(null, aBlapyContainer, JSON)
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Premier parsing échoué, tentative d\'extraction HTML', 'templateManager')
      expect(result).toEqual({ name: 'recovered' })
    })

    it('should throw error when all parsing attempts fail', async () => {
      aBlapyContainer.innerHTML = 'completely invalid'
      global.$ = vi.fn(() => ({
        html: vi.fn(() => 'completely invalid')
      }))
      
      JSON.parse = vi.fn(() => { throw new Error('Parse error') })
      
      await expect(templateManager._extractAndParseJsonData(null, aBlapyContainer, JSON))
        .rejects.toThrow('Parsing JSON impossible')
    })
  })

  describe('_extractBlapyData', () => {
    it('should extract blapy-data when present and container matches', () => {
      const jsonDataObj = {
        'blapy-data': { items: [1, 2, 3] },
        'blapy-container-name': 'testContainer'
      }
      const container = {
        getAttribute: vi.fn().mockReturnValue('testContainer')
      }
      
      const result = templateManager._extractBlapyData(jsonDataObj, container)
      
      expect(result).toEqual({ items: [1, 2, 3] })
    })

    it('should return null when container name does not match', () => {
      const jsonDataObj = {
        'blapy-data': { items: [1, 2, 3] },
        'blapy-container-name': 'differentContainer'
      }
      const container = {
        getAttribute: vi.fn().mockReturnValue('testContainer')
      }
      
      const result = templateManager._extractBlapyData(jsonDataObj, container)
      
      expect(result).toBeNull()
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should return original object when no blapy-data', () => {
      const jsonDataObj = { items: [1, 2, 3] }
      
      const result = templateManager._extractBlapyData(jsonDataObj)
      
      expect(result).toEqual({ items: [1, 2, 3] })
    })
  })

  describe('_applyDataTransformations', () => {
    let container, jsonData

    beforeEach(() => {
      container = document.createElement('div')
      jsonData = [
        { id: 1, name: 'John', status: 'active' },
        { id: 2, name: 'Jane', status: 'inactive' }
      ]
    })

    it('should apply all transformations in correct order', () => {
      const fromPropSpy = vi.spyOn(templateManager, '_applyInitFromProperty').mockReturnValue(jsonData)
      const searchSpy = vi.spyOn(templateManager, '_applyInitSearch').mockReturnValue(jsonData)
      const processSpy = vi.spyOn(templateManager, '_applyProcessDataFunctions').mockReturnValue(jsonData)
      const indicesSpy = vi.spyOn(templateManager, '_addBlapyIndices').mockReturnValue(jsonData)
      
      templateManager._applyDataTransformations(jsonData, container, JSON)
      
      expect(fromPropSpy).toHaveBeenCalledWith(jsonData, container)
      expect(searchSpy).toHaveBeenCalledWith(jsonData, container)
      expect(processSpy).toHaveBeenCalledWith(jsonData, container, JSON)
      expect(indicesSpy).toHaveBeenCalledWith(jsonData)
    })
  })

  describe('_applyInitFromProperty', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
    })

    it('should extract nested property', () => {
      const jsonData = {
        data: {
          users: [{ name: 'John' }, { name: 'Jane' }]
        }
      }
      container.setAttribute('data-blapy-template-init-fromproperty', 'data.users')
      
      const result = templateManager._applyInitFromProperty(jsonData, container)
      
      expect(result).toEqual([{ name: 'John' }, { name: 'Jane' }])
    })

    it('should return original data when no property specified', () => {
      const jsonData = { name: 'John' }
      
      const result = templateManager._applyInitFromProperty(jsonData, container)
      
      expect(result).toEqual({ name: 'John' })
    })

    it('should handle missing property gracefully', () => {
      const jsonData = { name: 'John' }
      container.setAttribute('data-blapy-template-init-fromproperty', 'missing.property')
      
      const result = templateManager._applyInitFromProperty(jsonData, container)
      
      expect(result).toEqual({ name: 'John' })
    })
  })

  describe('_applyInitSearch', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'test-container'
    })

    it('should filter objects by search criteria', () => {
      const jsonData = [
        { id: 1, status: 'active', type: 'user' },
        { id: 2, status: 'inactive', type: 'user' },
        { id: 3, status: 'active', type: 'admin' }
      ]
      container.setAttribute('data-blapy-template-init-search', 'status==active')
      
      vi.spyOn(templateManager, 'getObjects').mockReturnValue([
        { id: 1, status: 'active', type: 'user' },
        { id: 3, status: 'active', type: 'admin' }
      ])
      
      const result = templateManager._applyInitSearch(jsonData, container)
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(3)
    })

    it('should handle multiple search criteria', () => {
      const jsonData = [
        { id: 1, status: 'active', type: 'user' },
        { id: 2, status: 'inactive', type: 'user' }
      ]
      container.setAttribute('data-blapy-template-init-search', 'status==active,type==user')
      
      vi.spyOn(templateManager, 'getObjects')
        .mockReturnValueOnce([{ id: 1, status: 'active', type: 'user' }])
        .mockReturnValueOnce([{ id: 1, status: 'active', type: 'user' }])
      
      const result = templateManager._applyInitSearch(jsonData, container)
      
      expect(result).toHaveLength(1)
    })

    it('should return original data when no search specified', () => {
      const jsonData = [{ id: 1, name: 'John' }]
      
      const result = templateManager._applyInitSearch(jsonData, container)
      
      expect(result).toEqual(jsonData)
    })

    it('should handle search errors gracefully', () => {
      const jsonData = [{ id: 1, name: 'John' }]
      container.setAttribute('data-blapy-template-init-search', 'invalid==search')
      
      vi.spyOn(templateManager, 'getObjects').mockImplementation(() => {
        throw new Error('Search error')
      })
      
      const result = templateManager._applyInitSearch(jsonData, container)
      
      expect(result).toEqual(jsonData)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('_addBlapyIndices', () => {
    it('should add indices to array data', () => {
      const jsonData = [
        { name: 'John' },
        { name: 'Jane' },
        { name: 'Bob' }
      ]
      
      const result = templateManager._addBlapyIndices(jsonData)
      
      expect(result[0]).toEqual({ name: 'John', blapyIndex: 1, blapyFirst: true })
      expect(result[1]).toEqual({ name: 'Jane', blapyIndex: 2 })
      expect(result[2]).toEqual({ name: 'Bob', blapyIndex: 3, blapyLast: true })
    })

    it('should handle single object', () => {
      const jsonData = { name: 'John' }
      
      const result = templateManager._addBlapyIndices(jsonData)
      
      expect(result).toEqual({ name: 'John', blapyIndex: 0 })
    })

    it('should not override existing blapyIndex', () => {
      const jsonData = [
        { name: 'John', blapyIndex: 999 }
      ]
      
      const result = templateManager._addBlapyIndices(jsonData)
      
      expect(result[0].blapyIndex).toBe(999)
      expect(result[0].blapyFirst).toBe(true)
    })
  })

  describe('_getTemplate', () => {
    let container

    beforeEach(() => {
      container = document.createElement('div')
      container.setAttribute('data-blapy-container-name', 'testContainer')
    })

    it('should get template by ID when specified', () => {
      const template1 = document.createElement('xmp')
      template1.setAttribute('data-blapy-container-tpl', 'true')
      template1.setAttribute('data-blapy-container-tpl-id', 'template1')
      template1.innerHTML = '<div>Template 1</div>'
      
      const template2 = document.createElement('xmp')
      template2.setAttribute('data-blapy-container-tpl', 'true')
      template2.setAttribute('data-blapy-container-tpl-id', 'template2')
      template2.innerHTML = '<div>Template 2</div>'
      
      container.appendChild(template1)
      container.appendChild(template2)
      container.setAttribute('data-blapy-template-default-id', 'template2')
      
      const result = templateManager._getTemplate(container)
      
      expect(result.content).toBe('<div>Template 2</div>')
      expect(result.allTemplates).toHaveLength(2)
    })

    it('should use first template when no ID specified', () => {
      const template = document.createElement('xmp')
      template.setAttribute('data-blapy-container-tpl', 'true')
      template.innerHTML = '<div>Default Template</div>'
      container.appendChild(template)
      
      const result = templateManager._getTemplate(container)
      
      expect(result.content).toBe('<div>Default Template</div>')
    })

    it('should return null when no template found', () => {
      const result = templateManager._getTemplate(container)
      
      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith(
        'can not find any json template for the block: testContainer',
        'templateManager'
      )
    })

    it('should return null when template content is too short', () => {
      const template = document.createElement('xmp')
      template.setAttribute('data-blapy-container-tpl', 'true')
      template.innerHTML = 'x'
      container.appendChild(template)
      
      const result = templateManager._getTemplate(container)
      
      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Template is void... ? testContainer',
        'templateManager'
      )
    })
  })

  describe('_generateHtml', () => {
    let container, template

    beforeEach(() => {
      container = document.createElement('div')
      template = {
        content: '<div>{{name}}</div>',
        allTemplates: []
      }
    })

    it('should use Mustache when available', () => {
      const jsonData = { name: 'John' }
      
      const result = templateManager._generateHtml(jsonData, template, container)
      
      expect(global.Mustache.render).toHaveBeenCalledWith(
        '{{#.}}<div>{{name}}</div>{{/.}}',
        jsonData
      )
      expect(result).toBe('<div>Rendered: {"name":"John"}</div>')
    })

    it('should use custom Mustache delimiters when specified', () => {
      const jsonData = { name: 'John' }
      container.setAttribute('data-blapy-template-mustache-delimiterStart', '<%')
      container.setAttribute('data-blapy-template-mustache-delimiterEnd', '%>')
      template.content = '<div><%name%></div>'
      
      const result = templateManager._generateHtml(jsonData, template, container)
      
      expect(global.Mustache.render).toHaveBeenCalledWith(
        '{{=<% %>=}}<%#.%><div><%name%></div><%/.%>',
        jsonData
      )
    })

    it('should use json2html when Mustache is not available', () => {
      global.Mustache = undefined
      const jsonData = { name: 'John' }
      
      const result = templateManager._generateHtml(jsonData, template, container)
      
      expect(global.json2html.transform).toHaveBeenCalledWith(
        JSON.stringify(jsonData),
        { tag: 'void', html: '<div>{{name}}</div>' }
      )
      expect(result).toBe('<div>json2html: {"name":"John"}</div>')
    })

    it('should show error when no parser is available', () => {
      global.Mustache = undefined
      global.json2html = undefined
      global.alert = vi.fn()
      
      const result = templateManager._generateHtml({}, template, container)
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'no json parser loaded... need to include json2html or Mustache library! ',
        'templateManager'
      )
      expect(global.alert).toHaveBeenCalledWith(
        'no json parser loaded... need to include "json2html" or "Mustache" library!'
      )
      expect(result).toBe('')
    })
  })

  describe('_prepareTemplateContent', () => {
    it('should replace template placeholders', () => {
      const content = '|xmp class="test"|/xmp blapyScriptJS'
      
      const result = templateManager._prepareTemplateContent(content)
      
      expect(result).toBe('xmp class="test"/xmp script')
    })
  })

  describe('_injectFinalHtml', () => {
    let container, template

    beforeEach(() => {
      container = document.createElement('div')
      container.id = 'test-container'
      template = {
        content: '<div>{{name}}</div>',
        allTemplates: []
      }
      document.body.appendChild(container)
    })

    it('should inject HTML with header and footer', () => {
      container.setAttribute('data-blapy-template-header', '<header>Header</header>')
      container.setAttribute('data-blapy-template-footer', '<footer>Footer</footer>')
      
      templateManager._injectFinalHtml('<div>Content</div>', container, mockBlapy, template)
      
      expect(container.innerHTML).toBe('<header>Header</header><div>Content</div><footer>Footer</footer>')
    })

    it('should apply wrapper template', () => {
      container.setAttribute('data-blapy-template-wrap', '<section class="wrapper"></section>')
      
      templateManager._injectFinalHtml('<div>Content</div>', container, mockBlapy, template)
      
      expect(container.innerHTML).toBe('<section class="wrapper"><div>Content</div></section>')
    })

    it('should process sub JSON blocks', async () => {
      const subContainer = document.createElement('div')
      subContainer.setAttribute('data-blapy-update', 'json')
      
      return new Promise((resolve) => {
        templateManager._injectFinalHtml('<div>Content</div>', container, mockBlapy, template)
        container.appendChild(subContainer)
        
        setTimeout(() => {
          expect(mockBlapy.myFSM.trigger).toHaveBeenCalledWith('blapyJsonTemplatesToSet')
          resolve()
        }, 10)
      })
    })

    it('should replace script tags to make them executable', () => {
      const htmlWithScript = '<div>Content</div><script>console.log("test")</script>'
      
      templateManager._injectFinalHtml(htmlWithScript, container, mockBlapy, template)
      
      const scripts = container.querySelectorAll('script')
      expect(scripts).toHaveLength(1)
      expect(scripts[0].textContent).toBe('console.log("test")')
    })

    it('should handle script tags with src attribute', () => {
      const htmlWithScript = '<div>Content</div><script src="test.js"></script>'
      
      templateManager._injectFinalHtml(htmlWithScript, container, mockBlapy, template)
      
      const scripts = container.querySelectorAll('script')
      expect(scripts).toHaveLength(1)
      expect(scripts[0].src).toContain('test.js')
    })

    it('should include template list in final HTML', () => {
      const template1 = document.createElement('xmp')
      template1.setAttribute('data-blapy-container-tpl', 'true')
      template1.innerHTML = 'Template 1'
      
      const template2 = document.createElement('xmp')
      template2.setAttribute('data-blapy-container-tpl', 'true')
      template2.innerHTML = 'Template 2'
      
      const templateWithAll = {
        content: '<div>Content</div>',
        allTemplates: [template1, template2]
      }
      
      templateManager._injectFinalHtml('<div>Generated</div>', container, mockBlapy, templateWithAll)
      
      expect(container.innerHTML).toContain('Template 1')
      expect(container.innerHTML).toContain('Template 2')
      expect(container.innerHTML).toContain('<div>Generated</div>')
    })
  })

  describe('Error handling', () => {
    it('should handle errors in setBlapyContainerJsonTemplate', async () => {
      const container = document.createElement('div')
      container.setAttribute('data-blapy-template-file', 'test.html')
      
      mockAjaxService.get.mockRejectedValue(new Error('Network error'))
      
      await expect(templateManager.setBlapyContainerJsonTemplate(container, mockBlapy))
        .rejects.toThrow('Network error')
    })

    it('should handle malformed JSON gracefully', async () => {
      const container = document.createElement('div')
      const aBlapyContainer = document.createElement('div')
      aBlapyContainer.innerHTML = 'invalid json {'
      
      global.$ = vi.fn(() => ({
        html: vi.fn(() => 'invalid json {')
      }))
      
      JSON.parse = vi.fn(() => { throw new Error('Malformed JSON') })
      
      await templateManager.processJsonUpdate(null, container, aBlapyContainer, JSON, mockBlapy)
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erreur dans processJsonUpdate: Parsing JSON impossible',
        'templateManager'
      )
    })

    it('should handle missing template files', async () => {
      const container = document.createElement('div')
      container.setAttribute('data-blapy-template-file', 'missing.html')
      container.innerHTML = ''
      
      mockAjaxService.get.mockRejectedValue(new Error('File not found'))
      
      await expect(templateManager.setBlapyContainerJsonTemplate(container, mockBlapy))
        .rejects.toThrow('File not found')
    })
  })

  describe('Integration scenarios', () => {

    it('should handle template with filters and transformations', async () => {
      const container = document.createElement('div')
      container.id = 'filtered-test'
      container.setAttribute('data-blapy-container-name', 'filteredList')
      container.setAttribute('data-blapy-template-init-fromproperty', 'users')
      container.setAttribute('data-blapy-template-init-search', 'status==active')
      container.innerHTML = '<xmp data-blapy-container-tpl="true"><div>{{name}}</div></xmp>'
      
      const testData = {
        users: [
          { name: 'John', status: 'active' },
          { name: 'Jane', status: 'inactive' },
          { name: 'Bob', status: 'active' }
        ]
      }
      
      const aBlapyContainer = document.createElement('div')
      aBlapyContainer.innerHTML = JSON.stringify(testData)
      
      global.$ = vi.fn(() => ({
        html: vi.fn(() => JSON.stringify(testData))
      }))
      
      document.body.appendChild(container)
      
      await templateManager.processJsonUpdate(null, container, aBlapyContainer, JSON, mockBlapy)
      
      expect(container.innerHTML).toContain('xmp')
    })

    it('should handle template caching correctly', async () => {
      const templateFile = 'cached-template.html'
      const templateContent = '<xmp data-blapy-container-tpl="true">{{title}}</xmp>'
      
      const container1 = document.createElement('div')
      container1.id = 'cache-test-1'
      container1.setAttribute('data-blapy-template-file', templateFile)
      container1.innerHTML = ''
      
      mockAjaxService.get.mockResolvedValue(templateContent)
      
      await templateManager.setBlapyContainerJsonTemplate(container1, mockBlapy)
      
      expect(mockAjaxService.get).toHaveBeenCalledTimes(1)
      expect(templateManager.templates.has(templateFile)).toBe(true)
      
      const container2 = document.createElement('div')
      container2.id = 'cache-test-2'
      container2.setAttribute('data-blapy-template-file', templateFile)
      container2.innerHTML = ''
      
      mockAjaxService.get.mockClear()
      
      await templateManager.setBlapyContainerJsonTemplate(container2, mockBlapy)
      
      expect(mockAjaxService.get).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('The templates use cache memory')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty JSON data', async () => {
      const container = document.createElement('div')
      const aBlapyContainer = document.createElement('div')
      aBlapyContainer.innerHTML = ''
      
      global.$ = vi.fn(() => ({
        html: vi.fn(() => '')
      }))
      
      await templateManager.processJsonUpdate(null, container, aBlapyContainer, JSON, mockBlapy)
      
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle null/undefined values in data transformations', () => {
      const container = document.createElement('div')
      
      const result1 = templateManager._applyInitFromProperty(null, container)
      expect(result1).toBeNull()
      
      const result2 = templateManager._applyInitSearch(undefined, container)
      expect(result2).toBeUndefined()
    })

    it('should handle containers without required attributes', () => {
      const container = document.createElement('div')
      
      templateManager._initializeJsonBlock(container, false, mockBlapy)
      
      expect(mockBlapy.trigger).not.toHaveBeenCalledWith('Blapy_templateReady', { detail: container })
    })

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`
      }))
      
      const result = templateManager._addBlapyIndices([...largeDataset])
      
      expect(result).toHaveLength(1000)
      expect(result[0].blapyFirst).toBe(true)
      expect(result[999].blapyLast).toBe(true)
      expect(result[500].blapyIndex).toBe(501)
    })

    it('should handle special characters in template content', () => {
      const content = '<div>Special chars: àéîôù & < > " \'</div>'
      
      const result = templateManager._prepareTemplateContent(content)
      
      expect(result).toContain('Special chars: àéîôù & < > " \'')
    })

    it('should handle circular references in JSON data', () => {
      const circularData = { name: 'Test' }
      circularData.self = circularData
      
      expect(() => {
        templateManager._extractBlapyData(circularData)
      }).not.toThrow()
    })
  })
})