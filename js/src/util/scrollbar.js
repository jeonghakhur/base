import { isElement } from "./index"
import Manipulator from "../dom/manipulator"
import SelectorEngine from "../dom/selector-engine"

const SELECTOR_FIXED_CONTENT = '[class*="fixed"]'
const PROPERTY_PADDING = 'padding-right'

class ScrollBarHelper {
  constructor() {
    this._element = document.body
  }

  getWidth() {
    const documentWidth = document.documentElement.clientWidth
    return Math.abs(window.innerWidth - documentWidth)
  }

  hide() {
    const width = this.getWidth()
    this._disableOverFlow()
    this._setElementAttributes(this._element, 'padding-right', calculatedValue => calculatedValue + width)
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width)
  }

  reset() {
    this._resetElementAttributes(this._element, 'overflow')
    this._resetElementAttributes(this._element, PROPERTY_PADDING)
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING)
  }

  // Private
  _disableOverFlow() {
    this._saveInitialAttribute(this._element, 'overflow')
    this._element.style.overflow = 'hidden'
  }

  _setElementAttributes(selector, styleProperty, callback) {
    const scrollbarWidth = this.getWidth()

    const manipulationCallback = element => {
      if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return
      }

      this._saveInitialAttribute(element, styleProperty)
      const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty)
      element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`)
    }

    this._applyManipulationCallback(selector, manipulationCallback)
  }

  _saveInitialAttribute(element, styleProperty) {
    const actualValue = element.style.getPropertyValue(styleProperty)

    if (actualValue) {
      Manipulator.setDataAttribute(element, styleProperty, actualValue)
    }
  }

  _resetElementAttributes(selector, styleProperty) {
    const manipulationCallback = element => {
      element.style.removeProperty(styleProperty)
    }

    this._applyManipulationCallback(selector, manipulationCallback)
  }

  _applyManipulationCallback(selector, callBack) {
    if (isElement(selector)) {
      callBack(selector)
      return
    }

    for (const sel of SelectorEngine.find(selector, this._element)) {
      callBack(sel)
    }
  }
}

export default ScrollBarHelper