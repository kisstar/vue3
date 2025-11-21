export function isString(value) {
  return typeof value === 'string'
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isObject(value) {
  return value !== null && typeof value === 'object'
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function hasChanged(value, oldValue) {
  return !Object.is(value, oldValue)
}

export function isOn(key: string) {
  return /^on[A-Z]/.test(key)
}
