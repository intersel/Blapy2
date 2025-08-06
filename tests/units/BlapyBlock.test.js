import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BlapyBlock } from '../../src/core/BlapyBlock.js'
import { Logger } from '../../src/core/Logger.js'
import { TemplateManager } from '../../src/core/TemplateManager.js'

describe('BlapyBlock', () => {
  let logger, templateManager, blapyBlock, mockBlapy, container

  beforeEach(() => {
    logger = new Logger({ debug: true, logLevel: 3 })
    templateManager = {
      dummy: true
    }

    blapyBlock = new BlapyBlock(logger, templateManager)

    mockBlapy = {
      myUIObject: document.createElement('div'),
      myUIObjectID: 'test-blapy',
      myFSM: { trigger: vi.fn() }
    }

    container = document.createElement('div')
    container.innerHTML = `
      <div data-blapy-container="true" data-blapy-container-name="testBlock" id="block1"></div>
      <div data-blapy-container="true" id="blockWithoutName"></div>
    `
  })

  it('should initialize blocks and register them', () => {
    blapyBlock.initializeBlocks(container)
    expect(blapyBlock.blocks.has('testBlock')).toBe(true)
  })

  it('should warn if block has no container name', () => {
    const warnSpy = vi.spyOn(logger, 'warn')
    blapyBlock.initializeBlocks(container)
    expect(warnSpy).toHaveBeenCalledWith('Block without container name found', 'blocks')
  })

  it('should set update intervals if data-blapy-updateblock-time is present', () => {
    blapyBlock.setBlapyInstance(mockBlapy)

    const block = document.createElement('div')
    block.setAttribute('data-blapy-updateblock-time', '1000')
    block.setAttribute('data-blapy-href', '/update')
    block.setAttribute('data-blapy-container-name', 'testIntervalBlock')
    mockBlapy.myUIObject.appendChild(block)

    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    blapyBlock.setBlapyUpdateIntervals()

    expect(setIntervalSpy).toHaveBeenCalled()
  })

  it('should warn if update time or href is missing', () => {
    blapyBlock.setBlapyInstance(mockBlapy)

    const block = document.createElement('div')
    block.setAttribute('data-blapy-updateblock-time', '')
    block.setAttribute('data-blapy-container-name', 'invalidBlock')
    mockBlapy.myUIObject.appendChild(block)

    const warnSpy = vi.spyOn(logger, 'warn')

    blapyBlock.setBlapyUpdateIntervals()

    expect(warnSpy).toHaveBeenCalled()
  })
})
