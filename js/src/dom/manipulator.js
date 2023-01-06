function normalizeData(value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (value === Number(value).toString()) {
    return Number(value)
  }

  if (value === '' || value === 'null') {
    return null
  }

  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(decodeURIComponent(value))
  } catch {
    return value
  }
}

function normalizeDataKey(key) {
  return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`)
}

const Manipulator = {
  setDataAtrribute(element, key, value) {
    element.setAttribute(`data-ipx-${normalizeDataKey(key)}`, value)
  },

  removeDataAttribute(element, key) {
    element.removeAttribute(`data-ipx-${normalizeDataKey(key)}`)
  },

  getDataAttribute(element) {
    if (!element) {
      return {}
    }

    const attribute = {}
    const ipxKeys = Object.keys(element.dataset).filter(key => key.startsWith('ipx') && !key.startsWith('ipxConfig'))

    for (const key of ipxKeys) {
      let pureKey = key.replace(/^ipx/, '')
      pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length)
      attribute[pureKey] = normalizeData(element.dataset[key])
    }

    return attribute
  },

  getDataAttribute(element, key) {
    return normalizeData(element.getAttribute(`data-ipx-${normalizeDataKey(key)}`))
  }
}

export default Manipulator