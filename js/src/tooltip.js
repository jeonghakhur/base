
import BaseComponent from './base-component'
import EventHandler from './dom/event-handler'
import { defineJQueryPlugin } from './util/index'

const NAME = 'tooltip'
const EVENT_KEY = `.${NAME}`

const Default = {
  allowList: {},
  animation: true,
  boundary: 'clippingParents',
  container: false,
  customClass: '',
  delay: 0,
  fallbackPlacements: ['top', 'right', 'bottom', 'left'],
  html: false,
  offset: [0, 0],
  placement: 'top',
  popperConfig: null,
  sanitize: true,
  sanitizeFn: null,
  selector: false,
  template: '<div class="tooltip" role="tooltip">' +
            '<div class="tooltip-arrow"></div>' +
            '<div class="tooltip-inner"></div>' +
            '</div>',
  title: '',
  trigger: 'hover focus'
}

const DefaultType = {
  allowList: 'object',
  animation: 'boolean',
  boundary: '(string|element)',
  container: '(string|element|boolean)',
  customClass: '(string|function)',
  delay: '(number|object)',
  fallbackPlacements: 'array',
  html: 'boolean',
  offset: '(array|string|function)',
  placement: '(string|function)',
  popperConfig: '(null|object|function)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  selector: '(string|boolean)',
  template: 'string',
  title: '(string|element|function)',
  trigger: 'string'
}

class Tooltip extends BaseComponent {
  constructor(element, config) {
    super(element, config)
    // console.clear()

    // Private
    this._isEnabled = true
    this._timeout = 0
    this._isHovered = false
    this._activeTrigger = {}
    this._popper = null
    this._templateFactory = null
    this._newContent = null

    // Protected
    this.tip = null

    this._setListeners()

  }

  // Getters
  static get NAME() {
    return NAME
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  // Public
  show() {}

  // Private
  _enter() {}

  _leave() {}

  _setListeners() {
    const triggers = this._config.trigger.split(' ')

    // for (const key in this._config) {
    //   if (this.constructor.Default[key] !== this._config[key]) {
    //     console.log(key)
    //   }
    // }

    console.log(this._config)

    for (const trigger of triggers) {
      if (trigger === 'click') {

      } else if (trigger !== 'manual') {
        const eventIn = trigger === 'hover' ? 'mouseenter' : 'focusin'
        const eventOut = trigger === 'hover' ? 'mouseleave': 'focusout'

        EventHandler.on(this._element, eventIn, false, event => {
          const data = Tooltip.getOrCreateInstance(this._element)
          
          data._activeTrigger[event.type === 'focusin' ? 'focus' : 'hover'] = true
          data._enter()
        })

        EventHandler.on(this._element, eventOut, event => {
          const data = Tooltip.getOrCreateInstance(this._element)
          console.log(event.relatedTarget, data._element)
          data._activeTrigger[event.type === 'focusout' ? 'focus' : 'hover'] = data._element.contains(event.relatedTarget)
          data._leave()
        })
      }
    }
    // console.log(this.constructor.eventName('click'))
  }

  _initializeOnDelegatedTarget(event) {
    return
  }


  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = Tooltip.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    })
  }
}

defineJQueryPlugin(Tooltip)



export default Tooltip