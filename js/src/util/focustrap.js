import EventHandler from '../dom/event-handler'
import SelectorEngine from '../dom/selector-engine'
import Config from './config'

const NAME = 'focustrap'
const EVENT_KEY = `.${NAME}`

const Default = {
  autofocus: true,
  trapElement: null
}

const DefaultType = {
  autofocus: 'boolean',
  trapElement: 'element'
}

class FocusTrap extends Config {
  constructor(config) {
    super()
    this._config = this._getConfig(config)
    this._isActive = false
    this._lastTabNavDirection = null
  }

  // Getters
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  activate() {
    if (this._isActive) {
      return
    }

    if (this._config.autofocus) {
      this._config.trapElement.focus()
    }

    EventHandler.off(document, EVENT_KEY)
    EventHandler.on(document, `focusin${EVENT_KEY}`, event => this._handleFocusin(event))
    EventHandler.on(document, `keydown.tab${EVENT_KEY}`, event => this._handleKeydown(event))

    this._isActive = true
  }

  deactivate() {
    if (!this._isActive) {
      return
    }

    this._isActive = false
    EventHandler.off(document, EVENT_KEY)
  }

  _handleFocusin(event) {
    const { trapElement } = this._config
    const { target } = event

    if (target === document || target === trapElement || trapElement.contains(target)) {
      return
    }

    const elements = SelectorEngine.focusableChildren(trapElement)

    if (elements.length === 0) {
      trapElement.focus()
    } else if (this._lastTabNavDirection === 'backward') {
      elements[elements.length - 1].focus()
    } else {
      elements[0].focus()
    }
  }

  _handleKeydown(event) {
    if (event.key !== 'Tab') {
      return
    }

    this._lastTabNavDirection = event.shiftKey ? 'backward' : 'forward'
  }
}

export default FocusTrap