import { getElementFromSelector } from './util/index'
import BaseComponent from './base-component'
import EventHandler from './dom/event-handler'
import SelectorEngine from './dom/selector-engine'
import BackDrop from './util/backdrop'

const NAME = 'modal'
const DATA_KEY = 'ip.modal'
const EVENT_KEY = `.${DATA_KEY}`

class Modal extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._dialog = SelectorEngine.findOne('.modal-dialog', this._element)
    this._backdrop = this._initializeBackDrop()
    this._isShow = false
    this._isTransitioning = false
  }

  // Getter
  static get NAME() {
    return NAME
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

    document.body.classList.add('modal-open')

    // this._backdrop.show(() => this._showElement(relatedTarget))
  }

  hide() {

  }

  _initializeBackDrop() {
    return new BackDrop({
      trapElement: this._element
    })
  }







}

EventHandler.on(document, 'click.modal.data-api', '[data-toggle="modal"]', function(event) {
  
  const data = Modal.getOrCreateInstance(this)

  data.toggle(this)
})

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-toggle="modal"]').dispatchEvent(new Event('click'))
})

export default Modal