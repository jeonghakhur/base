import Config from './config'

const NAME = 'backdrop'

const Default = {
  className: 'modal-backdrop',
  // clickCallback: null,
  // isAnimated: false,
  // isVisible: true,
  // rootElement: 'body'
}

const DefaultType = {
  className: 'string'
}

class BackDrop extends Config {
  constructor(config) {
    super()
    this._config = this._getConfig(config)
    console.log(this._config)
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }
}

export default BackDrop