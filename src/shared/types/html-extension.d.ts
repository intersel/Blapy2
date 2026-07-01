import { Blapy, createBlapy } from '../../core/Blapy';
import { Logger } from '../../core/Logger';
import { Utils } from '../../core/Utils';
import { AjaxService } from '../../core/AjaxService';
import { TemplateManager } from '../../core/TemplateManager';
import { Router } from '../../core/Router';
import { BlapyBlock } from '../../core/BlapyBlock';
import Blapymotion from '../../modules/BlapyMotion';
import BlapySocket from '../../modules/BlapySocket';
import { BlapyOptions } from '#shared/types';

/** Global namespace exposed on `window.Blapy` by the browser entry point. */
export interface BlapyGlobal {
  Blapy: typeof Blapy;
  createBlapy: typeof createBlapy;
  Logger: typeof Logger;
  Utils: typeof Utils;
  AjaxService: typeof AjaxService;
  TemplateManager: typeof TemplateManager;
  Router: typeof Router;
  BlapyBlock: typeof BlapyBlock;
  Blapymotion: typeof Blapymotion;
  BlapySocket: typeof BlapySocket;
}

declare global {
  interface Window {
    Blapy: BlapyGlobal;
  }

  interface HTMLElement {
    Blapy(options?: BlapyOptions): Blapy;
    _blapyInstance?: Blapy;
  }
}