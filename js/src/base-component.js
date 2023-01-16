import Data from './dom/data'
import { executeAfterTransition, getElement } from './util/index'
import EventHandler from './dom/event-handler'
import Config from './util/config'

class BaseComponent extends Config {
  constructor(element, config) {
    super()
    
    element = getElement(element)
    if (!element) {
      return
    }

    this._element = element
    this._config = this._getConfig(config)

    Data.set(this._element, this.constructor.NAME, this)
  }

  // Public
  dispose() {
    Data.remove(this._element, this.constructor.NAME)
    EventHandler.off(this._element, this.constructor.EVENT_KEY)

    for (const propertyName of Object.getOwnPropertyNames(this)) {
      this[propertyName] = null
    }
  }

  _queueCallback(callback, element, isAnimated = true) {
    executeAfterTransition(callback, element, isAnimated)
  }

  _getConfig(config) {
    config = this._mergeConfigObj(config, this._element)
    config = this._configAfterMerge(config)
    this._typeCheckConfig(config)
    return config
  }

  // Static
  static getInstance(element) {
    return Data.get(getElement(element), this.NAME)
  }

  static getOrCreateInstance(element, config = {}) {
    return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null)
  }
}

export default BaseComponent