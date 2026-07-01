import { Blapy, createBlapy } from './core/Blapy.js';
import { Logger } from './core/Logger.js';
import { Utils } from './core/Utils.js';
import { AjaxService } from './core/AjaxService.js';
import { TemplateManager } from './core/TemplateManager.js';
import { Router } from './core/Router.js';
import { BlapyBlock } from './core/BlapyBlock.js';
import Blapymotion from './modules/BlapyMotion.js';
import BlapySocket from './modules/BlapySocket.js';

// Side-effect import: installs HTMLElement.prototype.Blapy (V1 compatibility)
import './modules/HTMLCompatibility.js';

window.Blapy = {
  Blapy,
  createBlapy,
  Logger,
  Utils,
  AjaxService,
  TemplateManager,
  Router,
  BlapyBlock,
  Blapymotion,
  BlapySocket,
};