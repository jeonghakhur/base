import * as Popper from '@popperjs/core'
import BaseComponent from './base-component'
import EventHandler from './dom/event-handler'
import { defineJQueryPlugin, getElement, findShadowRoot, getUID, log } from './util/index'
import SelectorEngine from './dom/selector-engine'


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
  trigger: 'click'
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
    if (typeof Popper === 'undefined') {
      throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)')
    }
    
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
  show() {
    
    if (this._element.style.display === 'none') {
      throw new Error('Please use show on visible elements')
    }

    if (!(Boolean(this._config.title || this._config.originalTitle) && this._isEnabled)) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, 'show.tooltip')
    const shadowRoot = findShadowRoot(this._element)
    const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element)

    if (showEvent.defaultPrevented || !isInTheDom) {
      return
    }

    if (this.tip) {
      this.tip.remove()
      this.tip = null
    }

    this.tip = this._createTipElement()
  
    this._element.setAttribute('aria-describedby', this.tip.getAttribute('id'))

    const { container } = this._config

    if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
      container.append(this.tip)
      EventHandler.trigger(this._element, 'inserted.tooltip')
    }

    if (this._popper) {
      this._popper.update()
    } else {
      this._popper = this._createPopper(this.tip)
    }
    
    this.tip.classList.add('show')
    log([this.tip, this._element])

    const complete = () => {
      const previousHoverState = this._isHovered

      this._isHovered = false
      EventHandler.trigger(this._element, 'shown.tooltip')

      if (previousHoverState) {
        this._leave()
      }
    }

    this._queueCallback(complete, this.tip, this._isAnimated)
  }

  _createTipElement() {
    const templateWrapper = document.createElement('div')
    templateWrapper.innerHTML = this._config.template
    templateWrapper.querySelector('.tooltip-inner').textContent = this._config.originalTitle

    const tip = templateWrapper.children[0]
    tip.classList.remove('fade', 'show')
    tip.classList.add('tooltip-auto')

    const tipId = getUID(NAME).toString()
    tip.setAttribute('id', tipId)

    if (this._isAnimated()) {
      tip.classList.add('fade')
    }

    return tip
  }

  _createPopper(tip) {
    const { placement } = this._config
    return Popper.createPopper(this._element, tip, this._getPopperConfig(placement))
  }

  // Private
  _isAnimated() {
    return this._config.animation || (this.tip && this.tip.classList.contains('fade'))
  }

  _enter() {
    if (this._isShow() || this._isHovered) {
      this._isHovered = true
      return
    }

    this._isHovered = true

    this._setTimeout(() => {
      if (this._isHovered) {
        this.show()
      }
    }, this._config.delay.show)
  }

  _leave() {}

  _isShow() {
    return this.tip && this.tip.classList.contains('show')
  }

  _setTimeout(handler, timeout) {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(handler, timeout)
  }

  _leave() {}

  _setListeners() {
    const triggers = this._config.trigger.split(' ')

    for (const trigger of triggers) {
      if (trigger === 'click') {
        EventHandler.on(this._element, 'click.tooltip', false, event => this.show(event))
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

  _getOffset() {
    const { offset } = this._config

    if (typeof offset === 'string') {
      return offset.split(',').map(value => Number.parseInt(value, 10))
    }

    if (typeof offset === 'function') {
      return popperData => offset(popperData, this._element)
    }

    return offset
  }

  _getPopperConfig(attachment) {
    const defaultBsPopperConfig = {
      placement: attachment,
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        },
        {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        },
        {
          name: 'arrow',
          options: {
            element: `.tooltip-arrow`
          }
        }
      ]
    }

    return {
      ...defaultBsPopperConfig,
      ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
    }
  }

  _configAfterMerge(config) {
    config.container = config.container === false ? document.body : getElement(config.container)

    if (typeof config.delay === 'number') {
      config.delay = {
        show: config.delay,
        hide: config.delay
      }
    }

    config.originalTitle = this._element.getAttribute('title') || ''
    if (typeof config.title === 'number') {
      config.title = config.title.toString()
    }

    return config
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