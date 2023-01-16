import { getElementFromSelector, reflow } from './util/index'
import BaseComponent from './base-component'
import EventHandler from './dom/event-handler'
import SelectorEngine from './dom/selector-engine'
import BackDrop from './util/backdrop'
import FocusTrap from './util/focustrap'
import { enableDismissTrigger } from './util/component-function'
import ScrollBarHelper from './util/scrollbar'

const NAME = 'modal'
const EVENT_KEY = `${EVENT_KEY}`

const Default = {
  backdrop: true,
  focus: true,
  keyboard: true
}

const DefaultType = {
  backdrop: '(boolean|string)',
  focus: 'boolean',
  keyboard: 'boolean',
}

class Modal extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._dialog = SelectorEngine.findOne('.modal-dialog', this._element)
    this._backdrop = this._initializeBackDrop()
    this._focustrap = this._initializeFocusTrap()
    this._isShow = false
    this._isTransitioning = false
    this._scrollBar = new ScrollBarHelper()

    console.log(this._config)
    this._addEventListeners()
  }

  // Getter
  static get Default() {
    return Default
  }

  static get DefalutType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  static get EVENT_KEY() {
    return EVENT_KEY
  }

  toggle(relatedTarget) {
    return this._isShow ? this.hide() : this.show(relatedTarget)
  }

  show(relatedTarget) {
    if (this._isShow || this._isTransitioning) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, 'show.modal', {
      relatedTarget
    })

    if (showEvent.defaultPrevented) {
      return
    }

    this._isShow = true
    this._isTransitioning = true

    this._scrollBar.hide()

    document.body.classList.add('modal-open')

    this._backdrop.show(() => this._showElement(relatedTarget))
  }

  hide() {
    if (!this._isShow || this._isTransitioning) {
      return
    }

    const hideEvent = EventHandler.trigger(this._element, `hide${EVENT_KEY}`)

    if (hideEvent.defaultPrevented) {
      return
    }

    this._isShow = false
    this._isTransitioning = true
    this._focustrap.deactivate()

    this._element.classList.remove('show')

    this._queueCallback(() => this._hideModal(), this._element, this._isAnimated())
  }



  _showElement(relatedTarget) {
    if (!document.body.contains(this._element)) {
      document.body.append(this._element)
    }

    this._element.style.display = 'block'
    this._element.removeAttribute('aria-hidden')
    this._element.setAttribute('aria-modla', true)
    this._element.setAttribute('role', 'dialog')
    this._element.scrollTop = 0

    const modalBody = SelectorEngine.findOne('.modal-body', this._dialog)
    if (modalBody) {
      modalBody.scrolTop = 0
    }

    reflow(this._element)

    this._element.classList.add('show')

    const transitionComplete = () => {
      if (this._config.focus) {
        this._focustrap.activate()
      }

      this._isTransitioning = false
      EventHandler.trigger(this._element, `shown${EVENT_KEY}`, {
        relatedTarget
      })
    }

    this._queueCallback(transitionComplete, this._dialog, this._isAnimated())
  }

  _hideModal() {
    this._element.style.display = 'none'
    this._element.setAttribute('aria-hidden', true)
    this._element.removeAttribute('aria-modal')
    this._element.removeAttribute('role')
    this._isTransitioning = false

    this._backdrop.hide(() => {
      document.body.classList.remove('modal-open')
      // this._resetAdjustments()
      this._scrollBar.reset()
      EventHandler.trigger(this._element, `hidden${EVENT_KEY}`)
    })
  }

  _addEventListeners() {
    EventHandler.on(this._element, `keydown.dismiss${EVENT_KEY}`, event => {
      if (event.key !== 'Escape') {
        return
      }

      if (this._config.keyboard) {
        event.preventDefault()
        this.hide()
        return
      }
    })

    EventHandler.on(this._element, `mousedown.dismiss${EVENT_KEY}`, event => {
      if (event.target !== event.currentTarget) {
        return
      }
      
      if (this._config.backdrop === 'static') {
        this._triggerBackdropTransition()
        return
      }

      if (this._config.backdrop) {
        this.hide()
      }
    })
  }

  _initializeBackDrop() {
    return new BackDrop({
      isVisible: Boolean(this._config.backdrop),
      isAnimated: this._isAnimated(),
      clickCallback: () => {
        this._backdrop.hide(() => console.log('hide'))
      }
    })
  }

  _initializeFocusTrap() {
    return new FocusTrap({
      trapElement: this._element
    })
  }

  _isAnimated() {
    return this._element.classList.contains('fade')
  }

  _triggerBackdropTransition() {
    const hideEvent = EventHandler.trigger(this._element, `hidePrevented${EVENT_KEY}`)
    if (hideEvent.defaultPrevented) {
      return
    }

    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight
    const initialOverflowY = this._element.style.overflowY

    if (initialOverflowY === 'hidden' || this._element.classList.contains('modal-static')) {
      return
    }

    console.log(initialOverflowY)

    if (!isModalOverflowing) {
      this._element.style.overflowY = 'hidden'
    }

    this._element.classList.add('modal-static')
    this._queueCallback(() => {
      this._element.classList.remove('modal-static')
      this._queueCallback(() => {
        this._element.style.overflowY = initialOverflowY
      }, this._dialog)
    }, this._dialog)

    this._element.focus()
  }
}

EventHandler.on(document, 'click.modal.data-api', '[data-toggle="modal"]', function(event) {
  const target = getElementFromSelector(this)
  
  const data = Modal.getOrCreateInstance(target)

  data.toggle(this)
})

enableDismissTrigger(Modal)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-toggle="modal"]').dispatchEvent(new Event('click'))
})

export default Modal