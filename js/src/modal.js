import BaseComponent from './base-component'

const NAME = 'modal'

class Modal extends BaseComponent {
  constructor(element, config) {
    super(element)
    this.toggle()

  }

  // Getter
  static get NAME() {
    return NAME
  }

  // Public
  toggle() {
  }

}

export default Modal