import { Blapy } from '../core/Blapy';
import { BlapyOptions } from "#shared/types"

HTMLElement.prototype.Blapy = function (this: HTMLElement, options: BlapyOptions = {}): Blapy {
  if (this._blapyInstance) {
    return this._blapyInstance;
  }

  const instance = new Blapy(this, options);
  instance.initApplication();
  this._blapyInstance = instance;
  return instance;
};