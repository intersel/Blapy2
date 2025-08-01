/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : browser-entry.js
 * Point d'entrée navigateur pour Blapy V2 (format IIFE)
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @see {@link https://github.com/intersel/blapy2}
 * @author : Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version : 2.0.0
 * @license : DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

import { Blapy, createBlapy } from './core/Blapy2.js';
import { Logger } from './core/Logger.js';
import { Utils } from './core/Utils.js';
import { AjaxService } from './core/AjaxService.js';
import { TemplateManager } from './core/TemplateManager.js';
import { Router } from './core/Router.js';
import { BlapyBlock } from './core/BlapyBlock.js';

// ⛓ Active l'extension HTMLElement.prototype.Blapy()
import * as BlapyCompat from './modules/Compatibility.js';
if (BlapyCompat.enableJQueryLikeSyntax) BlapyCompat.enableJQueryLikeSyntax();

// 👇 Attach à window pour debug/accès global éventuel
window.Blapy2 = {
  Blapy,
  createBlapy,
  Logger,
  Utils,
  AjaxService,
  TemplateManager,
  Router,
  BlapyBlock,
};
