import { Logger } from './Logger'
import { Blapy } from './Blapy'

export class BlapyBlock {

  private readonly blocks = new Map();
  private readonly intervalsSet = new Map();
  private blapy!: Blapy;

  constructor(private readonly logger: Logger) {
    this.logger.info('BlapyBlocks initialized', 'blocks');
  }

  public setBlapyInstance(blapyInstance : Blapy) {
    this.blapy = blapyInstance;
  }

  public initializeBlocks(container : HTMLElement) {
    this.logger.info('Initializing Blapy blocks', 'blocks');

    const blapyContainers = container.querySelectorAll<HTMLElement>('[data-blapy-container="true"]');

    blapyContainers.forEach(block => {
      const blockName = block.dataset.blapyContainerName;
      if (blockName) {
        // Only the element is cached
        this.blocks.set(blockName, {
          element: block,
          name: blockName
        });
        this.logger.info(`Block registered: ${blockName}`, 'blocks');
      } else {
        this.logger.warn('Block without container name found', 'blocks');
      }
    });
  }

  public setBlapyUpdateIntervals() {
    this.logger.info('Setting up update intervals', 'blocks');

    this.intervalsSet.forEach(interval => clearInterval(interval));
    this.intervalsSet.clear();

    const blocksWithInterval = this.blapy.myUIObject.querySelectorAll<HTMLElement>('[data-blapy-updateblock-time]');

    let intervalIndex = 0;

    blocksWithInterval.forEach(block => {
      const updateTime = Number.parseInt(block.dataset.blapyUpdateblockTime ?? '');
      const href = block.dataset.blapyHref;
      const containerName = block.dataset.blapyContainerName;
      const noBlapyData = block.dataset.blapyNoblapydata;

      if (updateTime && href) {
        this.logger.info(`Setting interval for ${containerName}: ${updateTime}ms`, 'blocks');

        const finalUrl = href + '?blapyContainerName=' + containerName;

        const intervalId = setInterval(() => {
          this.logger.info(`Interval triggered for ${containerName}`, 'blocks');

          this.blapy.myFSM.trigger('loadUrl', {
            aUrl: finalUrl,
            params: {},
            aObjectId: this.blapy.myUIObjectID,
            noBlapyData: noBlapyData
          });
        }, updateTime);

        this.intervalsSet.set(intervalIndex, intervalId);
        intervalIndex++;

        this.logger.info(`✅ Interval set for ${containerName}: ${updateTime}ms (index: ${intervalIndex - 1})`, 'blocks');
      } else {
        if (!updateTime) {
          this.logger.warn(`Block ${containerName} has no update time`, 'blocks');
        }
        if (!href) {
          this.logger.warn(`Block ${containerName} has no href`, 'blocks');
        }
      }
    });

    this.logger.info(`Total intervals set: ${this.intervalsSet.size}`, 'blocks');
  }

  /** Clears all update intervals and the block cache. */
  public destroy() {
    this.intervalsSet.forEach(interval => clearInterval(interval));
    this.intervalsSet.clear();
    this.blocks.clear();
    this.logger.info('BlapyBlocks destroyed', 'blocks');
  }

}