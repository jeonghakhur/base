import { getElementFromSelector, isDisabled } from "./index"
import EventHandler from "../dom/event-handler"

const enableDismissTrigger = (component, method = 'hide') => {
  const clickEvent = `click.dismiss${component.EVENT_KEY}`
  const name = component.NAME

  EventHandler.on(document, clickEvent, `[data-dismiss="${name}"]`, function(event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault()
    }

    if (isDisabled(this)) {
      return
    }

    const target = getElementFromSelector(this) || this.closest(`.${name}`)
    const instance = component.getOrCreateInstance(target)
    console.log(target)

    instance[method]()
  })
}

export {
  enableDismissTrigger
}