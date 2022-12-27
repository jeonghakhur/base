const elementMap = new Map();

export default {
  set(element, key, instance) {
    
    if (!elementMap.has(element)) {
      elementMap.set(element, new Map())
    }

    const instanceMap = elementMap.get(element)

    if (!instanceMap.has(key) && instanceMap.size !== 0) {
      console.log(`요소당 둘 이상의 인스턴스를 허용하지 않습니다. 바인딩된 인스턴스: ${Array.from(instanceMap.keys())[0]}.`)
      return
    }

    instanceMap.set(key, instance)
  },

  get(element, key) {
    if (elementMap.has(element)) {
      return elementMap.get(element).get(key) || null
    }

    return null
  },

  remove(element, key) {
    if (!elementMap.has(element)) {
      return
    }

    const instanceMap = elementMap.get(element)

    instanceMap.delete(key)

    if (instanceMap.size === 0) {
      elementMap.delete(element)
    }
  }
}