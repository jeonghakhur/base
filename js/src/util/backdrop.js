import { execute, getElement, executeAfterTransition, reflow } from './index'
import EventHandler from '../dom/event-handler'
import Config from './config';

const NAME = 'backdrop'
const EVENT_KEY = `.${NAME}`

const Default = {
  className: 'modal-backdrop',
  clickCallback: null,
  isAnimated: false,
  isVisible: true,
  rootElement: 'body'
}

const DefaultType = {
  className: 'string',
  clickCallback: '(function|null)',
  isAnimated: 'boolean',
  isVisible: 'boolean',
  rootElement: '(element|string)'
}

export class BackDrop extends Config {
  constructor(config) {
    super();
    
    this._config = this._getConfig(config);
    this._isAppended = false
    this._element = null
  }

  static get Default() {
    return Default;
  }
  static get DefaultType() {
    return DefaultType;
  }

  static get NAME() {
    return NAME;
  }

  // Public
  show(callback) {
    if (!this._config.isVisible) {
      execute(callback)
      return
    }

    this._append()

    const element = this._getElement()
    if (this._config.isAnimated) {
      reflow(element)
    }

    element.classList.add('show')

    this._emulateAnimation(() => {
      execute(callback)
    })
  }

  hide(callback) {
    if (!this._config.isVisible) {
      execute(callback)
      return
    }

    this._getElement().classList.remove('show')

    this._emulateAnimation(() => {
      this.dispose()
      execute(callback)
    })
  }

  dispose() {
    if (!this._isAppended) {
      return
    }

    EventHandler.off(this._element, `mousedown${EVENT_KEY}`)

    this._element.remove()
    this._isAppended = false
  }

  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement('div')
      backdrop.className = this._config.className
      if (this._config.isAnimated) {
        backdrop.classList.add('fade')
      }

      this._element = backdrop
    }

    return this._element
  }

  // Private
  _configAfterMerge(config) {
    config.rootElement = getElement(config.rootElement)
    return config
  }

  _append() {
    if (this._isAppended) {
      return
    }

    const element = this._getElement()
    this._config.rootElement.append(element)

    EventHandler.on(element, `mousedown${EVENT_KEY}`, () => {
      execute(this._config.clickCallback)
    })

    this._isAppended = true
  }

  _emulateAnimation(callback) {
    executeAfterTransition(callback, this._getElement(), this._config.isAnimated)
  }
}

export default BackDrop