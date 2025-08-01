/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : index.js
 * Point d'entrée principal pour Blapy V2
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview : Point d'entrée principal et exports pour Blapy V2
 * @see {@link https://github.com/intersel/blapy2}
 * @author : Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version : 2.0.0
 * @license : DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

export { Blapy, createBlapy } from './core/Blapy2.js';
export { Logger } from './core/Logger.js';
export { Utils } from './core/Utils.js';
export { AjaxService } from './core/AjaxService.js';
export { TemplateManager } from './core/TemplateManager.js';
export { Router } from './core/Router.js';
export { BlapyBlock } from './core/BlapyBlock.js';

import { enableJQueryLikeSyntax } from './modules/Compatibility.js';

enableJQueryLikeSyntax();

import Blapy from './core/Blapy2.js';
export default Blapy;