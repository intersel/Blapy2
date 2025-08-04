/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapyBlock.js
 * BlapyBlock : Service responsible for managing and updating Blapy blocks (V2)
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview BlapyBlock service – Handles initialization, update intervals, and
 *               JSON template management for Blapy containers.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 *
 */

export class BlapyBlock {

    /**
     * Constructor of the BlapyBlocks class.
     *
     * Initializes a BlapyBlocks instance with its properties based on the data attributes
     * of the provided HTML element.
     *
     * @constructor
     * @param {Logger} logger - The logger instance for managing debug and error messages.
     *
     * @param {templateManager} templateManager - The template manager instance
     * @example
     * // HTML element with required data attributes
     * // <div id="myBlock"
     * //      data-blapy-container-name="userList"
     * //      data-blapy-update="refresh"
     * //      data-blapy-container-content="users"
     * //      data-blapy-template-file="user-template.html">
     * // </div>
     * const element = document.getElementById('myBlock');
     * const blapyBlock = new BlapyBlocks(element, logger);
     */
    constructor(logger, templateManager) {
        this.logger = logger;
        this.templateManager = templateManager;
        this.blocks = new Map();
        this.intervalsSet = new Map();
        this.blapy = null;

        this.logger.info('BlapyBlocks initialized', 'blocks');
    }

    /**
     * Sets the reference to the main Blapy instance.
     *
     * @param {Object} blapyInstance - The Blapy instance.
     */
    setBlapyInstance(blapyInstance) {
        this.blapy = blapyInstance;
    }

    /**
     * Initializes all Blapy blocks within a container.
     * Compatible with Blapy V1 initialization.
     *
     * @param {HTMLElement} container - The main container element.
     */
    initializeBlocks(container) {
        this.logger.info('Initializing Blapy blocks', 'blocks');

        const blapyContainers = container.querySelectorAll('[data-blapy-container="true"]');

        blapyContainers.forEach(block => {
            const blockName = block.getAttribute('data-blapy-container-name');
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

    /**
     * Configures automatic update intervals for Blapy blocks.
     *
     * This method scans all blocks with the attribute `data-blapy-updateblock-time`
     * and sets periodic updates (via `setInterval`) to refresh their content by triggering
     * the `loadUrl` event of the FSM.
     *
     * - Each block must have both `data-blapy-updateblock-time` (interval in ms)
     *   and `data-blapy-href` (URL to fetch).
     * - If these attributes are missing, warnings are logged.
     * - All previously configured intervals are cleared before setting new ones.
     *
     * @function setBlapyUpdateIntervals
     * @returns {void}
     *
     * @example
     * // Set automatic update intervals for all applicable Blapy blocks
     * blapyBlock.setBlapyUpdateIntervals();
     */
    setBlapyUpdateIntervals() {
        this.logger.info('Setting up update intervals', 'blocks');

        this.intervalsSet.forEach(interval => clearInterval(interval));
        this.intervalsSet.clear();

        const blocksWithInterval = this.blapy.myUIObject.querySelectorAll('[data-blapy-updateblock-time]');

        let intervalIndex = 0;

        blocksWithInterval.forEach(block => {
            const updateTime = parseInt(block.getAttribute('data-blapy-updateblock-time'));
            const href = block.getAttribute('data-blapy-href');
            const containerName = block.getAttribute('data-blapy-container-name');
            const noBlapyData = block.getAttribute('data-blapy-noblapydata');

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

}