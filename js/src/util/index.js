const MAX_UID = 1_000_000
const MILLISECONDS_MULTIPLER = 1000
const TRANSITION_END = 'transitionend'

const toType = object => {
  if (object === null || object === undefined) {
    return `${object}`
  }

  return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase()
}

const getUID = prefix => {
  do {
    prefix += Math.floor(Math.random() * MAX_UID)
  } while (document.getElementById(prefix))

  return prefix
}

const isElement = (object) => {
  if (!object || typeof object !== 'object') {
    return false
  }

  if (typeof object.jquery !== 'undefined') {
    object = object[0]
  }

  return typeof object.nodeType !== 'undefined'
}

const getElement = object => {
  if (isElement(object)) {
    return object.jquery ? object[0] : object
  }

  if (typeof object === 'string' && object.length > 0) {
    return document.querySelector(object)
  }

  return null
}

const getTransitionDurationFromElement = element => {
  if (!element) {
    return 0
  }

  let { transitionDuration, transitionDelay } = window.getComputedStyle(element)

  const floatTransitionDuration = Number.parseFloat(transitionDuration)
  const floatTransitionDelay = Number.parseFloat(transitionDelay)

  if (!floatTransitionDuration && ! floatTransitionDelay) {
    return 0
  }

  transitionDuration = transitionDuration.split(',')[0]
  transitionDelay = transitionDelay.split(',')[0]

  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLER
}

const triggerTransitionEnd = element => {
  element.dispatchEvent(new Event(TRANSITION_END))
}

const execute = callback => {
  if (typeof callback === 'function') {
    callback()
  }
}

const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
  if (!waitForTransition) {
    execute(callback)
    return
  }

  const durationPadding = 5
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding
  let called = false
  
  const handler = ({target}) => {
    if (target !== transitionElement) {
      return
    }

    called = true
    transitionElement.removeEventListener(TRANSITION_END, handler)
    execute(callback)
  }

  transitionElement.addEventListener(TRANSITION_END, handler)
  setTimeout(() => {
    if (!called) {
      triggerTransitionEnd(transitionElement)
    }
  }, emulatedDuration)
}

const getjQuery = () => {
  if (window.jQuery && !document.body.hasAttribute('data-no-jquery')) {
    return window.jQuery
  }

  return null
}

const isDisabled = element => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true
  }

  if (element.classList.contains('disabled')) {                                                                                                                                     
    return true
  }

  if (typeof element.disabled !== 'undefined') {
    return element.disabled
  }

  return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false'
}

const isVisible = element => {
  if (!isElement(element) || element.getClientRects().length === 0) {
    return false
  }

  const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'

  return elementIsVisible
}

const getSelector = element => {
  let selector = element.getAttribute('data-target')

  if (!selector || selector === '#') {
    let hrefAttribute = element.getAttribute('href')

    if (!hrefAttribute || (!hrefAttribute.includes('#') && !hrefAttribute.startsWith('.'))) {
      return null
    }

    if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
      hrefAttribute = `#${hrefAttribute.split('#')[1]}`
    }

    selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null
  }

  return selector
}

const getElementFromSelector = element => {
  const selector = getSelector(element)

  return selector ? document.querySelector(selector) : null
}

const reflow = element => {
  element.offsetHeight
}

export {
  toType,
  getUID,
  isElement,
  getElement,
  getElementFromSelector,
  execute,
  executeAfterTransition,
  getjQuery,
  isDisabled,
  isVisible,
  reflow
}