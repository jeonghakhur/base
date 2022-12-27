import Data from './dom/data'
import { getElement } from './util/index'
import EventHandler from './dom/event-handler'

class BaseComponent {
  constructor(element, config) {
    
    element = getElement(element)
    if (!element) {
      return
    }

    this._element = element
    this._config = this._getConfig(config)

    Data.set(this._element, this.constructor.DATA_KEY, this)
  }

  // Public

  static get DATA_KEY() {
    return `ip.${this.NAME}`
  }

  static getInstance(element) {
    return Data.get(getElement(element), this.DATA_KEY)
  }
}

export default BaseComponent